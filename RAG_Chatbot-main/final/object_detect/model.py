import os

from abc import ABC, abstractmethod


class Model(ABC):
    """
    
    """

    @abstractmethod
    def __init__(self, 
                 model_cfg, 
                 train_cfg, 
                 tasks
                ):
        
        self.model_cfg = model_cfg
        self.train_cfg = train_cfg
        self.tasks = tasks

        
        os.makedirs(train_cfg.log_dir, exist_ok=True)
        os.makedirs(train_cfg.model_dir, exist_ok=True)

        pass

    @abstractmethod
    def train(self):

        pass

    @abstractmethod
    def evaluate(self):

        pass


if __name__ ==  "__main__":
    model = Model()