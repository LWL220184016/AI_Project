
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir)))

from model import Model
from ultralytics import YOLO
from config import model_config, train_config

# Load a model

class Yolo(Model):
    """
    
    """

    def __init__(self, 
                 model_cfg: model_config, 
                 train_cfg: train_config,
                 tasks: list,
                 **kwargs
                ):
        super().__init__(**kwargs)

        self.model = YOLO(model_cfg.name_or_path) 

        pass

    def train(self, dataLoader):
        super().train()

        # results = self.model.train(data="construction-ppe.yaml", epochs=5, imgsz=640)
        results = self.model.train(dataLoader=dataLoader, epochs=5, imgsz=640)

        return results

    def evaluate(self):

        pass

if __name__ ==  "__main__":
    model = Yolo()



