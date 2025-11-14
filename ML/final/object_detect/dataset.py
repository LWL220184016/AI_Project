import os
import torch
import random
import numpy as np
import json

from torch.utils.data import Dataset
from PIL import Image
from collections import defaultdict
from roboflow import Roboflow

from datasets import Dataset, DatasetDict, Features
from datasets.features import ClassLabel, Sequence, Value, Image

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
            'class_labels': torch.tensor(labels, dtype=torch.int64)
        }

        if self.transform:
            image = self.transform(image)

        return image, target
    

# 建議安裝 albumentations 來處理圖像和邊界框的同步轉換
# pip install albumentations

class CocoDataset():
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

        self._load_coco_dataset(data_dir=dataset_path)

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
            'class_labels': torch.tensor(labels, dtype=torch.int64)
        }

        # 應用圖像轉換 (關鍵！)
        # 對於物體偵測，transform 需要同時處理圖像和邊界框
        # 標準的 torchvision.transforms 無法做到這一點，推薦使用 albumentations
        if self.transform:
            # Albumentations 的 transform 函數需要特定的輸入格式
            # 這裡只是一個示例，實際使用時需要根據 transform 的要求來調整
            transformed = self.transform(image=np.array(image), bboxes=target['boxes'], labels=target['class_labels'])
            image = transformed['image']
            target['boxes'] = torch.tensor(transformed['bboxes'], dtype=torch.float32)
            target['class_labels'] = torch.tensor(transformed['class_labels'], dtype=torch.int64)

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

    def _load_coco_dataset(self, data_dir="datasets/ppe-coco/1/"):
        """加载单个分裂（train/valid/test）的 COCO 数据集"""
        split_dir = os.path.join(data_dir, self.split)
        annotation_file = os.path.join(split_dir, "_annotations.coco.json")

        # 读取 COCO JSON
        with open(annotation_file, "r") as f:
            coco = json.load(f)

        # 获取类别名称（动态从 JSON 中提取）
        class_names = [cat['name'] for cat in coco['categories']]
        num_classes = len(class_names)
        print(f"数据集类别: {class_names} (共 {num_classes} 个)")

        # 定义数据集特征（Features），适合对象检测
        features = Features({
            "image": Image(),  # 图像（支持路径或字节）
            "objects": {
                "bbox": Sequence(Sequence(Value("float32"))),  # 边界框 [x, y, width, height]
                "category": Sequence(ClassLabel(names=class_names)),  # 类别 ID
                "area": Sequence(Value("float32")),  # 面积
                "id": Sequence(Value("int64")),  # 物体 ID
                "iscrowd": Sequence(Value("int64")),  # 是否群集
            },
        })

        # 构建数据列表
        data = []
        for img in coco['images']:
            image_path = os.path.join(split_dir, img['file_name'])
            if not os.path.exists(image_path):
                continue  # 跳过缺失图像

            # 收集该图像的标注
            anns = [ann for ann in coco['annotations'] if ann['image_id'] == img['id']]
            objects = {
                "bbox": [ann['bbox'] for ann in anns],
                "category": [ann['category_id'] for ann in anns],
                "area": [ann['area'] for ann in anns],
                "id": [ann['id'] for ann in anns],
                "iscrowd": [ann['iscrowd'] for ann in anns],
            }

            data.append({
                "image": image_path,  # datasets 会自动加载图像
                "objects": objects,
            })
            
        # 创建 Dataset
        ds = Dataset.from_list(data, features=features)
        return ds


if __name__ == "__main__":
    from detr_resnet_50.config import train_config, model_config

    train_cfg = train_config()
    model_cfg = model_config()

    train_dataset = CocoDataset(
                                root_dir=train_cfg.root_dir,
                                workspace=train_cfg.workspace,
                                project_name=train_cfg.project_name,
                                version=train_cfg.version,
                                split="train",
                                )
    
    valid_dataset = CocoDataset(
                                root_dir=train_cfg.root_dir,
                                workspace=train_cfg.workspace,
                                project_name=train_cfg.project_name,
                                version=train_cfg.version,
                                split="valid",
                                )
    
    test_dataset = CocoDataset(
                                root_dir=train_cfg.root_dir,
                                workspace=train_cfg.workspace,
                                project_name=train_cfg.project_name,
                                version=train_cfg.version,
                                split="test",
                                )
    
    

    # 加载所有分裂
    dataset = {
        "train": train_dataset,
        "validation": valid_dataset,
        "test": test_dataset,
    }
    dataset = DatasetDict(dataset)

    print(dataset)
