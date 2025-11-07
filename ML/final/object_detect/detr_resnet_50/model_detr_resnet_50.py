import os
import sys
import torch
import torch.optim as optim 
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from PIL import Image
from torch.cuda.amp import autocast, GradScaler   # 顶部加入

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir)))

from model import Model # 假設這是你繼承的基類
from transformers import AutoImageProcessor, AutoModelForObjectDetection, AutoConfig
from torch.utils.tensorboard import SummaryWriter
from torch.utils.data import DataLoader
from dataset import CocoDataset

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from detr_resnet_50.config import model_config, train_config

# Load model directly
class detr_resnet_50(Model):
    def __init__(
        self,
        model_cfg: 'model_config',
        train_cfg: 'train_config',
        **kwargs
    ):
        super().__init__(model_cfg, train_cfg, **kwargs)
        self.model_cfg = model_cfg
        self.train_cfg = train_cfg

        # 初始化模型處理器
        self.processor = AutoImageProcessor.from_pretrained(
            model_cfg.name_or_path,
            do_resize=True,
            size={"shortest_edge": 800},  # 关键！短边 800
            do_rescale=True,
            do_normalize=True
        )

        # 加載模型配置，並更新類別數量
        config = AutoConfig.from_pretrained(
            model_cfg.name_or_path,
            num_labels=len(model_cfg.id2label),
            id2label=model_cfg.id2label,
            label2id=model_cfg.label2id,
        )
        
        # 使用更新後的 config 加載模型
        self.model = AutoModelForObjectDetection.from_pretrained(
            model_cfg.name_or_path,
            config=config,
            ignore_mismatched_sizes=True
        )

        self.model.to(self.device)
        
        # 將 DataLoader 初始化為 None，在需要時才創建
        self.train_loader = None
        self.val_loader = None
        self.mean = self.processor.image_mean
        self.std = self.processor.image_std

    def setup_data(self):
        """
        創建並設置訓練和驗證的 DataLoader。
        """
        print("Setting up data loaders...")
        self.train_loader = self._create_dataloader(split='train')
        self.val_loader = self._create_dataloader(split='valid')
        print("Data loaders created successfully.")

    def _create_dataloader(self, split: str) -> DataLoader:
        dataset = CocoDataset(
            root_dir=self.train_cfg.root_dir,
            workspace=self.train_cfg.workspace,
            project_name=self.train_cfg.project_name,
            version=self.train_cfg.version,
            split=split
        )

        def collate_fn(batch):
            images = [item[0] for item in batch]
            labels = [item[1] for item in batch]

            # 固定 800×800 → 完全不需要 padding
            target_size = (800, 800)
            resized_images = [img.resize(target_size, Image.BILINEAR) for img in images]

            encodings = self.processor(images=resized_images, return_tensors="pt")

            return {
                'pixel_values': encodings['pixel_values'],
                # 不再返回 pixel_mask
                'labels': labels
            }

        return DataLoader(
            dataset,
            collate_fn=collate_fn,
            batch_size=self.train_cfg.batch_size,   # 建议 1~2
            shuffle=(split == 'train'),
            num_workers=2,          # 防止 CPU 内存爆
            pin_memory=False,       # 显存紧张时关闭
            prefetch_factor=2
        )

    def show_dataset_sample(self, split='train'):
        """
        顯示一個數據集樣本及其標註框，用於驗證。
        """
        if split == 'train' and not self.train_loader:
            self.setup_data()
        elif split == 'valid' and not self.val_loader:
            self.setup_data()
        
        loader = self.train_loader if split == 'train' else self.val_loader
        
        # 獲取一個批次
        batch = next(iter(loader))
        pixel_values = batch['pixel_values'][0]  # 取第一張圖 (C, H, W)
        target = batch['labels'][0]              # 對應標註

        # DETR processor 通常使用 ImageNet 歸一化：mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
        # 這裡假設你用的是標準 processor（如 facebook/detr-resnet-50）
        img_tensor = pixel_values * torch.tensor(self.std).view(3,1,1) + torch.tensor(self.mean).view(3,1,1)
        img_tensor = img_tensor.clamp(0, 1)  # 確保在 [0,1]
        img_tensor = img_tensor.permute(1, 2, 0)  # (C,H,W) -> (H,W,C)
        img_np = (img_tensor.cpu().numpy() * 255).astype('uint8')
        image = Image.fromarray(img_np)

        # === 繪圖 ===
        fig, ax = plt.subplots(1, figsize=(12, 8))
        ax.imshow(image)

        img_height, img_width = image.size[1], image.size[0]  # PIL: (W, H)

        for box, label_id in zip(target['boxes'], target['class_labels']):
            cx, cy, w, h = box.tolist()
            x_min = (cx - w / 2) * img_width
            y_min = (cy - h / 2) * img_height
            box_w = w * img_width
            box_h = h * img_height
            
            rect = patches.Rectangle(
                (x_min, y_min), box_w, box_h,
                linewidth=2, edgecolor='red', facecolor='none'
            )
            ax.add_patch(rect)
            ax.text(
                x_min, y_min - 5,
                self.model_cfg.id2label[label_id.item()],
                color='white', backgroundcolor='red',
                fontsize=10, weight='bold'
            )

        ax.set_title(f"Dataset Sample - {split}")
        ax.axis('off')
        plt.tight_layout()
        plt.show()

    def train(self):
        if not self.train_loader or not self.val_loader:
            self.setup_data()

        optimizer = optim.AdamW(self.model.parameters(),
                                lr=self.train_cfg.learning_rate,
                                weight_decay=1e-4)
        writer = SummaryWriter(log_dir=self.train_cfg.log_dir)

        # ---------- 梯度累积 ----------
        accum_steps = 4                     # 例：batch_size=2 → 有效 batch=8
        scaler = GradScaler()               # AMP

        print(f"Starting training on {self.device} for {self.train_cfg.epochs} epochs...")
        for epoch in range(self.train_cfg.epochs):
            self.model.train()
            optimizer.zero_grad()           # 每个 epoch 开始清零

            for step, batch in enumerate(self.train_loader):
                pixel_values = batch["pixel_values"].to(self.device)
                labels = [{k: v.to(self.device) for k, v in t.items()}
                        for t in batch["labels"]]

                # ---------- AMP ----------
                with autocast():
                    outputs = self.model(pixel_values=pixel_values, labels=labels)
                    loss = outputs.loss / accum_steps

                scaler.scale(loss).backward()

                # ---------- 累积步 ----------
                if (step + 1) % accum_steps == 0 or (step + 1) == len(self.train_loader):
                    scaler.step(optimizer)
                    scaler.update()
                    optimizer.zero_grad()

                # 记录 loss（累加前乘回 accum_steps）
                if (step + 1) % accum_steps == 0:
                    writer.add_scalar("Loss/train_step",
                                    loss.item() * accum_steps,
                                    epoch * len(self.train_loader) + step)

            # ---------- epoch 统计 ----------
            avg_train_loss = self._get_epoch_loss(self.train_loader, is_train=True) / accum_steps
            writer.add_scalar("Loss/train", avg_train_loss, epoch)
            print(f"Epoch [{epoch+1}/{self.train_cfg.epochs}], Train Loss: {avg_train_loss:.4f}")

            # 验证
            val_metrics = self.evaluate(self.val_loader)
            writer.add_scalar("Loss/validation", val_metrics['validation_loss'], epoch)

            # 保存
            sanitized = self.model_cfg.name_or_path.replace("/", "_")
            save_path = os.path.join(self.train_cfg.model_dir, "checkpoints",
                                    f"{sanitized}_epoch{epoch+1}.pt")
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            torch.save(self.model.state_dict(), save_path)
            print(f"Model saved → {save_path}")

        writer.close()

    def _get_epoch_loss(self, loader, is_train=False):
        """仅用于统计 epoch 平均 loss（不参与梯度）"""
        self.model.eval() if not is_train else self.model.train()
        total = 0.0
        with torch.no_grad():
            for batch in loader:
                pixel_values = batch["pixel_values"].to(self.device)
                labels = [{k: v.to(self.device) for k, v in t.items()}
                        for t in batch["labels"]]
                outputs = self.model(pixel_values=pixel_values, labels=labels)
                total += outputs.loss.item()
        return total
    

    def predict(self, image: Image.Image, threshold: float = 0.9):
        self.model.eval()
        inputs = self.processor(images=image, return_tensors="pt").to(self.device)
        with torch.no_grad():
            outputs = self.model(**inputs)
        target_sizes = torch.tensor([image.size[::-1]])
        results = self.processor.post_process_object_detection(
            outputs, threshold=threshold, target_sizes=target_sizes
        )[0]
        return results

    def evaluate(self, val_loader=None):
        if val_loader is None:
            val_loader = self.val_loader

        self.model.eval()
        total_loss = 0.0
        with torch.no_grad():
            for batch in val_loader:
                pixel_values = batch["pixel_values"].to(self.device)
                labels = [{k: v.to(self.device) for k, v in t.items()}
                        for t in batch["labels"]]

                # 这里不需要 pixel_mask
                outputs = self.model(pixel_values=pixel_values, labels=labels)
                total_loss += outputs.loss.item()

        avg_loss = total_loss / len(val_loader)
        print(f"Validation Loss: {avg_loss:.4f}")
        return {"validation_loss": avg_loss}