# 项目结构说明

## 📂 目录树

```
yiyi_zhizhujing/
│
├── 📄 README.md              # 项目主文档
├── 📄 PROJECT_STRUCTURE.md   # 项目结构说明（本文件）
├── 📄 .gitignore             # Git忽略配置
│
├── 🎮 cats_game/             # 游戏主目录
│   ├── index.html            # 游戏入口页面
│   ├── game.js               # 游戏核心逻辑
│   ├── style.css             # 游戏样式
│   └── README.md             # 游戏说明文档
│
├── 🐱 cats/                  # 猫咪图片资源（97张）
│   └── cat_01.png ~ cat_97.png
│
├── 📊 data/                  # 数据文件目录
│   ├── yaoyao.json           # 主要单词数据（132个单词）
│   └── xuanxuan.json         # 备用单词数据（1392个单词）
│
├── 📚 corpus/                # 原始数据目录
│   ├── 1.jpg
│   ├── 2.jpg
│   ├── 3.jpg
│   └── pet单词测试.xlsx      # Excel单词数据源
│
└── 🛠️ tools/                 # 工具脚本目录
    ├── README.md             # 工具使用说明
    ├── extract_cat.py        # 猫咪图片提取工具
    ├── extract_words.py      # 单词数据提取工具
    └── rename_cats.py        # 图片重命名工具
```

## 🔗 文件引用关系

### 游戏文件引用
- `cats_game/game.js` → `../data/yaoyao.json` (单词数据)
- `cats_game/game.js` → `../cats/cat_XX.png` (猫咪图片)

### 工具脚本引用
- `tools/extract_words.py` → `../corpus/pet单词测试.xlsx` (Excel数据源)
- `tools/extract_cat.py` → `../corpus/*.jpg` (原始图片)
- `tools/rename_cats.py` → `../cats/*.png` (图片重命名)

## 📝 文件说明

### 核心游戏文件
- **cats_game/index.html**: 游戏HTML入口
- **cats_game/game.js**: 游戏逻辑（约790行）
- **cats_game/style.css**: 游戏样式

### 数据文件
- **data/yaoyao.json**: 当前游戏使用的单词库（132个单词）
- **data/xuanxuan.json**: 备用单词库（1392个单词）

### 资源文件
- **cats/**: 97张猫咪PNG图片（透明背景）

### 工具脚本
- **tools/extract_cat.py**: 从原始图片提取猫咪主体
- **tools/extract_words.py**: 从Excel提取单词数据
- **tools/rename_cats.py**: 批量重命名图片文件

## 🚀 运行说明

### 运行游戏
```bash
# 启动本地服务器（从项目根目录）
python -m http.server 8000

# 访问游戏
http://localhost:8000/cats_game/
```

### 运行工具脚本
```bash
# 从项目根目录运行（保持相对路径正确）
python tools/extract_words.py
python tools/extract_cat.py
python tools/rename_cats.py
```

## 📦 文件统计

- **游戏文件**: 4个
- **猫咪图片**: 97张
- **数据文件**: 2个JSON文件
- **工具脚本**: 3个Python脚本
- **文档文件**: 3个Markdown文件

## 🔄 更新历史

### 2024-11-30 项目重构
- ✅ 创建 `tools/` 目录整理工具脚本
- ✅ 创建 `data/` 目录整理数据文件
- ✅ 更新文件路径引用
- ✅ 完善项目文档

