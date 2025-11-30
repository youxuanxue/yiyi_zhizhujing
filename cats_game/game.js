// 游戏配置
const CONFIG = {
    RESCUE_CAR_WIDTH: 60, // 救助车宽度
    RESCUE_CAR_HEIGHT: 80, // 救助车高度（更长，能看到车头）
    CAT_SIZE: 50,
    CAT_SPEED: 0.3, // 降低猫咪移动速度
    BACKGROUND_SPEED: 1.0, // 降低背景移动速度
    CAT_SPAWN_INTERVAL: 500, // 每0.5秒生成一只猫
    MAX_CATS: 8, // 屏幕上最多同时存在的猫咪数量
    LETTER_FONT_SIZE: 20,
    WORLD_SIZE: 2000 // 虚拟世界大小（比屏幕大很多）
};

// 游戏状态
let gameState = {
    score: 0,
    currentWord: null,
    currentWordIndex: 0,
    targetLetters: [],
    collectedLetters: [],
    collectedCats: [], // 已收集的猫咪（按顺序存储）
    words: [],
    cats: [],
    rescueCar: null,
    canvas: null,
    ctx: null,
    lastCatSpawn: 0,
    animationId: null,
    isGameRunning: false,
    backgroundOffsetX: 0, // 背景X偏移
    backgroundOffsetY: 0, // 背景Y偏移
    isDragging: false, // 是否正在拖动救助车
    targetAngle: 0 // 目标角度（用于平滑旋转）
};

// 初始化游戏
async function initGame() {
    // 获取Canvas
    gameState.canvas = document.getElementById('gameCanvas');
    gameState.ctx = gameState.canvas.getContext('2d');
    
    // 设置Canvas尺寸
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 加载单词数据
    await loadWords();
    
    // 初始化救助车
    initRescueCar();
    
    // 设置触摸事件
    setupTouchEvents();
    
    // 设置按钮事件
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('nextWordBtn').addEventListener('click', nextWord);
    
    // 开始游戏
    startGame();
}

// 调整Canvas尺寸
function resizeCanvas() {
    const gameArea = document.querySelector('.game-area');
    gameState.canvas.width = gameArea.clientWidth;
    gameState.canvas.height = gameArea.clientHeight;
}

// 加载单词数据
async function loadWords() {
    try {
        const response = await fetch('../data/yaoyao.json');
        gameState.words = await response.json();
        console.log(`加载了 ${gameState.words.length} 个单词`);
    } catch (error) {
        console.error('加载单词数据失败:', error);
        // 使用示例数据
        gameState.words = [
            { english: "cat", chinese: "猫", unit: "测试" },
            { english: "dog", chinese: "狗", unit: "测试" }
        ];
    }
}

// 初始化救助车
function initRescueCar() {
    // 救助车固定在屏幕中央（屏幕坐标）
    gameState.rescueCar = {
        screenX: gameState.canvas.width / 2, // 屏幕坐标（固定）
        screenY: gameState.canvas.height / 2, // 屏幕坐标（固定）
        worldX: CONFIG.WORLD_SIZE / 2, // 世界坐标
        worldY: CONFIG.WORLD_SIZE / 2, // 世界坐标
        angle: 0 // 车头角度（弧度）
    };
    gameState.targetAngle = 0; // 初始化目标角度
}

// 检查是否点击了救助车
function isPointOnRescueCar(x, y) {
    const car = gameState.rescueCar;
    const dx = x - car.screenX;
    const dy = y - car.screenY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const carRadius = Math.max(CONFIG.RESCUE_CAR_WIDTH, CONFIG.RESCUE_CAR_HEIGHT) / 2;
    return distance <= carRadius + 10; // 增加一点点击区域
}

