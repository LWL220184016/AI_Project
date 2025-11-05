import os
import torch
from torch.utils.data import Dataset
from PIL import Image
import json
from collections import defaultdict
from roboflow import Roboflow

class YoloDataset(Dataset):
    def __init__(self, images_dir, labels_dir, transform=None):
        self.images_dir = images_dir
        self.labels_dir = labels_dir
        self.transform = transform
        self.image_files = [f for f in os.listdir(images_dir) if f.endswith('.jpg') or f.endswith('.png')]

    def __len__(self):
        return len(self.image_files)

    def __getitem__(self, idx):
        img_name = self.image_files[idx]
        img_path = os.path.join(self.images_dir, img_name)
        label_path = os.path.join(self.labels_dir, img_name.replace('.jpg', '.txt').replace('.png', '.txt'))

        image = Image.open(img_path).convert("RGB")
        boxes = []
        labels = []

        with open(label_path, 'r') as f:
            for line in f.readlines():
                parts = line.strip().split()
                class_id = int(parts[0])
                x_center, y_center, width, height = map(float, parts[1:])
                boxes.append([x_center, y_center, width, height])
                labels.append(class_id)

        target = {
            'boxes': torch.tensor(boxes, dtype=torch.float32),
            'labels': torch.tensor(labels, dtype=torch.int64)
        }

        if self.transform:
            image = self.transform(image)

        return image, target
    

# 建議安裝 albumentations 來處理圖像和邊界框的同步轉換
# pip install albumentations

class CocoDataset(Dataset):
    """
    一個功能完善的 COCO 格式數據集類別，整合了 Roboflow 下載功能。
    它會自動下載數據集（如果不存在），並根據指定的 split（train/valid/test）加載數據。
    """
    def __init__(self, root_dir, workspace, project_name, version, 
                 split='train', transform=None, download=True):
        """
        Args:
            root_dir (string): 用於存放下載數據集的根目錄。
            workspace (string): Roboflow 的 workspace ID。
            project_name (string): Roboflow 的 project ID。
            version (int): 數據集的版本號。
            split (string, optional): 要加載的數據集部分 ('train', 'valid', 'test')。預設為 'train'。
            transform (callable, optional): 應用於圖片和標註的可選轉換。
            download (bool, optional): 是否執行下載。預設為 True。
        """
        self.root_dir = root_dir
        self.split = split
        self.transform = transform
        
        # 1. 下載數據集並獲取其本地路徑
        if download:
            dataset_path = self._download_dataset(workspace, project_name, version)
        else:
            # 如果不下載，則假定數據集已存在於預期位置
            dataset_path = os.path.join(self.root_dir, project_name, str(version))

        # 2. 自動設定圖片目錄和標註文件路徑
        self.images_dir = os.path.join(dataset_path, self.split)
        self.ann_file = os.path.join(self.images_dir, "_annotations.coco.json")
        
        if not os.path.exists(self.ann_file):
            raise FileNotFoundError(f"標註文件未找到: {self.ann_file}。請檢查 split 名稱是否正確或數據集是否完整。")

        # 3. 加載 COCO 標註文件
        with open(self.ann_file, 'r') as f:
            coco_data = json.load(f)

        # 4. 獲取圖片列表
        self.images = coco_data['images']
        
        # 5. 建立從 image_id 到其所有標註的高效查找映射
        self.img_to_anns = defaultdict(list)
        for ann in coco_data['annotations']:
            self.img_to_anns[ann['image_id']].append(ann)

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_info = self.images[idx]
        img_id = img_info['id']
        img_name = img_info['file_name']
        img_path = os.path.join(self.images_dir, img_name)
        
        image = Image.open(img_path).convert("RGB")
        width, height = image.size
        
        annotations = self.img_to_anns[img_id]
        
        boxes = []
        labels = []
        
        for ann in annotations:
            # COCO bbox 格式: [x_min, y_min, width, height]
            # Albumentations 需要的格式也是類似的，但可能是歸一化的
            boxes.append(ann['bbox'])
            labels.append(ann['category_id'])

        target = {
            'image_id': torch.tensor([img_id], dtype=torch.int64),
            'boxes': torch.tensor(boxes, dtype=torch.float32),
            'labels': torch.tensor(labels, dtype=torch.int64)
        }

        # 應用圖像轉換 (關鍵！)
        # 對於物體偵測，transform 需要同時處理圖像和邊界框
        # 標準的 torchvision.transforms 無法做到這一點，推薦使用 albumentations
        if self.transform:
            # Albumentations 的 transform 函數需要特定的輸入格式
            # 這裡只是一個示例，實際使用時需要根據 transform 的要求來調整
            transformed = self.transform(image=np.array(image), bboxes=target['boxes'], labels=target['labels'])
            image = transformed['image']
            target['boxes'] = torch.tensor(transformed['bboxes'], dtype=torch.float32)
            target['labels'] = torch.tensor(transformed['labels'], dtype=torch.int64)

        return image, target

    def _download_dataset(self, workspace, project_name, version) -> str:
        """
        從 Roboflow 下載數據集，並返回數據集的本地路徑。
        如果數據集已存在，則跳過下載。
        """
        # 預期數據集將被下載到的路徑
        download_location = os.path.join(self.root_dir, project_name, str(version))
        
        # 檢查數據集是否已存在，如果存在則直接返回路徑
        if os.path.exists(os.path.join(download_location, self.split, "_annotations.coco.json")):
            print(f"數據集已存在於: {download_location}")
            return download_location

        print("正在從 Roboflow 下載數據集...")
        
        api_key = os.getenv("ROBOFLOW_API_KEY")
        if not api_key:
            api_key = input("從環境變量獲取 API 失敗，請手動輸入您的 Roboflow API key: ")

        rf = Roboflow(api_key=api_key)
        project = rf.workspace(workspace).project(project_name)
        version_obj = project.version(version)
        
        # 下載 COCO 格式的數據集到指定位置
        dataset = version_obj.download("coco", location=download_location)
        
        print(f"數據集成功下載到: {dataset.location}")
        return dataset.location

