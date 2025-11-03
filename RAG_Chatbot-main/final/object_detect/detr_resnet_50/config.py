

class model_config:
    name_or_path = "facebook/detr-resnet-50"
    pass

class train_config:
    # https://universe.roboflow.com/ppe-coco/ppe-coco/dataset/1
    dataset = "PPE COCO"
    model_dir = "./trained_model"
    log_dir = "./log"
    epochs = 5
    learning_rate = 0.0001
    pass