// 设置触摸事件
function setupTouchEvents() {
    gameState.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const rect = gameState.canvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const touchY = e.touches[0].clientY - rect.top;
        
        // 检查是否点击了救助车
        if (isPointOnRescueCar(touchX, touchY)) {
            gameState.isDragging = true;
            updateCarDirection(touchX, touchY);
        }
    });
    
    gameState.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (gameState.isDragging) {
            const rect = gameState.canvas.getBoundingClientRect();
            const touchX = e.touches[0].clientX - rect.left;
            const touchY = e.touches[0].clientY - rect.top;
            updateCarDirection(touchX, touchY);
        }
    });
    
    gameState.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        gameState.isDragging = false;
    });
    
    gameState.canvas.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        gameState.isDragging = false;
    });
    
    // 鼠标事件（用于桌面测试）
    gameState.canvas.addEventListener('mousedown', (e) => {
        const rect = gameState.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        if (isPointOnRescueCar(mouseX, mouseY)) {
            gameState.isDragging = true;
            updateCarDirection(mouseX, mouseY);
        }
    });
    
    gameState.canvas.addEventListener('mousemove', (e) => {
        if (gameState.isDragging) {
            const rect = gameState.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            updateCarDirection(mouseX, mouseY);
        }
    });
    
    gameState.canvas.addEventListener('mouseup', () => {
        gameState.isDragging = false;
    });
    
    gameState.canvas.addEventListener('mouseleave', () => {
        gameState.isDragging = false;
    });
}

// 更新车头方向（根据触摸点相对于屏幕中心的方向）
function updateCarDirection(x, y) {
    const car = gameState.rescueCar;
    const dx = x - car.screenX;
    const dy = y - car.screenY;
    
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        // 计算目标角度
        gameState.targetAngle = Math.atan2(dy, dx);
        
        // 归一化角度到 [0, 2π]
        while (gameState.targetAngle > Math.PI * 2) gameState.targetAngle -= Math.PI * 2;
        while (gameState.targetAngle < 0) gameState.targetAngle += Math.PI * 2;
    }
}

// 开始游戏
function startGame() {
    if (gameState.words.length === 0) {
        console.error('没有单词数据');
        return;
    }
    
    gameState.isGameRunning = true;
    gameState.score = 0;
    gameState.currentWordIndex = 0;
    gameState.cats = [];
    gameState.collectedLetters = [];
    gameState.collectedCats = [];
    gameState.backgroundOffsetX = 0;
    gameState.backgroundOffsetY = 0;
    gameState.isDragging = false;
    
    // 重新初始化救助车位置
    initRescueCar();
    
    loadCurrentWord();
    gameLoop();
}

// 加载当前单词
function loadCurrentWord() {
    if (gameState.currentWordIndex >= gameState.words.length) {
        gameState.currentWordIndex = 0; // 循环
    }
    
    const wordData = gameState.words[gameState.currentWordIndex];
    gameState.currentWord = wordData.english.toLowerCase().replace(/[^a-z]/g, ''); // 只保留字母
    
    // 更新UI
    document.getElementById('currentWord').textContent = wordData.english;
    document.getElementById('wordChinese').textContent = wordData.chinese;
    
    // 初始化目标字母
    gameState.targetLetters = gameState.currentWord.split('');
    gameState.collectedLetters = new Array(gameState.targetLetters.length).fill(false);
    gameState.collectedCats = []; // 重置已收集的猫咪
    updateTargetLettersUI();
}

// 更新目标字母UI
function updateTargetLettersUI() {
    const container = document.getElementById('targetLetters');
    container.innerHTML = '';
    
    gameState.targetLetters.forEach((letter, index) => {
        const letterBox = document.createElement('div');
        letterBox.className = 'letter-box';
        letterBox.textContent = letter.toUpperCase();
        if (gameState.collectedLetters[index]) {
            letterBox.classList.add('collected');
        }
        container.appendChild(letterBox);
    });
}

