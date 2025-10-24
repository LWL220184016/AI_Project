import os
import sys
import torch
import torch.optim as optim 

from typing import List, Any, Dict

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir)))

from model import Model
from ultralytics import YOLO
from config import model_config, train_config


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
        super().__init__(**kwargs)

        self.model_cfg = model_cfg
        self.train_cfg = train_cfg
        self.tasks = tasks if tasks else []

        # 初始化 YOLO 模型
        self.model = YOLO(model_cfg.name_or_path)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model.to(self.device)

    def train(self, dataLoader):
        """
        訓練 YOLO 模型
        :param data: dataset yaml 檔案路徑 (例如 "construction-ppe.yaml")
        :return: 訓練結果
        """
        # super().train()

        # ====== Step 4: Optimizer ======
        optimizer = optim.Adam(model.parameters(), lr=1e-4)


        # ====== Step 5: 訓練 loop ======
        num_epochs = 5
        for epoch in range(num_epochs):
            self.model.train()
            running_loss = 0.0

            for imgs, targets in dataLoader:
                # 移到 GPU
                imgs = [img.to(self.device) for img in imgs]
                targets = [{k: torch.tensor(v).to(self.device) for k, v in t.items()} for t in targets]

                # 前向傳播
                outputs = model(imgs)

                # YOLO 的 loss 計算方式
                # Ultralytics 的 YOLO 模型 forward 時，若傳入 targets，會回傳 loss
                loss = model.loss(outputs, targets)

                # 反向傳播
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

                running_loss += loss.item()

            print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {running_loss/len(dataLoader):.4f}")

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
            device=self.train_cfg.device,
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


if __name__ == "__main__":
    # 假設 config 內有定義好 model_config 與 train_config
    model = Yolo(model_cfg=model_config, train_cfg=train_config, tasks=["detection"])

    # 範例：訓練
    train_results = model.train(data="construction-ppe.yaml")

    # 範例：評估
    eval_results = model.evaluate(data="construction-ppe.yaml")
    print("Evaluation:", eval_results)

    # 範例：推理
    preds = model.predict(source="test_images/", save=True)