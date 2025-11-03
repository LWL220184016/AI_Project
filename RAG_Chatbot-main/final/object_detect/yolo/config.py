

class model_config:
    name_or_path = "yolov8n.pt"
    
    pass

class train_config:
    # !wget https://github.com/ultralytics/assets/releases/download/v0.0.0/construction-ppe.zip
    dataset = "construction-ppe"
    model_dir = "./trained_model"
    log_dir = "./log"
    epochs = 5
    learning_rate = 0.0001
    pass