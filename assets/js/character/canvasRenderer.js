// Пиксельный Canvas-рендерер для персонажа

export class CharacterCanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas element not found:', canvasId);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false; // Пиксельный режим
        
        // Настройки
        this.pixelSize = 4; // Размер одного "пикселя"
        this.scale = 1;
        
        // Состояние
        this.currentState = {
            environment: 'normal',
            health: 100,
            diseases: [],
            isSick: false,
            isCritical: false
        };
        
        // Анимация
        this.animationFrame = 0;
        this.lastTime = 0;
        
        // Запуск анимации
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }
    
    // Обновление состояния
    updateState(state) {
        this.currentState = { ...this.currentState, ...state };
    }
    
    // Основной цикл анимации
    animate(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = timestamp - this.lastTime;
        
        if (deltaTime >= 100) { // 10 FPS для пиксельной анимации
            this.animationFrame++;
            this.lastTime = timestamp;
            this.render();
        }
        
        requestAnimationFrame(this.animate);
    }
    
    // Рендер кадра
    render() {
        const { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);
        
        // 1. Рисуем фон
        this.drawBackground();
        
        // 2. Рисуем жилище (слева)
        this.drawDwelling();
        
        // 3. Рисуем персонажа
        if (this.currentState.isCritical || this.currentState.isSick) {
            this.drawHospitalBed();
        } else {
            this.drawCharacter();
        }
    }
    
    // Фон
    drawBackground() {
        const { width, height } = this.canvas;
        
        // Градиент неба
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        
        switch (this.currentState.environment) {
            case 'luxury':
                gradient.addColorStop(0, '#87CEEB');
                gradient.addColorStop(1, '#E0F6FF');
                break;
            case 'normal':
                gradient.addColorStop(0, '#B0C4DE');
                gradient.addColorStop(1, '#F0F8FF');
                break;
            case 'poor':
                gradient.addColorStop(0, '#A9A9A9');
                gradient.addColorStop(1, '#D3D3D3');
                break;
            case 'homeless':
                gradient.addColorStop(0, '#696969');
                gradient.addColorStop(1, '#808080');
                break;
            default:
                gradient.addColorStop(0, '#87CEEB');
                gradient.addColorStop(1, '#E0F6FF');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
        
        // Земля
        this.ctx.fillStyle = '#8B7355';
        this.ctx.fillRect(0, height * 0.7, width, height * 0.3);
    }
    
    // Жилище (слева на заднем фоне)
    drawDwelling() {
        const x = 50;
        const y = this.canvas.height * 0.4;
        const size = this.pixelSize * 8;
        
        switch (this.currentState.environment) {
            case 'luxury':
                this.drawCastle(x, y, size);
                break;
            case 'normal':
                this.drawHouse(x, y, size);
                break;
            case 'poor':
                this.drawOldHouse(x, y, size);
                break;
            case 'homeless':
                // Бездомный - нет жилища
                break;
        }
    }
    
    // Замок (роскошный)
    drawCastle(x, y, size) {
        const ctx = this.ctx;
        const p = this.pixelSize;
        
        // Основное здание
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x, y, size * 2, size * 2);
        
        // Башни
        ctx.fillRect(x - p * 2, y - p * 4, p * 4, p * 4);
        ctx.fillRect(x + size * 2 - p * 2, y - p * 4, p * 4, p * 4);
        
        // Крыша
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(x - p * 3, y - p * 5, p * 6, p);
        ctx.fillRect(x + size * 2 - p * 3, y - p * 5, p * 6, p);
        
        // Окна
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(x + p * 2, y + p * 2, p * 2, p * 3);
        ctx.fillRect(x + size - p * 4, y + p * 2, p * 2, p * 3);
    }
    
    // Обычный дом
    drawHouse(x, y, size) {
        const ctx = this.ctx;
        const p = this.pixelSize;
        
        // Стены
        ctx.fillStyle = '#F5DEB3';
        ctx.fillRect(x, y, size, size);
        
        // Крыша
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(x - p, y);
        ctx.lineTo(x + size / 2, y - p * 4);
        ctx.lineTo(x + size + p, y);
        ctx.closePath();
        ctx.fill();
        
        // Дверь
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + size / 2 - p, y + size - p * 4, p * 2, p * 4);
        
        // Окно
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(x + p * 2, y + p * 2, p * 3, p * 3);
    }
    
    // Старый дом
    drawOldHouse(x, y, size) {
        const ctx = this.ctx;
        const p = this.pixelSize;
        
        // Стены (серые)
        ctx.fillStyle = '#808080';
        ctx.fillRect(x, y, size, size);
        
        // Крыша (помятая)
        ctx.fillStyle = '#696969';
        ctx.fillRect(x - p, y - p * 2, size + p * 2, p * 3);
        
        // Дверь
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(x + size / 2 - p, y + size - p * 4, p * 2, p * 4);
        
        // Трещины
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + p * 2, y + p);
        ctx.lineTo(x + p * 4, y + p * 3);
        ctx.stroke();
    }
    
    // Больничная койка
    drawHospitalBed() {
        const ctx = this.ctx;
        const p = this.pixelSize;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height * 0.6;
        
        // Койка
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(centerX - p * 8, centerY, p * 16, p * 2);
        
        // Ножки
        ctx.fillRect(centerX - p * 7, centerY + p * 2, p * 2, p * 4);
        ctx.fillRect(centerX + p * 5, centerY + p * 2, p * 2, p * 4);
        
        // Матрас
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(centerX - p * 7, centerY - p * 2, p * 14, p * 2);
        
        // Одеяло
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(centerX - p * 6, centerY - p * 3, p * 12, p * 2);
        
        // Подушка
        ctx.fillStyle = '#F0F8FF';
        ctx.fillRect(centerX - p * 8, centerY - p * 3, p * 3, p * 2);
        
        // Лежачий человечек
        this.drawLyingCharacter(centerX - p * 4, centerY - p * 4);
    }
    
    // Лежачий персонаж
    drawLyingCharacter(x, y) {
        const ctx = this.ctx;
        const p = this.pixelSize;
        
        // Тело (горизонтально)
        ctx.fillStyle = '#667eea';
        ctx.fillRect(x, y, p * 8, p * 2);
        
        // Голова
        ctx.fillStyle = '#F1C27D';
        ctx.fillRect(x - p * 2, y - p, p * 3, p * 2);
        
        // Волосы
        ctx.fillStyle = '#3B2A1A';
        ctx.fillRect(x - p * 2, y - p * 2, p * 3, p);
        
        // Глаза (закрыты)
        ctx.fillStyle = '#000';
        ctx.fillRect(x - p, y - p, p, p * 0.5);
        ctx.fillRect(x, y - p, p, p * 0.5);
    }
    
    // Стоящий персонаж
    drawCharacter() {
        const ctx = this.ctx;
        const p = this.pixelSize;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height * 0.6;
        
        // Анимация покачивания
        const bobOffset = Math.sin(this.animationFrame * 0.3) * p * 0.5;
        
        const x = centerX;
        const y = centerY + bobOffset;
        
        // Тень
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(x - p * 3, y + p * 10, p * 6, p);
        
        // Ноги
        ctx.fillStyle = '#2F3B52';
        ctx.fillRect(x - p * 2, y + p * 6, p * 2, p * 4);
        ctx.fillRect(x, y + p * 6, p * 2, p * 4);
        
        // Тело
        ctx.fillStyle = '#667eea';
        ctx.fillRect(x - p * 3, y, p * 6, p * 6);
        
        // Руки
        ctx.fillStyle = '#F1C27D';
        ctx.fillRect(x - p * 4, y + p, p * 2, p * 4);
        ctx.fillRect(x + p * 2, y + p, p * 2, p * 4);
        
        // Шея
        ctx.fillStyle = '#D9A45F';
        ctx.fillRect(x - p, y - p * 2, p * 2, p * 2);
        
        // Голова
        ctx.fillStyle = '#F1C27D';
        ctx.fillRect(x - p * 2, y - p * 5, p * 4, p * 4);
        
        // Волосы
        ctx.fillStyle = '#3B2A1A';
        ctx.fillRect(x - p * 2, y - p * 6, p * 4, p * 2);
        
        // Глаза
        ctx.fillStyle = '#000';
        ctx.fillRect(x - p, y - p * 4, p, p);
        ctx.fillRect(x, y - p * 4, p, p);
        
        // Эффекты болезней
        if (this.currentState.diseases.length > 0) {
            this.drawDiseaseEffects(x, y);
        }
    }
    
    // Эффекты болезней
    drawDiseaseEffects(x, y) {
        const ctx = this.ctx;
        const p = this.pixelSize;
        
        this.currentState.diseases.forEach((disease, index) => {
            const offsetX = (index - this.currentState.diseases.length / 2) * p * 3;
            
            switch (disease) {
                case 'trauma':
                    // Пластырь
                    ctx.fillStyle = '#FFB6C1';
                    ctx.fillRect(x + p * 2 + offsetX, y - p * 3, p * 2, p);
                    break;
                case 'flu':
                    // Зелёный оттенок
                    ctx.fillStyle = 'rgba(144, 238, 144, 0.5)';
                    ctx.fillRect(x - p * 2, y - p * 5, p * 4, p * 4);
                    break;
                case 'stroke':
                    // Звёзды
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(x - p * 3 + offsetX, y - p * 7, p, p);
                    break;
            }
        });
    }
}