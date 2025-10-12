from abc import ABC, abstractmethod


class Model(ABC):
    """
    
    """

    @abstractmethod
    def __init__(self, 
                 path, 
                 model_cfg, 
                 train_cfg, 
                 tasks
                ):
        
        print("Init")

        pass

    @abstractmethod
    def train(self):
        print("Training")

        pass

    @abstractmethod
    def evaluate(self):

        pass


if __name__ ==  "__main__":
    model = Model()