// 生成随机猫咪
function spawnCat() {
    if (gameState.cats.length >= CONFIG.MAX_CATS) {
        return;
    }
    
    // 随机选择猫咪图片
    const catImageIndex = Math.floor(Math.random() * 97) + 1;
    const catImagePath = `../cats/cat_${String(catImageIndex).padStart(2, '0')}.png`;
    
    // 随机选择一个字母（优先选择当前需要的字母，且屏幕中没有的）
    let letter;
    
    // 统计屏幕上已有的猫咪字母
    const screenLetters = new Set();
    gameState.cats.forEach(cat => {
        // 计算猫咪是否在屏幕可见范围内
        const screenX = cat.worldX + gameState.backgroundOffsetX;
        const screenY = cat.worldY + gameState.backgroundOffsetY;
        if (screenX > -CONFIG.CAT_SIZE && screenX < gameState.canvas.width + CONFIG.CAT_SIZE &&
            screenY > -CONFIG.CAT_SIZE && screenY < gameState.canvas.height + CONFIG.CAT_SIZE) {
            screenLetters.add(cat.letter.toLowerCase());
        }
    });
    
    // 找出需要的、未收集的、且屏幕上没有的字母
    const uncollectedIndices = gameState.targetLetters
        .map((l, i) => gameState.collectedLetters[i] ? null : i)
        .filter(i => i !== null);
    
    const neededButNotOnScreen = uncollectedIndices.filter(i => {
        const letter = gameState.targetLetters[i].toLowerCase();
        return !screenLetters.has(letter);
    });
    
    if (neededButNotOnScreen.length > 0) {
        letter = gameState.targetLetters[neededButNotOnScreen[0]];
    } else {
        letter = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    }
    
    // 从屏幕边缘随机选择一个方向生成猫咪
    const spawnSide = Math.floor(Math.random() * 4); // 0=上, 1=右, 2=下, 3=左
    let worldX, worldY, direction;
    
    const visibleStartX = -gameState.backgroundOffsetX;
    const visibleEndX = visibleStartX + gameState.canvas.width;
    const visibleStartY = -gameState.backgroundOffsetY;
    const visibleEndY = visibleStartY + gameState.canvas.height;
    
    switch(spawnSide) {
        case 0: // 从上边进入
            worldX = visibleStartX + Math.random() * (visibleEndX - visibleStartX);
            worldY = visibleStartY - CONFIG.CAT_SIZE;
            direction = Math.random() * Math.PI * 2; // 随机角度向下移动
            break;
        case 1: // 从右边进入
            worldX = visibleEndX + CONFIG.CAT_SIZE;
            worldY = visibleStartY + Math.random() * (visibleEndY - visibleStartY);
            direction = Math.PI + (Math.random() - 0.5) * Math.PI; // 大致向左
            break;
        case 2: // 从下边进入
            worldX = visibleStartX + Math.random() * (visibleEndX - visibleStartX);
            worldY = visibleEndY + CONFIG.CAT_SIZE;
            direction = Math.PI + Math.random() * Math.PI * 2; // 随机角度向上移动
            break;
        case 3: // 从左边进入
            worldX = visibleStartX - CONFIG.CAT_SIZE;
            worldY = visibleStartY + Math.random() * (visibleEndY - visibleStartY);
            direction = (Math.random() - 0.5) * Math.PI; // 大致向右
            break;
    }
    
    // 确保在世界边界内
    worldX = Math.max(0, Math.min(CONFIG.WORLD_SIZE - CONFIG.CAT_SIZE, worldX));
    worldY = Math.max(0, Math.min(CONFIG.WORLD_SIZE - CONFIG.CAT_SIZE, worldY));
    
    const cat = {
        worldX: worldX,
        worldY: worldY,
        letter: letter,
        imagePath: catImagePath,
        image: null,
        speed: CONFIG.CAT_SPEED + Math.random() * 1,
        direction: direction, // 移动方向（角度）
        velocityX: Math.cos(direction) * (CONFIG.CAT_SPEED + Math.random() * 1),
        velocityY: Math.sin(direction) * (CONFIG.CAT_SPEED + Math.random() * 1)
    };
    
    // 预加载图片
    const img = new Image();
    img.onload = () => {
        cat.image = img;
    };
    img.src = cat.imagePath;
    
    gameState.cats.push(cat);
}

