import os
import sys
import torch
import torch.optim as optim 
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from PIL import Image
from typing import List, Any, Dict

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
        self.processor = AutoImageProcessor.from_pretrained(model_cfg.name_or_path)

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

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model.to(self.device)
        
        # 將 DataLoader 初始化為 None，在需要時才創建
        self.train_loader = None
        self.val_loader = None

    def setup_data(self):
        """
        創建並設置訓練和驗證的 DataLoader。
        """
        print("Setting up data loaders...")
        self.train_loader = self._create_dataloader(split='train')
        self.val_loader = self._create_dataloader(split='valid')
        print("Data loaders created successfully.")

    def _create_dataloader(self, split: str) -> DataLoader:
        """
        創建 DataLoader 的內部輔助函數。
        """
        dataset = CocoDataset(
            root_dir=self.train_cfg.root_dir,
            workspace=self.train_cfg.workspace,
            project_name=self.train_cfg.project_name,
            version=self.train_cfg.version,
            split=split
        )

        def collate_fn(batch):
            pixel_values = [item[0] for item in batch]
            encoding = self.processor.pad(pixel_values, return_tensors="pt")
            labels = [item[1] for item in batch]
            return {
                'pixel_values': encoding['pixel_values'],
                'pixel_mask': encoding.get('pixel_mask'),
                'labels': labels
            }

        return DataLoader(dataset, collate_fn=collate_fn, batch_size=self.train_cfg.batch_size, shuffle=(split=='train'))

    def show_dataset_sample(self, split='train'):
        """
        顯示一個數據集樣本及其標註框，用於驗證。
        """
        if split == 'train' and not self.train_loader:
            self.setup_data()
        elif split == 'valid' and not self.val_loader:
            self.setup_data()
        
        loader = self.train_loader if split == 'train' else self.val_loader
        
        # 獲取一個批次的數據
        batch = next(iter(loader))
        pixel_values = batch['pixel_values']
        target = batch['labels'][0] # 取批次中的第一張圖的標註

        # 將 pixel_values 轉換回 PIL Image 以便顯示
        image = self.processor.post_process_semantic_segmentation(
             outputs={"logits": pixel_values[0].unsqueeze(0)}, 
             target_sizes=[(100,100)] # 尺寸不重要，只是為了逆轉換
        )[0]
        image = Image.fromarray((image.cpu().numpy()).astype('uint8'))


        fig, ax = plt.subplots(1)
        ax.imshow(image)

        # DETR 的 bounding box 格式是 [center_x, center_y, width, height] (歸一化)
        img_width, img_height = image.size
        for box, label_id in zip(target['boxes'], target['class_labels']):
            cx, cy, w, h = box.tolist()
            # 逆轉換為 [x_min, y_min, width, height]
            x_min = (cx - w / 2) * img_width
            y_min = (cy - h / 2) * img_height
            box_w = w * img_width
            box_h = h * img_height
            
            rect = patches.Rectangle((x_min, y_min), box_w, box_h, linewidth=2, edgecolor='r', facecolor='none')
            ax.add_patch(rect)
            plt.text(x_min, y_min, self.model_cfg.id2label[label_id.item()], color='white', backgroundcolor='red')

        plt.show()

    def train(self):
        """
        訓練模型。數據加載器從 self.train_loader 和 self.val_loader 獲取。
        """
        if not self.train_loader or not self.val_loader:
            self.setup_data()

        optimizer = optim.AdamW(self.model.parameters(), lr=self.train_cfg.learning_rate, weight_decay=1e-4)
        writer = SummaryWriter(log_dir=self.train_cfg.log_dir)

        print(f"Starting training on {self.device} for {self.train_cfg.epochs} epochs...")
        for epoch in range(self.train_cfg.epochs):
            self.model.train()
            running_loss = 0.0

            for batch in self.train_loader:
                pixel_values = batch["pixel_values"].to(self.device)
                labels = [{k: v.to(self.device) for k, v in t.items()} for t in batch["labels"]]
                pixel_mask = batch.get("pixel_mask", None)
                if pixel_mask is not None:
                    pixel_mask = pixel_mask.to(self.device)
                
                outputs = self.model(pixel_values=pixel_values, pixel_mask=pixel_mask, labels=labels)
                loss = outputs.loss

                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

                running_loss += loss.item()

            avg_train_loss = running_loss / len(self.train_loader)
            writer.add_scalar("Loss/train", avg_train_loss, epoch)
            print(f"Epoch [{epoch+1}/{self.train_cfg.epochs}], Train Loss: {avg_train_loss:.4f}")

            # 在每個 epoch 結束後進行評估
            val_metrics = self.evaluate(self.val_loader)
            writer.add_scalar("Loss/validation", val_metrics['validation_loss'], epoch)

            # 儲存模型
            sanitized_model_name = self.model_cfg.name_or_path.replace("/", "_")
            save_path = os.path.join(self.train_cfg.model_dir, "checkpoints", f"{sanitized_model_name}_epoch{epoch+1}.pt")
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            torch.save(self.model.state_dict(), save_path)
            print(f"Model saved to {save_path}")

        writer.close()

    # 4. 修正：evaluate 和 predict 方法
    def predict(self, image: Image.Image, threshold: float = 0.9):
        """
        使用模型對單張圖片進行推理
        :param image: PIL 格式的圖片
        :param threshold: 置信度閾值
        :return: 包含檢測框、分數和標籤的字典
        """
        self.model.eval()
        
        # 預處理圖片
        inputs = self.processor(images=image, return_tensors="pt").to(self.device)
        
        # 推理
        with torch.no_grad():
            outputs = self.model(**inputs)
            
        # 後處理以獲取結果
        target_sizes = torch.tensor([image.size[::-1]])
        results = self.processor.post_process_object_detection(
            outputs, threshold=threshold, target_sizes=target_sizes
        )[0]
        
        return results

    def evaluate(self, val_loader):
        """
        評估模型效能。
        這是一個簡化的示例。完整的 COCO 評估需要使用 pycocotools，
        並將所有驗證集的預測結果保存為 JSON 格式後進行計算。
        這裡我們只計算驗證集上的平均損失。
        """
        if not val_loader:
            val_loader = self.val_loader

        self.model.eval()
        total_loss = 0.0
        with torch.no_grad():
            for batch in val_loader:
                pixel_values = batch["pixel_values"].to(self.device)
                labels = [{k: v.to(self.device) for k, v in t.items()} for t in batch["labels"]]
                pixel_mask = batch.get("pixel_mask")
                if pixel_mask is not None:
                    pixel_mask = pixel_mask.to(self.device)

                outputs = self.model(
                    pixel_values=pixel_values,
                    pixel_mask=pixel_mask,
                    labels=labels
                )
                loss = outputs.loss
                total_loss += loss.item()

        avg_loss = total_loss / len(val_loader)
        print(f"Validation Loss: {avg_loss:.4f}")
        return {"validation_loss": avg_loss}