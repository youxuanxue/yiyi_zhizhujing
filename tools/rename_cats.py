#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量重命名 cats 目录下的图片文件
格式：cat_xx.png，其中 xx 为两位数字（01, 02, ...）
"""

import os
import re
from pathlib import Path

def rename_cat_files(cats_dir):
    """重命名 cats 目录下的所有图片文件"""
    cats_path = Path(cats_dir)
    if not cats_path.exists():
        print(f"错误：目录 {cats_dir} 不存在")
        return
    
    # 获取所有 PNG 文件
    png_files = list(cats_path.glob("*.png"))
    
    # 提取数字并排序
    file_info = []
    for file in png_files:
        # 匹配文件名中的数字
        match = re.search(r'\((\d+)\)', file.name)
        if match:
            num = int(match.group(1))
            file_info.append((num, file))
        elif file.name == "猫的品种及等级划分.png":
            # 处理没有数字的文件，将其作为第 0 个或最后一个
            file_info.append((0, file))
    
    # 按数字排序
    file_info.sort(key=lambda x: x[0])
    
    # 重命名文件
    renamed_count = 0
    for idx, (num, file) in enumerate(file_info, start=1):
        new_name = f"cat_{idx:02d}.png"
        new_path = cats_path / new_name
        
        if file.name != new_name:
            # 如果目标文件已存在，先重命名为临时名称
            if new_path.exists() and new_path != file:
                temp_name = f"cat_{idx:02d}_temp.png"
                temp_path = cats_path / temp_name
                file.rename(temp_path)
                file = temp_path
            
            file.rename(new_path)
            print(f"重命名: {file.name if hasattr(file, 'name') else str(file)} -> {new_name}")
            renamed_count += 1
        else:
            print(f"跳过: {file.name} (已经是正确格式)")
    
    print(f"\n完成！共重命名 {renamed_count} 个文件")

if __name__ == "__main__":
    cats_dir = "/Users/xuejiao/Codes/yiyi_zhizhujing/cats"
    rename_cat_files(cats_dir)

