
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir)))

from model import Model

class yolo(Model):
    """
    
    """

    def __init__(self):

        pass

    def train(self):
        super().train()
        pass

    def evaluate(self):

        pass

if __name__ ==  "__main__":
    model = yolo()