// 更新游戏状态
function update() {
    if (!gameState.isGameRunning) return;
    
    const now = Date.now();
    
    // 生成新猫咪
    if (now - gameState.lastCatSpawn > CONFIG.CAT_SPAWN_INTERVAL) {
        spawnCat();
        gameState.lastCatSpawn = now;
    }
    
    // 平滑旋转车头到目标角度
    if (gameState.targetAngle !== undefined) {
        let angleDiff = gameState.targetAngle - gameState.rescueCar.angle;
        
        // 处理角度跨越 -π 到 π 的边界
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // 平滑旋转（使用插值）
        gameState.rescueCar.angle += angleDiff * 0.15;
        
        // 归一化角度到 [0, 2π]
        while (gameState.rescueCar.angle > Math.PI * 2) gameState.rescueCar.angle -= Math.PI * 2;
        while (gameState.rescueCar.angle < 0) gameState.rescueCar.angle += Math.PI * 2;
    }
    
    // 更新背景偏移（根据车头方向反向移动）
    // 车头朝向某个方向，背景就朝相反方向移动
    // 如果正在触摸，速度加倍
    const speedMultiplier = gameState.isDragging ? 2 : 1;
    const moveAngle = gameState.rescueCar.angle;
    gameState.backgroundOffsetX -= Math.cos(moveAngle) * CONFIG.BACKGROUND_SPEED * speedMultiplier;
    gameState.backgroundOffsetY -= Math.sin(moveAngle) * CONFIG.BACKGROUND_SPEED * speedMultiplier;
    
    // 限制背景偏移范围（防止超出世界边界）
    const maxOffset = CONFIG.WORLD_SIZE - Math.max(gameState.canvas.width, gameState.canvas.height);
    gameState.backgroundOffsetX = Math.max(-maxOffset, Math.min(maxOffset, gameState.backgroundOffsetX));
    gameState.backgroundOffsetY = Math.max(-maxOffset, Math.min(maxOffset, gameState.backgroundOffsetY));
    
    // 更新救助车世界坐标（跟随背景偏移）
    gameState.rescueCar.worldX = CONFIG.WORLD_SIZE / 2 - gameState.backgroundOffsetX;
    gameState.rescueCar.worldY = CONFIG.WORLD_SIZE / 2 - gameState.backgroundOffsetY;
    
    // 更新猫咪位置（在世界坐标系中，随机方向移动）
    gameState.cats = gameState.cats.filter(cat => {
        // 根据速度向量移动
        cat.worldX += cat.velocityX;
        cat.worldY += cat.velocityY;
        
        // 如果猫咪撞到世界边界，改变方向（反弹或改变角度）
        if (cat.worldX <= 0 || cat.worldX >= CONFIG.WORLD_SIZE - CONFIG.CAT_SIZE) {
            cat.velocityX = -cat.velocityX;
            cat.worldX = Math.max(0, Math.min(CONFIG.WORLD_SIZE - CONFIG.CAT_SIZE, cat.worldX));
        }
        if (cat.worldY <= 0 || cat.worldY >= CONFIG.WORLD_SIZE - CONFIG.CAT_SIZE) {
            cat.velocityY = -cat.velocityY;
            cat.worldY = Math.max(0, Math.min(CONFIG.WORLD_SIZE - CONFIG.CAT_SIZE, cat.worldY));
        }
        
        // 计算猫咪在屏幕上的位置
        const screenX = cat.worldX + gameState.backgroundOffsetX;
        const screenY = cat.worldY + gameState.backgroundOffsetY;
        
        // 检查碰撞（使用屏幕坐标）
        const carScreenX = gameState.rescueCar.screenX;
        const carScreenY = gameState.rescueCar.screenY;
        const distance = Math.sqrt(
            Math.pow(screenX + CONFIG.CAT_SIZE / 2 - carScreenX, 2) +
            Math.pow(screenY + CONFIG.CAT_SIZE / 2 - carScreenY, 2)
        );
        
        const carRadius = Math.max(CONFIG.RESCUE_CAR_WIDTH, CONFIG.RESCUE_CAR_HEIGHT) / 2;
        if (distance < (carRadius + CONFIG.CAT_SIZE / 2)) {
            // 碰撞检测
            handleCollision(cat);
            return false; // 移除猫咪
        }
        
        // 移除超出屏幕太远的猫咪（考虑背景偏移）
        const margin = 200; // 允许一些边距
        return screenX > -margin && screenX < gameState.canvas.width + margin &&
               screenY > -margin && screenY < gameState.canvas.height + margin;
    });
    
    // 检查是否收集完所有字母
    if (gameState.collectedLetters.every(collected => collected)) {
        // 完成当前单词，加载下一个
        setTimeout(() => {
            nextWord();
        }, 500);
    }
}

