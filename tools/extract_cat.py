#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从图片中抠出猫，其余部分设为透明背景
使用图像分割技术识别主体（猫）
"""

import os
from pathlib import Path
from PIL import Image
import numpy as np
from scipy import ndimage
from sklearn.cluster import KMeans

def extract_cat_subject(image_path, output_path):
    """
    从图片中提取猫的主体，其余部分设为透明
    
    策略：
    1. 使用颜色聚类识别主体和背景
    2. 基于边缘检测和轮廓分析
    3. 假设主体在中心区域
    4. 使用形态学操作清理掩码
    """
    try:
        # 打开图片
        img = Image.open(image_path)
        
        # 确保图片有 alpha 通道
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # 转换为 numpy 数组
        img_array = np.array(img)
        height, width = img_array.shape[:2]
        
        # 方法1：基于现有透明通道和颜色分析
        # 获取不透明的像素
        alpha = img_array[:, :, 3]
        opaque_mask = alpha > 10  # 不透明的像素
        
        if not np.any(opaque_mask):
            # 如果图片完全透明，直接返回
            img.save(output_path, 'PNG')
            return
        
        # 获取不透明区域的RGB值
        opaque_pixels = img_array[opaque_mask]
        
        # 方法2：使用K-means聚类分离主体和背景
        # 但首先，我们需要识别哪些是主体（猫），哪些是背景/水印
        
        # 创建结果数组
        result = img_array.copy()
        
        # 方法3：基于位置和颜色特征识别主体
        # 假设猫在中心区域，且颜色丰富（不是纯色水印）
        
        # 计算中心区域
        center_y, center_x = height // 2, width // 2
        center_radius = min(height, width) // 3
        
        # 创建主体掩码
        subject_mask = np.zeros((height, width), dtype=bool)
        
        # 方法4：基于颜色方差和位置
        # 主体（猫）通常颜色丰富，有纹理
        # 背景/水印通常是纯色或简单图案
        
        # 对每个不透明像素进行分析
        for y in range(height):
            for x in range(width):
                if alpha[y, x] < 10:  # 已经是透明的，跳过
                    continue
                
                r, g, b, a = img_array[y, x]
                
                # 计算该像素周围区域的颜色方差（纹理丰富度）
                y_start = max(0, y - 5)
                y_end = min(height, y + 6)
                x_start = max(0, x - 5)
                x_end = min(width, x + 6)
                
                region = img_array[y_start:y_end, x_start:x_end, :3]
                region_alpha = img_array[y_start:y_end, x_start:x_end, 3]
                
                # 只考虑不透明区域
                valid_pixels = region[region_alpha > 10]
                
                if len(valid_pixels) > 0:
                    # 计算颜色方差
                    color_variance = np.var(valid_pixels, axis=0).mean()
                    
                    # 计算到中心的距离
                    dist_to_center = np.sqrt((y - center_y)**2 + (x - center_x)**2)
                    
                    # 判断是否是主体：
                    # 1. 颜色方差大（纹理丰富，不是纯色）
                    # 2. 距离中心较近
                    # 3. 不是接近白色的像素（可能是水印）
                    is_white_like = r > 220 and g > 220 and b > 220
                    
                    if (color_variance > 100 and  # 有纹理
                        dist_to_center < center_radius * 1.5 and  # 在中心区域
                        not is_white_like):  # 不是白色水印
                        subject_mask[y, x] = True
        
        # 使用形态学操作清理掩码
        # 填充小洞
        from scipy.ndimage import binary_fill_holes, binary_closing, binary_opening
        
        # 先进行开运算去除小噪点
        subject_mask = binary_opening(subject_mask, structure=np.ones((3, 3)))
        # 然后进行闭运算填充小洞
        subject_mask = binary_closing(subject_mask, structure=np.ones((5, 5)))
        # 填充内部空洞
        subject_mask = binary_fill_holes(subject_mask)
        
        # 如果主体掩码太小，使用更宽松的条件
        if np.sum(subject_mask) < (height * width * 0.1):  # 如果主体小于10%
            # 使用更简单的方法：保留中心区域和颜色丰富的区域
            subject_mask = np.zeros((height, width), dtype=bool)
            
            for y in range(height):
                for x in range(width):
                    if alpha[y, x] < 10:
                        continue
                    
                    r, g, b, a = img_array[y, x]
                    
                    # 计算到中心的距离
                    dist_to_center = np.sqrt((y - center_y)**2 + (x - center_x)**2)
                    
                    # 不是白色，且在中心区域
                    is_white_like = r > 220 and g > 220 and b > 220
                    
                    if dist_to_center < center_radius * 2 and not is_white_like:
                        subject_mask[y, x] = True
        
        # 应用掩码：非主体区域设为透明
        result[:, :, 3] = np.where(subject_mask, result[:, :, 3], 0)
        
        # 转换回 PIL Image
        result_img = Image.fromarray(result)
        
        # 保存结果
        result_img.save(output_path, 'PNG')
        print(f"处理完成: {os.path.basename(image_path)} -> {os.path.basename(output_path)}")
        
    except Exception as e:
        print(f"处理 {image_path} 时出错: {str(e)}")
        import traceback
        traceback.print_exc()

def extract_cat_advanced(image_path, output_path):
    """
    使用更高级的方法提取猫的主体
    结合多种技术：边缘检测、颜色分析、位置分析
    """
    try:
        img = Image.open(image_path)
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        img_array = np.array(img)
        height, width = img_array.shape[:2]
        
        # 获取alpha通道
        alpha = img_array[:, :, 3]
        opaque_mask = alpha > 10
        
        if not np.any(opaque_mask):
            img.save(output_path, 'PNG')
            return
        
        result = img_array.copy()
        
        # 计算中心点和边界
        center_y, center_x = height // 2, width // 2
        
        # 找到不透明区域的边界框
        opaque_coords = np.where(opaque_mask)
        if len(opaque_coords[0]) > 0:
            min_y, max_y = opaque_coords[0].min(), opaque_coords[0].max()
            min_x, max_x = opaque_coords[1].min(), opaque_coords[1].max()
            
            # 计算主体的大致中心（不透明区域的中心）
            subject_center_y = (min_y + max_y) // 2
            subject_center_x = (min_x + max_x) // 2
        else:
            subject_center_y, subject_center_x = center_y, center_x
        
        # 创建主体掩码
        subject_mask = np.zeros((height, width), dtype=bool)
        
        # 计算主体的大致大小
        if len(opaque_coords[0]) > 0:
            subject_height = max_y - min_y
            subject_width = max_x - min_x
            subject_radius = max(subject_height, subject_width) // 2
        else:
            subject_radius = min(height, width) // 3
        
        # 方法：结合多个特征识别主体
        for y in range(height):
            for x in range(width):
                if alpha[y, x] < 10:
                    continue
                
                r, g, b, a = img_array[y, x]
                
                # 特征1：排除白色/浅色水印
                is_white = r > 240 and g > 240 and b > 240
                is_very_light = (r + g + b) / 3 > 235
                
                # 特征2：距离主体中心的距离
                dist_to_subject = np.sqrt((y - subject_center_y)**2 + (x - subject_center_x)**2)
                
                # 特征3：颜色饱和度
                max_rgb = max(r, g, b)
                min_rgb = min(r, g, b)
                saturation = (max_rgb - min_rgb) / max_rgb if max_rgb > 0 else 0
                
                # 特征4：检查是否在边缘（边缘可能是水印）
                is_edge = (x < width * 0.05 or x > width * 0.95 or 
                          y < height * 0.05 or y > height * 0.95)
                
                # 综合判断：保留主体
                # 1. 不是白色/浅色
                # 2. 在主体中心附近，或者有颜色且不在边缘
                if not is_white and not is_very_light:
                    if dist_to_subject < subject_radius * 1.2:
                        # 在主体中心区域
                        subject_mask[y, x] = True
                    elif saturation > 0.15 and not is_edge:
                        # 有颜色且不在边缘
                        subject_mask[y, x] = True
                    elif not is_edge and dist_to_subject < subject_radius * 1.5:
                        # 不在边缘且在主体范围内
                        subject_mask[y, x] = True
        
        # 形态学操作清理掩码
        from scipy.ndimage import binary_fill_holes, binary_closing, binary_opening
        
        # 去除小噪点
        subject_mask = binary_opening(subject_mask, structure=np.ones((2, 2)))
        # 填充小洞
        subject_mask = binary_closing(subject_mask, structure=np.ones((3, 3)))
        subject_mask = binary_fill_holes(subject_mask)
        
        # 如果主体掩码太小，使用更宽松的条件
        mask_ratio = np.sum(subject_mask) / np.sum(opaque_mask) if np.sum(opaque_mask) > 0 else 0
        if mask_ratio < 0.3:  # 如果保留的区域小于30%，说明太严格了
            # 使用更宽松的条件：只要不是白色且在中心区域
            subject_mask = np.zeros((height, width), dtype=bool)
            for y in range(height):
                for x in range(width):
                    if alpha[y, x] < 10:
                        continue
                    r, g, b, a = img_array[y, x]
                    is_white = r > 240 and g > 240 and b > 240
                    dist_to_subject = np.sqrt((y - subject_center_y)**2 + (x - subject_center_x)**2)
                    is_edge = (x < width * 0.05 or x > width * 0.95 or 
                              y < height * 0.05 or y > height * 0.95)
                    
                    if not is_white and (dist_to_subject < subject_radius * 1.5 or not is_edge):
                        subject_mask[y, x] = True
            
            # 再次清理
            subject_mask = binary_opening(subject_mask, structure=np.ones((2, 2)))
            subject_mask = binary_closing(subject_mask, structure=np.ones((3, 3)))
            subject_mask = binary_fill_holes(subject_mask)
        
        # 应用掩码
        result[:, :, 3] = np.where(subject_mask, result[:, :, 3], 0)
        
        # 保存
        result_img = Image.fromarray(result)
        result_img.save(output_path, 'PNG')
        print(f"处理完成: {os.path.basename(image_path)}")
        
    except Exception as e:
        print(f"处理 {image_path} 时出错: {str(e)}")
        import traceback
        traceback.print_exc()

def process_all_cats(cats_dir):
    """处理 cats 目录下的所有图片"""
    cats_path = Path(cats_dir)
    if not cats_path.exists():
        print(f"错误：目录 {cats_dir} 不存在")
        return
    
    # 获取所有 cat_*.png 文件
    cat_files = sorted(cats_path.glob("cat_*.png"))
    
    if not cat_files:
        print("未找到 cat_*.png 文件")
        return
    
    print(f"找到 {len(cat_files)} 个文件，开始处理...\n")
    
    processed_count = 0
    for cat_file in cat_files:
        # 使用高级方法处理
        extract_cat_advanced(cat_file, cat_file)
        processed_count += 1
    
    print(f"\n完成！共处理 {processed_count} 个文件")

if __name__ == "__main__":
    cats_dir = "/Users/xuejiao/Codes/yiyi_zhizhujing/cats"
    process_all_cats(cats_dir)

