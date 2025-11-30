# 猫咪救助站 - 单词学习游戏

一个有趣的H5单词学习游戏，通过救助猫咪来学习英语单词。玩家控制救助车，按顺序收集单词字母，完成单词挑战。

## 📁 项目结构

```
yiyi_zhizhujing/
│
├── 📄 README.md              # 项目主文档（本文件）
├── 📄 .gitignore             # Git忽略配置
│
├── 🎮 cats_game/             # 游戏目录
│   ├── index.html            # 游戏主页面
│   ├── game.js               # 游戏核心逻辑
│   ├── style.css             # 游戏样式
│   └── README.md             # 游戏说明文档
│
├── 🐱 cats/                  # 猫咪图片资源目录
│   └── cat_01.png ~ cat_97.png  # 97张猫咪图片
│
├── 📊 data/                  # 数据文件目录
│   ├── yaoyao.json           # 游戏使用的单词数据（主要）
│   └── xuanxuan.json         # 备用单词数据
│
├── 📚 corpus/                # 原始数据目录
│   ├── 1.jpg                 # 原始图片文件
│   ├── 2.jpg
│   ├── 3.jpg
│   └── pet单词测试.xlsx      # Excel单词数据源
│
└── 🛠️ tools/                 # 工具脚本目录
    ├── extract_cat.py        # 猫咪图片提取工具
    ├── extract_words.py      # 单词数据提取工具
    └── rename_cats.py        # 图片重命名工具
```

## 🚀 快速开始

### 方法一：使用本地服务器（推荐）

```bash
# 在项目根目录下运行
python -m http.server 8000

# 然后在浏览器中访问
http://localhost:8000/cats_game/
```

### 方法二：直接打开

在浏览器中直接打开 `cats_game/index.html`（可能有跨域限制）

## 🎮 游戏说明

### 游戏目标

- 通过移动救助车，按顺序收集当前挑战单词所需的字母
- 每个猫咪身上携带一个字母
- 当救助车碰到带有正确字母的猫咪时，会收集该字母并得分
- 收集完当前单词的所有字母后，会自动进入下一个单词

### 游戏操作

- **移动救助车**: 触摸并拖动救助车来改变车头方向
- **加速移动**: 触摸时移动速度会加倍
- **重新开始**: 点击"重新开始"按钮重置游戏
- **下一个单词**: 点击"下一个单词"按钮跳过当前单词

### 游戏特色

- 🎨 **精美界面**: 渐变背景、逼真的救助车设计
- 🐱 **丰富资源**: 97张可爱的猫咪图片
- 🎯 **智能生成**: 根据屏幕情况智能生成需要的字母
- 📱 **响应式设计**: 支持移动端和桌面端
- ⚡ **触摸加速**: 触摸时速度自动加倍
- 📍 **清晰显示**: 字母显示在猫咪图片上方

## 🛠️ 开发工具

### 工具脚本说明

所有工具脚本位于 `tools/` 目录：

- **`extract_cat.py`**: 从原始图片中提取猫咪主体，去除背景
- **`extract_words.py`**: 从Excel文件（`corpus/pet单词测试.xlsx`）中提取单词数据
- **`rename_cats.py`**: 批量重命名猫咪图片文件为统一格式

**使用方法：**
```bash
# 从项目根目录运行（保持相对路径正确）
python tools/extract_words.py
python tools/extract_cat.py
python tools/rename_cats.py
```

### 数据文件说明

所有数据文件位于 `data/` 目录：

- **`yaoyao.json`**: 游戏主要使用的单词数据（132个单词）
- **`xuanxuan.json`**: 备用单词数据

#### 数据格式

JSON文件格式：
```json
[
  {
    "english": "apple",
    "chinese": "苹果",
    "unit": "U1"
  }
]
```

### 切换单词数据

如需切换单词数据，修改 `cats_game/game.js` 中的路径：

```javascript
// 第73行
const response = await fetch('../data/yaoyao.json');  // 当前使用
// 或改为
const response = await fetch('../data/xuanxuan.json'); // 使用备用数据
```

## 🔧 技术栈

- **前端**: HTML5 Canvas, JavaScript (ES6+), CSS3
- **数据处理**: Python 3
- **数据格式**: JSON

## 📱 浏览器兼容性

- ✅ Chrome/Edge (推荐)
- ✅ Firefox
- ✅ Safari
- ✅ 移动端浏览器（iOS Safari, Chrome Mobile等）

## 📝 文件说明

### 游戏核心文件

- `cats_game/index.html`: 游戏HTML入口页面
- `cats_game/game.js`: 游戏逻辑（约785行）
- `cats_game/style.css`: 游戏样式

### 资源文件

- `cats/`: 97张猫咪PNG图片（透明背景）
- `data/yaoyao.json`: 游戏使用的单词数据
- `data/xuanxuan.json`: 备用单词数据

### 工具脚本

- `tools/extract_cat.py`: 猫咪图片提取工具
- `tools/extract_words.py`: 单词数据提取工具
- `tools/rename_cats.py`: 图片重命名工具

## 📄 许可证

本项目仅供学习和教育使用。

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

---

**享受游戏，快乐学习！** 🎉