// 处理碰撞（必须按字母顺序收集）
function handleCollision(cat) {
    const letter = cat.letter.toLowerCase();
    
    // 找到下一个应该收集的字母索引
    let nextIndex = -1;
    for (let i = 0; i < gameState.targetLetters.length; i++) {
        if (!gameState.collectedLetters[i]) {
            nextIndex = i;
            break;
        }
    }
    
    // 如果没有下一个字母，说明已经收集完了
    if (nextIndex === -1) {
        return;
    }
    
    // 检查碰撞的猫咪是否携带正确的字母
    const targetLetter = gameState.targetLetters[nextIndex].toLowerCase();
    if (letter === targetLetter) {
        // 正确收集：按顺序
        gameState.collectedLetters[nextIndex] = true;
        gameState.score++;
        
        // 保存已收集的猫咪信息（包括图片路径）
        gameState.collectedCats.push({
            letter: letter,
            imagePath: cat.imagePath,
            image: cat.image // 保存图片引用
        });
        
        updateTargetLettersUI();
        document.getElementById('score').textContent = gameState.score;
        
        // 播放收集音效（可选）
        playCollectSound();
    } else {
        // 错误的字母，不收集（可以添加错误提示）
        console.log(`错误！应该收集 '${targetLetter.toUpperCase()}' 但碰到了 '${letter.toUpperCase()}'`);
    }
}

// 播放收集音效（可选）
function playCollectSound() {
    // 可以添加音效文件
}

