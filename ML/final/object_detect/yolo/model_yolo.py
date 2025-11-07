import os
import sys
import torch
import torch.optim as optim 

from typing import List, Any, Dict

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir)))

from model import Model
from ultralytics import YOLO
from torch.utils.tensorboard import SummaryWriter
from torch.utils.data import DataLoader

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from yolo.config import model_config, train_config


class Yolo(Model):
    """
    模型封裝類別
    - 支援訓練、評估與推理
    """

    def __init__(
        self,
        model_cfg: 'model_config',
        train_cfg: 'train_config',
        load_from: str = "",
        **kwargs
    ):
        super().__init__(model_cfg, train_cfg, **kwargs)

        # 初始化模型
        if load_from:
            self.model = YOLO(load_from)
        else:
            self.model = YOLO(model_cfg.name_or_path)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model.to(self.device)


    def setup_data(self):
        """
        創建並設置訓練和驗證的 DataLoader。
        """
        
        raise NotImplementedError()


    def _create_dataloader(self, split: str) -> DataLoader:
        """
        創建 DataLoader 的內部輔助函數。
        """
        
        raise NotImplementedError()


    def show_dataset_sample(self, split='train'):
        """
        顯示一個數據集樣本及其標註框，用於驗證。
        """
        
        raise NotImplementedError()
    

    def train(self):
        """
        訓練模型並記錄 TensorBoard 日誌與儲存模型
        :param dataLoader: PyTorch 的 DataLoader
        :return: None
        """
        results = self.model.train(data=self.train_cfg.dataset, epochs=self.train_cfg.epochs, imgsz=640)
        return results

    def evaluate(self, data: str) -> Dict[str, Any]:
        """
        評估模型效能
        :param data: dataset yaml 檔案路徑
        :return: 評估指標 (mAP, precision, recall 等)
        """

        raise NotImplementedError()


    def predict(self, source: str, save: bool = True) -> Any:
        """
        使用模型進行推理
        :param source: 影像或資料夾路徑
        :param save: 是否儲存推理結果
        :return: 推理結果
        """
        # class( 0: helmet, 2: vest, 4: goggles, 6: person)
        prediction_results = self.model.predict(source, save=save, classes=[0, 2, 4])  # Only detect helmet, vest, goggles

        return prediction_results



if __name__ == "__main__":
    from yolo.config import model_config, train_config

    model_cfg = model_config()
    train_cfg = train_config()
    model = Yolo(model_cfg, train_cfg, load_from="/home/user/AI_Project/RL/final/object_detect/yolo/trained_model/best.pt")


    result = model.predict(source="/home/user/AI_Project/RL/final/object_detect/test_images/construction-site-2630484_1280.jpg")