### 如何使用

# import numpy as np
# from torch.utils.data import DataLoader

# # --- 配置 ---
# # 將這些替換為你自己的 Roboflow 項目信息
# ROBOFLOW_WORKSPACE = "roboflow-jvuqo"
# ROBOFLOW_PROJECT = "ppe-detection-6duyv"
# ROBOFLOW_VERSION = 1
# ROOT_DIR = "./datasets"  # 數據集將被下載到這個文件夾

# # -------------------------------------------------------------
# # 創建訓練數據集實例
# # 第一次運行時，它會提示你輸入 API key 並下載數據集
# train_dataset = CocoDataset(
#     root_dir=ROOT_DIR,
#     workspace=ROBOFLOW_WORKSPACE,
#     project_name=ROBOFLOW_PROJECT,
#     version=ROBOFLOW_VERSION,
#     split='train',
#     # transform=... # 在此處傳入你的 albumentations 轉換
# )

# # 創建驗證數據集實例
# # 第二次實例化時，它會發現數據集已存在，直接加載
# valid_dataset = CocoDataset(
#     root_dir=ROOT_DIR,
#     workspace=ROBOFLOW_WORKSPACE,
#     project_name=ROBOFLOW_PROJECT,
#     version=ROBOFLOW_VERSION,
#     split='valid',
# )

# # --- 檢查輸出 ---
# image, target = train_dataset
# print("圖片類型:", type(image))
# print("標註內容:", target)
# print(f"訓練集大小: {len(train_dataset)}")
# print(f"驗證集大小: {len(valid_dataset)}")

# # --- 創建 DataLoader (用於模型訓練) ---
# # 注意：由於標註是字典形式，collate_fn 可能需要自定義
# def collate_fn(batch):
#     return tuple(zip(*batch))

# train_loader = DataLoader(train_dataset, batch_size=4, shuffle=True, collate_fn=collate_fn)
# # batch = next(iter(train_loader))
# # print(batch)