// 绘制游戏
function draw() {
    const ctx = gameState.ctx;
    
    // 清空画布
    ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
    
    // 保存上下文
    ctx.save();
    
    // 应用背景偏移（移动坐标系）
    ctx.translate(gameState.backgroundOffsetX, gameState.backgroundOffsetY);
    
    // 绘制背景网格
    drawGrid();
    
    // 绘制猫咪（在世界坐标系中）
    gameState.cats.forEach(cat => {
        // 计算猫咪是否在屏幕可见范围内
        const screenX = cat.worldX + gameState.backgroundOffsetX;
        const screenY = cat.worldY + gameState.backgroundOffsetY;
        
        // 只绘制可见的猫咪
        if (screenX > -CONFIG.CAT_SIZE && screenX < gameState.canvas.width + CONFIG.CAT_SIZE &&
            screenY > -CONFIG.CAT_SIZE && screenY < gameState.canvas.height + CONFIG.CAT_SIZE) {
            
            if (cat.image && cat.image.complete) {
                // 绘制猫咪图片（不旋转）
                ctx.drawImage(cat.image, cat.worldX, cat.worldY, CONFIG.CAT_SIZE, CONFIG.CAT_SIZE);
            } else {
                // 如果图片未加载，绘制占位符
                ctx.fillStyle = '#ffa500';
                ctx.fillRect(cat.worldX, cat.worldY, CONFIG.CAT_SIZE, CONFIG.CAT_SIZE);
            }
            
            // 绘制字母（在图片上方）
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.font = `bold ${CONFIG.LETTER_FONT_SIZE}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            // 先绘制描边（黑色边框）
            ctx.strokeText(cat.letter.toUpperCase(), 
                cat.worldX + CONFIG.CAT_SIZE / 2, 
                cat.worldY - 5);
            // 再绘制文字（白色填充）
            ctx.fillText(cat.letter.toUpperCase(), 
                cat.worldX + CONFIG.CAT_SIZE / 2, 
                cat.worldY - 5);
        }
    });
    
    // 恢复上下文
    ctx.restore();
    
    // 绘制救助车（在屏幕坐标系中，固定位置）
    drawRescueCar();
}

// 绘制背景（在世界坐标系中）
function drawGrid() {
    const ctx = gameState.ctx;
    
    // 绘制渐变背景（天空到地面）
    const gradient = ctx.createLinearGradient(0, -gameState.backgroundOffsetY, 0, -gameState.backgroundOffsetY + gameState.canvas.height);
    gradient.addColorStop(0, '#87CEEB'); // 天空蓝
    gradient.addColorStop(0.7, '#98D8C8'); // 浅绿
    gradient.addColorStop(1, '#90EE90'); // 草地绿
    
    ctx.fillStyle = gradient;
    ctx.fillRect(-gameState.backgroundOffsetX - 100, -gameState.backgroundOffsetY - 100, 
        gameState.canvas.width + 200, gameState.canvas.height + 200);
    
    // 绘制道路网格线（创造运动感）
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    
    const gridSize = 80;
    // 计算可见区域的网格范围
    const startX = Math.floor(-gameState.backgroundOffsetX / gridSize) * gridSize;
    const endX = startX + gameState.canvas.width + gridSize * 2;
    const startY = Math.floor(-gameState.backgroundOffsetY / gridSize) * gridSize;
    const endY = startY + gameState.canvas.height + gridSize * 2;
    
    // 绘制垂直线
    for (let x = startX; x < endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = startY; y < endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
    }
    
    // 绘制一些装饰性的点（营造场景感）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    const dotSize = 3;
    for (let x = startX; x < endX; x += gridSize * 2) {
        for (let y = startY; y < endY; y += gridSize * 2) {
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// 绘制救助车（固定在屏幕中央，逼真的救助车样式）
function drawRescueCar() {
    const ctx = gameState.ctx;
    const car = gameState.rescueCar;
    const carWidth = CONFIG.RESCUE_CAR_WIDTH;
    const carHeight = CONFIG.RESCUE_CAR_HEIGHT;
    
    ctx.save();
    // 使用屏幕坐标（固定位置）
    ctx.translate(car.screenX, car.screenY);
    ctx.rotate(car.angle);
    
    // 绘制车身主体（矩形，稍微圆角效果）
    const bodyWidth = carWidth;
    const bodyHeight = carHeight * 0.7; // 车身高度
    const bodyX = -bodyWidth / 2;
    const bodyY = -bodyHeight / 2;
    
    // 绘制车身阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(bodyX + 2, bodyY + 2, bodyWidth, bodyHeight);
    
    // 绘制车身主体（红色）
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(bodyX, bodyY, bodyWidth, bodyHeight);
    
    // 绘制车窗（前挡风玻璃）
    const windowWidth = bodyWidth * 0.4;
    const windowHeight = bodyHeight * 0.3;
    ctx.fillStyle = '#4a90e2';
    ctx.fillRect(bodyX + bodyWidth * 0.1, bodyY + bodyHeight * 0.1, windowWidth, windowHeight);
    
    // 绘制车窗边框
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(bodyX + bodyWidth * 0.1, bodyY + bodyHeight * 0.1, windowWidth, windowHeight);
    
    // 绘制车头（在前方，即旋转后的右方）
    const hoodWidth = bodyWidth * 0.5;
    const hoodHeight = carHeight * 0.3;
    const hoodX = bodyX + bodyWidth; // 车头在车身前方
    const hoodY = bodyY + bodyHeight / 2 - hoodHeight / 2; // 车头垂直居中
    
    ctx.fillStyle = '#cc0000';
    ctx.fillRect(hoodX, hoodY, hoodWidth, hoodHeight);
    
    // 绘制车头前保险杠
    ctx.fillStyle = '#333';
    ctx.fillRect(hoodX, hoodY + hoodHeight - 5, hoodWidth, 5);
    
    // 绘制车灯（两个前大灯）
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(hoodX + hoodWidth * 0.3, hoodY + hoodHeight * 0.3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hoodX + hoodWidth * 0.7, hoodY + hoodHeight * 0.3, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制白色医疗十字（在车身上）
    ctx.fillStyle = '#ffffff';
    const crossSize = bodyWidth * 0.4;
    const crossX = bodyX + bodyWidth / 2 - crossSize / 2;
    const crossY = bodyY + bodyHeight / 2 - crossSize / 2;
    
    // 横线
    ctx.fillRect(crossX, crossY + crossSize / 2 - crossSize / 6, crossSize, crossSize / 3);
    // 竖线
    ctx.fillRect(crossX + crossSize / 2 - crossSize / 6, crossY, crossSize / 3, crossSize);
    
    // 绘制车轮
    const wheelRadius = 8;
    const wheelY = bodyY + bodyHeight - 5;
    
    // 左前轮
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(bodyX + bodyWidth * 0.25, wheelY, wheelRadius, 0, Math.PI * 2);
    ctx.fill();
    // 轮毂
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.arc(bodyX + bodyWidth * 0.25, wheelY, wheelRadius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // 右前轮
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(bodyX + bodyWidth * 0.75, wheelY, wheelRadius, 0, Math.PI * 2);
    ctx.fill();
    // 轮毂
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.arc(bodyX + bodyWidth * 0.75, wheelY, wheelRadius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制车身边框
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(bodyX, bodyY, bodyWidth, bodyHeight);
    ctx.strokeRect(hoodX, hoodY, hoodWidth, hoodHeight);
    
    // 绘制已收集的猫咪（叠加在救助车后部上方）
    if (gameState.collectedCats.length > 0) {
        const catOverlaySize = 25;
        const overlayStartX = bodyX + bodyWidth * 0.2;
        const overlayStartY = bodyY - bodyHeight * 0.15; // 在车身上方
        const catsPerRow = 3;
        const maxRows = 2; // 最多显示2行
        
        // 只显示最近收集的猫咪（最多6只）
        const catsToShow = gameState.collectedCats.slice(-Math.min(6, catsPerRow * maxRows));
        
        catsToShow.forEach((collectedCat, index) => {
            const row = Math.floor(index / catsPerRow);
            const col = index % catsPerRow;
            const catX = overlayStartX + col * (catOverlaySize + 3);
            const catY = overlayStartY + row * (catOverlaySize + 3);
            
            // 绘制背景框（让猫咪更清晰）
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(catX - 1, catY - 1, catOverlaySize + 2, catOverlaySize + 2);
            
            // 绘制猫咪图片（如果已加载）
            if (collectedCat.image && collectedCat.image.complete) {
                ctx.drawImage(collectedCat.image, catX, catY, catOverlaySize, catOverlaySize);
            } else {
                // 占位符
                ctx.fillStyle = '#ffa500';
                ctx.fillRect(catX, catY, catOverlaySize, catOverlaySize);
            }
            
            // 绘制字母标签（在图片上方）
            ctx.fillStyle = '#000';
            ctx.font = 'bold 9px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(collectedCat.letter.toUpperCase(), 
                catX + catOverlaySize / 2, 
                catY - 8);
        });
    }
    
    ctx.restore();
}

// 游戏主循环
function gameLoop() {
    if (!gameState.isGameRunning) return;
    
    update();
    draw();
    
    gameState.animationId = requestAnimationFrame(gameLoop);
}

// 下一个单词
function nextWord() {
    gameState.currentWordIndex++;
    gameState.cats = [];
    gameState.collectedLetters = [];
    gameState.collectedCats = [];
    gameState.lastCatSpawn = Date.now();
    // 重置背景偏移（可选，也可以保持当前位置）
    // gameState.backgroundOffsetX = 0;
    // gameState.backgroundOffsetY = 0;
    loadCurrentWord();
}

// 重新开始游戏
function restartGame() {
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
    }
    startGame();
}

// 页面加载完成后初始化游戏
window.addEventListener('load', initGame);

