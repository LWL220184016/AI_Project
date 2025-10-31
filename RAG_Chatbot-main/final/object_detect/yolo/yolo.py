import os
import sys
import torch
import torch.optim as optim 

from typing import List, Any, Dict

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir)))

from model import Model
from ultralytics import YOLO
from config import model_config, train_config
from torch.utils.tensorboard import SummaryWriter


class Yolo(Model):
    """
    YOLO 模型封裝類別
    - 支援訓練、評估與推理
    """

    def __init__(
        self,
        model_cfg: model_config,
        train_cfg: train_config,
        tasks: List[str] = None,
        **kwargs
    ):
        super().__init__(model_cfg, train_cfg, tasks, **kwargs)

        # 初始化 YOLO 模型
        self.model = YOLO(model_cfg.name_or_path)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model.to(self.device)

    def train(self, dataLoader):
        """
        訓練 YOLO 模型並記錄 TensorBoard 日誌與儲存模型
        :param dataLoader: PyTorch 的 DataLoader
        :return: None
        """
        optimizer = optim.Adam(self.model.parameters(), lr=self.train_cfg.learning_rate)
        writer = SummaryWriter(log_dir=self.train_cfg.log_dir)

        num_epochs = self.train_cfg.epochs
        for epoch in range(num_epochs):
            self.model.train()
            running_loss = 0.0

            for step, (imgs, targets) in enumerate(dataLoader):
                imgs = [img.to(self.device) for img in imgs]
                targets = [{k: torch.tensor(v).to(self.device) for k, v in t.items()} for t in targets]

                outputs = self.model(imgs)
                loss = self.model.loss(outputs, targets)

                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

                running_loss += loss.item()
                writer.add_scalar("Loss/step", loss.item(), epoch * len(dataLoader) + step)

            avg_loss = running_loss / len(dataLoader)
            writer.add_scalar("Loss/epoch", avg_loss, epoch)
            print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {avg_loss:.4f}")

            # 儲存模型權重
            save_path = os.path.join("checkpoints", f"{self.model_cfg.name_or_path}_epoch{epoch+1}.pt")
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            torch.save(self.model.state_dict(), save_path)

        writer.close()

    def evaluate(self, data: str) -> Dict[str, Any]:
        """
        評估模型效能
        :param data: dataset yaml 檔案路徑
        :return: 評估指標 (mAP, precision, recall 等)
        """
        metrics = self.model.val(
            data=data,
            imgsz=self.train_cfg.imgsz,
            batch=self.train_cfg.batch_size,
            device=self.device,
        )
        return metrics.results_dict

    def predict(self, source: str, save: bool = False) -> Any:
        """
        使用模型進行推理
        :param source: 影像或資料夾路徑
        :param save: 是否儲存推理結果
        :return: 推理結果
        """
        results = self.model.predict(
            source=source,
            imgsz=self.train_cfg.imgsz,
            save=save,
            device=self.train_cfg.device,
        )
        return results

