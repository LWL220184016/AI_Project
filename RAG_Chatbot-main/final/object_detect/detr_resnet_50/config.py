
class model_config:
    """
    存放與模型架構相關的配置
    """
    name_or_path = "facebook/detr-resnet-50"
    
    # 1. 先定義一個清晰的類別列表 (這是唯一的真實來源)
    # 順序將決定它們的 ID (0, 1, 2, ...)
    categories = ["head", "helmet", "not_helmet", "not_reflective", "person", "reflective"]
    
    # 2. 自動生成 id2label 和 label2id
    # id2label 的鍵必須是從 0 開始的整數
    id2label = {index: label for index, label in enumerate(categories)}
    
    # label2id 也一併生成，這在模型配置中是必需的
    label2id = {label: index for index, label in enumerate(categories)}

class train_config:
    """
    存放與訓練過程、數據集路徑相關的配置
    """
    # https://universe.roboflow.com/ppe-coco/ppe-coco
    # --- Roboflow 項目信息 ---
    workspace = "ppe-coco"
    project_name = "ppe-coco"
    version = 1
    
    # --- 路徑配置 ---
    root_dir = "./datasets"   # 數據集將被下載到這個根目錄
    model_dir = "./trained_model"
    log_dir = "./log"
    
    # --- 訓練超參數 ---
    epochs = 5
    learning_rate = 0.0001
    batch_size = 4 # 建議也將 batch_size 放在這裡