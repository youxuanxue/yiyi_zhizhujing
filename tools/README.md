# 工具脚本说明

本目录包含用于处理游戏资源和数据的工具脚本。

## 📋 脚本列表

### 1. `extract_cat.py` - 猫咪图片提取工具

从原始图片中提取猫咪主体，去除背景，生成透明背景的PNG图片。

**使用方法：**
```bash
# 从项目根目录运行
cd /Users/xuejiao/Codes/yiyi_zhizhujing
python tools/extract_cat.py
```

**功能：**
- 从 `corpus/` 目录读取原始图片
- 使用图像分割技术识别猫咪主体
- 输出到 `cats/` 目录

---

### 2. `extract_words.py` - 单词数据提取工具

从Excel文件中提取单词数据，转换为JSON格式。

**使用方法：**
```bash
# 从项目根目录运行
cd /Users/xuejiao/Codes/yiyi_zhizhujing
python tools/extract_words.py
```

**功能：**
- 读取 `corpus/pet单词测试.xlsx`
- 提取英文单词、中文翻译、单元信息
- 输出JSON文件到 `data/` 目录

**输出格式：**
```json
[
  {
    "english": "apple",
    "chinese": "苹果",
    "unit": "U1"
  }
]
```

---

### 3. `rename_cats.py` - 猫咪图片重命名工具

批量重命名猫咪图片文件为统一格式：`cat_01.png`, `cat_02.png`, ...

**使用方法：**
```bash
# 从项目根目录运行
cd /Users/xuejiao/Codes/yiyi_zhizhujing
python tools/rename_cats.py
```

**功能：**
- 扫描 `cats/` 目录下的PNG文件
- 按数字顺序重命名为 `cat_XX.png` 格式
- 保持文件名中的数字顺序

---

## ⚙️ 依赖要求

所有脚本需要 Python 3.x，并安装以下依赖：

```bash
pip install pandas pillow numpy scipy scikit-learn opencv-python
```

## 📝 注意事项

- 所有脚本应该从**项目根目录**运行，以保持相对路径正确
- 运行前请备份重要数据
- 建议在运行前检查脚本中的路径设置

