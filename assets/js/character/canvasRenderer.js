// Пиксельный Canvas-рендерер для персонажа
export class CharacterCanvasRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        if (!this.canvas) {
            console.error('❌ [CanvasRenderer] Canvas не найден');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        this.pixelSize = 3;
        this.animationFrame = 0;
        this.lastTime = 0;
        this.running = false;

        this.state = {
            environment: 'normal',
            health: 100,
            hunger: 100,
            comfort: 100,
            diseases: [],
            isSick: false,
            isCritical: false,
            ageInYears: 30
        };

        this.animate = this.animate.bind(this);
    }

    start() {
        if (this.running) return;
        this.running = true;
        requestAnimationFrame(this.animate);
    }

    stop() {
        this.running = false;
    }

    updateState(newState) {
        this.state = { ...this.state, ...newState };
    }

    animate(timestamp) {
        if (!this.running) return;
        if (!this.lastTime) this.lastTime = timestamp;
        const delta = timestamp - this.lastTime;

        if (delta >= 100) {
            this.animationFrame++;
            this.lastTime = timestamp;
            try {
                this.render();
            } catch (e) {
                console.error('⚠️ Ошибка рендера кадра:', e);
            }
        }
        requestAnimationFrame(this.animate);
    }

    render() {
        const { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);
        
        this.drawSky();        // Слой 1: Небо (верхние 60%)
        this.drawHills();      // 🔑 НОВОЕ: Холмы на заднем плане (10%)
        this.drawGround();     // Слой 2: Земля с дорогой (нижние 30%)
        this.drawScenery();    // Слой 3: Деревья, облака
        this.drawDwelling();   // Слой 4: Дом

        if (this.state.isCritical || this.state.isSick) {
            this.drawHospitalBed();
        } else {
            this.drawCharacter();
        }
    }

    // 🔑 НОВОЕ: Небо с более контрастными цветами
    drawSky() {
        const { width, height } = this.canvas;
        const skyHeight = height * 0.6; // Небо теперь 60%
        
        const grad = this.ctx.createLinearGradient(0, 0, 0, skyHeight);
        switch (this.state.environment) {
            case 'luxury': 
                grad.addColorStop(0, '#87CEEB'); // Голубое небо
                grad.addColorStop(1, '#FFE4B5'); // Тёплый горизонт
                break;
            case 'normal': 
                grad.addColorStop(0, '#4A90E2'); // Яркое голубое
                grad.addColorStop(1, '#87CEEB'); // Светлое у горизонта
                break;
            case 'poor': 
                grad.addColorStop(0, '#808080'); // Серое
                grad.addColorStop(1, '#A9A9A9'); // Светло-серое
                break;
            case 'homeless': 
                grad.addColorStop(0, '#1a1a2e'); // Тёмно-синий
                grad.addColorStop(1, '#2c3e50'); // Серо-синий
                break;
            default: 
                grad.addColorStop(0, '#4A90E2');
                grad.addColorStop(1, '#87CEEB');
        }
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, width, skyHeight);
    }

    // 🔑 НОВОЕ: Холмы на заднем плане
    drawHills() {
        const { width, height } = this.canvas;
        const p = this.pixelSize;
        const ctx = this.ctx;
        const hillY = height * 0.6; // Начало холмов

        // Дальние холмы (светлее, меньше)
        ctx.fillStyle = this.state.environment === 'luxury' ? '#90EE90' : 
                       this.state.environment === 'poor' ? '#808080' : '#7CB342';
        
        // Холм 1 (слева)
        ctx.beginPath();
        ctx.moveTo(0, hillY);
        ctx.lineTo(width * 0.15, hillY - height * 0.08);
        ctx.lineTo(width * 0.3, hillY);
        ctx.closePath();
        ctx.fill();

        // Холм 2 (центр)
        ctx.beginPath();
        ctx.moveTo(width * 0.25, hillY);
        ctx.lineTo(width * 0.5, hillY - height * 0.1);
        ctx.lineTo(width * 0.75, hillY);
        ctx.closePath();
        ctx.fill();

        // Холм 3 (справа)
        ctx.beginPath();
        ctx.moveTo(width * 0.65, hillY);
        ctx.lineTo(width * 0.85, hillY - height * 0.07);
        ctx.lineTo(width, hillY);
        ctx.closePath();
        ctx.fill();

        // Ближние холмы (темнее, больше)
        ctx.fillStyle = this.state.environment === 'luxury' ? '#32CD32' : 
                       this.state.environment === 'poor' ? '#696969' : '#558B2F';
        
        ctx.beginPath();
        ctx.moveTo(0, hillY + p * 5);
        ctx.lineTo(width * 0.2, hillY - height * 0.03);
        ctx.lineTo(width * 0.4, hillY + p * 5);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(width * 0.35, hillY + p * 5);
        ctx.lineTo(width * 0.6, hillY - height * 0.05);
        ctx.lineTo(width * 0.85, hillY + p * 5);
        ctx.closePath();
        ctx.fill();
    }

    // 🔑 НОВОЕ: Земля с дорогой (нижние 30%)
    drawGround() {
        const { width, height } = this.canvas;
        const groundY = height * 0.7; // Линия горизонта (где начинается земля)
        const p = this.pixelSize;
        const ctx = this.ctx;

        // Трава/земля
        ctx.fillStyle = '#4a7a3a';
        ctx.fillRect(0, groundY, width, height - groundY);
        
        // Текстура травы
        ctx.fillStyle = '#3d6630';
        for (let i = 0; i < width; i += p * 6) {
            ctx.fillRect(i, groundY + p * 2, p * 2, p * 3);
            ctx.fillRect(i + p * 3, groundY + p * 4, p * 2, p * 2);
        }

        // Асфальтовая дорога
        ctx.fillStyle = '#5a5a5a';
        ctx.fillRect(0, groundY + p * 8, width, p * 12);

        // Статичная разметка
        ctx.fillStyle = '#f0e68c';
        for (let i = 0; i < width; i += p * 20) {
            ctx.fillRect(i, groundY + p * 13, p * 10, p * 2);
        }
    }

    drawScenery() {
        const { width, height } = this.canvas;
        const p = this.pixelSize;
        const ctx = this.ctx;
        const groundY = height * 0.7;

        // Облака (в небе)
        if (this.state.environment !== 'homeless') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            const cloudSpeed = this.animationFrame * 0.3;
            const cloud1X = (width * 0.8 - cloudSpeed) % (width + 200);
            const cloud2X = (width * 0.4 - cloudSpeed * 0.7) % (width + 200);
            
            this.drawCloud(cloud1X, height * 0.15, p * 2);
            this.drawCloud(cloud2X, height * 0.1, p * 1.5);
        }

        // Деревья (стоят на земле)
        if (this.state.environment !== 'homeless') {
            // Дальний план
            this.drawTree(width * 0.70, groundY, p * 12, '#2d6a24', '#1e4d1b');
            this.drawTree(width * 0.85, groundY, p * 14, '#2d6a24', '#1e4d1b');
            this.drawTree(width * 0.95, groundY, p * 10, '#2d6a24', '#1e4d1b');
            
            // Средний план
            this.drawTree(width * 0.75, groundY, p * 18, '#3a8c32', '#266322');
            this.drawTree(width * 0.92, groundY, p * 16, '#3a8c32', '#266322');
        }
    }

    drawCloud(x, y, p) {
        const ctx = this.ctx;
        ctx.fillRect(x, y, p * 10, p * 4);
        ctx.fillRect(x + p * 2, y - p * 2, p * 6, p * 2);
        ctx.fillRect(x + p * 4, y - p * 4, p * 4, p * 2);
    }

    drawTree(x, groundY, size, colorLight, colorDark) {
        const ctx = this.ctx;
        
        // Ствол
        ctx.fillStyle = '#5c3a1e';
        ctx.fillRect(x, groundY - size, size * 0.4, size);
        ctx.fillStyle = '#3e2612';
        ctx.fillRect(x, groundY - size, size * 0.15, size);
        
        // Крона (3 яруса)
        ctx.fillStyle = colorDark;
        ctx.fillRect(x - size * 0.6, groundY - size * 1.2, size * 1.6, size * 0.6);
        ctx.fillStyle = colorLight;
        ctx.fillRect(x - size * 0.5, groundY - size * 1.3, size * 1.4, size * 0.5);
        
        ctx.fillStyle = colorDark;
        ctx.fillRect(x - size * 0.4, groundY - size * 1.8, size * 1.2, size * 0.6);
        ctx.fillStyle = colorLight;
        ctx.fillRect(x - size * 0.3, groundY - size * 1.9, size * 1.0, size * 0.5);
        
        ctx.fillStyle = colorDark;
        ctx.fillRect(x - size * 0.2, groundY - size * 2.3, size * 0.8, size * 0.5);
        ctx.fillStyle = colorLight;
        ctx.fillRect(x - size * 0.1, groundY - size * 2.4, size * 0.6, size * 0.4);
    }

    drawDwelling() {
        const { width, height } = this.canvas;
        const groundY = height * 0.7;
        const x = width * 0.05; 
        const y = groundY - 100; // Дом стоит на земле

        switch (this.state.environment) {
            case 'luxury': this.drawMansion(x, y); break;
            case 'normal': this.drawHouse(x, y); break;
            case 'poor': this.drawOldHouse(x, y); break;
            case 'homeless': this.drawCardboardBox(x, groundY - 30); this.drawRain(); break;
        }
    }

    // 🏰 ОСОБНЯК
    drawMansion(x, y) {
        const p = this.pixelSize;
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(2, 2);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(p * 2, p * 14, p * 26, p * 2);

        ctx.fillStyle = '#6b6b6b';
        ctx.fillRect(0, p * 12, p * 30, p * 2);
        ctx.fillStyle = '#555555';
        ctx.fillRect(p * 2, p * 10, p * 26, p * 2);

        ctx.fillStyle = '#f0e6d2';
        ctx.fillRect(p * 2, 0, p * 26, p * 10);

        ctx.fillStyle = '#e6d9c0';
        for (let i = 0; i < 26; i += 4) {
            ctx.fillRect(p * 2 + i * p, 0, p, p * 10);
        }

        ctx.fillStyle = '#8b3a3a';
        ctx.beginPath();
        ctx.moveTo(-p * 2, p * 2);
        ctx.lineTo(p * 15, -p * 8);
        ctx.lineTo(p * 32, p * 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#a54a4a';
        ctx.fillRect(p * 6, -p * 4, p * 18, p * 6);
        ctx.fillStyle = '#8b3a3a';
        ctx.beginPath();
        ctx.moveTo(p * 4, -p * 4);
        ctx.lineTo(p * 15, -p * 10);
        ctx.lineTo(p * 26, -p * 4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(p * 5, p * 3, p * 5, p * 5);
        ctx.fillRect(p * 20, p * 3, p * 5, p * 5);

        ctx.fillStyle = '#4a3728';
        ctx.fillRect(p * 7, p * 3, p, p * 5);
        ctx.fillRect(p * 22, p * 3, p, p * 5);
        ctx.fillRect(p * 5, p * 5, p * 5, p);
        ctx.fillRect(p * 20, p * 5, p * 5, p);

        ctx.fillStyle = 'rgba(255, 255, 200, 0.6)';
        ctx.fillRect(p * 5, p * 3, p * 2, p * 2);
        ctx.fillRect(p * 20, p * 3, p * 2, p * 2);

        ctx.fillStyle = '#5c3a1e';
        ctx.fillRect(p * 11, p * 5, p * 8, p * 5);
        ctx.fillStyle = '#4a2e18';
        ctx.fillRect(p * 14, p * 5, p, p * 5);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(p * 12, p * 7, p, p);
        ctx.fillRect(p * 16, p * 7, p, p);

        ctx.fillStyle = '#7a5243';
        ctx.fillRect(p * 22, -p * 6, p * 4, p * 8);
        ctx.fillStyle = '#5c3a2e';
        ctx.fillRect(p * 21, -p * 7, p * 6, p * 2);

        ctx.fillStyle = '#2d6a24';
        ctx.fillRect(p * 2, p * 6, p * 3, p * 4);
        ctx.fillRect(p * 3, p * 5, p * 2, p * 2);

        ctx.restore();
    }

    // 🏠 ОБЫЧНЫЙ ДОМ
    drawHouse(x, y) {
        const p = this.pixelSize;
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(2, 2);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(p, p * 12, p * 22, p * 2);

        ctx.fillStyle = '#7d7d7d';
        ctx.fillRect(-p, p * 11, p * 24, p * 2);

        ctx.fillStyle = '#e8c89a';
        ctx.fillRect(0, p * 2, p * 22, p * 9);

        ctx.fillStyle = '#d4b078';
        for (let i = 0; i < 9; i += 2) {
            ctx.fillRect(0, p * 2 + i * p, p * 22, p * 0.5);
        }

        ctx.fillStyle = '#6b4226';
        ctx.beginPath();
        ctx.moveTo(-p * 2, p * 2);
        ctx.lineTo(p * 11, -p * 6);
        ctx.lineTo(p * 24, p * 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#8b5a33';
        ctx.beginPath();
        ctx.moveTo(-p * 2, p * 2);
        ctx.lineTo(p * 11, -p * 6);
        ctx.lineTo(p * 11, p * 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#8b4513';
        ctx.fillRect(p * 17, -p * 5, p * 3, p * 5);
        ctx.fillStyle = '#5c2e0e';
        ctx.fillRect(p * 16, -p * 6, p * 5, p * 2);

        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(p * 3, p * 4, p * 5, p * 4);
        ctx.fillStyle = '#4a3728';
        ctx.fillRect(p * 5, p * 4, p, p * 4);
        ctx.fillRect(p * 3, p * 5, p * 5, p);
        ctx.fillStyle = 'rgba(255, 240, 150, 0.7)';
        ctx.fillRect(p * 3, p * 4, p * 2, p);

        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(p * 14, p * 4, p * 5, p * 4);
        ctx.fillStyle = '#4a3728';
        ctx.fillRect(p * 16, p * 4, p, p * 4);
        ctx.fillRect(p * 14, p * 5, p * 5, p);

        ctx.fillStyle = '#5c3a1e';
        ctx.fillRect(p * 9, p * 6, p * 4, p * 5);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(p * 11, p * 8, p, p);

        ctx.fillStyle = '#a07850';
        for (let i = 0; i < 22; i += 3) {
            ctx.fillRect(p * i, p * 10, p, p * 2);
        }
        ctx.fillRect(0, p * 10, p * 22, p);

        ctx.restore();
    }

    // 🏚️ СТАРЫЙ ДОМ
    drawOldHouse(x, y) {
        const p = this.pixelSize;
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(2, 2);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(p, p * 12, p * 18, p * 2);

        ctx.fillStyle = '#9a9a9a';
        ctx.fillRect(0, p * 3, p * 18, p * 8);

        ctx.fillStyle = '#7a7a7a';
        ctx.fillRect(0, p * 3, p * 4, p * 8);

        ctx.fillStyle = '#4a4a4a';
        ctx.beginPath();
        ctx.moveTo(-p, p * 3);
        ctx.lineTo(p * 5, -p * 3);
        ctx.lineTo(p * 13, -p * 2);
        ctx.lineTo(p * 19, p * 3);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#6b6b6b';
        ctx.fillRect(p * 12, -p, p * 4, p * 2);

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p * 3, p * 4);
        ctx.lineTo(p * 5, p * 7);
        ctx.lineTo(p * 4, p * 9);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(p * 14, p * 5);
        ctx.lineTo(p * 16, p * 8);
        ctx.stroke();

        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(p * 6, p * 5, p * 4, p * 3);
        ctx.fillStyle = '#6b5340';
        ctx.fillRect(p * 5, p * 5, p * 6, p);
        ctx.fillRect(p * 5, p * 7, p * 6, p);

        ctx.fillStyle = '#5c4a3a';
        ctx.fillRect(p * 12, p * 6, p * 3, p * 5);
        ctx.fillStyle = '#3a2e22';
        ctx.fillRect(p * 12, p * 6, p, p * 5);

        ctx.fillStyle = '#4a7a3a';
        ctx.fillRect(p * 2, p * 10, p, p * 2);
        ctx.fillRect(p * 8, p * 10, p, p * 2);
        ctx.fillRect(p * 15, p * 10, p, p * 2);

        ctx.restore();
    }

    // 📦 КАРТОННАЯ КОРОБКА
    drawCardboardBox(x, y) {
        const p = this.pixelSize;
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(2, 2);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(-p, p * 12, p * 16, p * 2);

        ctx.fillStyle = '#b8860b';
        ctx.fillRect(0, p * 4, p * 14, p * 8);

        ctx.fillStyle = '#8b6508';
        ctx.fillRect(0, p * 4, p * 3, p * 8);

        ctx.fillStyle = '#a0750a';
        ctx.fillRect(-p, p * 2, p * 5, p * 2);
        ctx.fillRect(p * 10, p * 2, p * 5, p * 2);

        ctx.fillStyle = '#2a1a05';
        ctx.fillRect(p * 4, p * 7, p * 6, p * 5);

        ctx.fillStyle = '#5c4008';
        ctx.fillRect(p * 5, p * 5, p * 4, p);
        ctx.fillRect(p * 6, p * 6, p * 2, p);

        ctx.fillStyle = '#666';
        ctx.fillRect(p * 16, p * 11, p * 3, p);
        ctx.fillStyle = '#888';
        ctx.fillRect(p * 18, p * 10, p * 2, p);

        ctx.fillStyle = 'rgba(100, 140, 180, 0.5)';
        ctx.fillRect(-p * 3, p * 13, p * 8, p * 2);

        ctx.restore();
    }

    // 🌧️ ДОЖДЬ
    drawRain() {
        const { width, height } = this.canvas;
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(200, 220, 255, 0.6)';
        for (let i = 0; i < 40; i++) {
            const rx = (i * 17 + this.animationFrame * 4) % width;
            const ry = (i * 23 + this.animationFrame * 6) % (height * 0.7);
            ctx.fillRect(rx, ry, 2, 10);
        }
    }

    drawHospitalBed() {
        const { width, height } = this.canvas;
        const p = this.pixelSize;
        const cx = width * 0.55;
        const cy = height * 0.65;
        const ctx = this.ctx;

        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(cx - p * 10, cy, p * 20, p * 2);
        ctx.fillRect(cx - p * 9, cy + p * 2, p * 2, p * 5);
        ctx.fillRect(cx + p * 7, cy + p * 2, p * 2, p * 5);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cx - p * 9, cy - p * 2, p * 18, p * 2);
        ctx.fillStyle = '#F0F8FF';
        ctx.fillRect(cx - p * 9, cy - p * 4, p * 4, p * 2);
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(cx - p * 4, cy - p * 3, p * 12, p * 3);

        ctx.fillStyle = '#F1C27D';
        ctx.fillRect(cx - p * 8, cy - p * 5, p * 3, p * 3);
        ctx.fillStyle = '#3B2A1A';
        ctx.fillRect(cx - p * 8, cy - p * 6, p * 3, p);
        ctx.fillStyle = '#000';
        ctx.fillRect(cx - p * 7, cy - p * 4, p, 2);
        ctx.fillRect(cx - p * 5, cy - p * 4, p, 2);
        ctx.fillStyle = '#a5d6a7';
        ctx.fillRect(cx - p * 4, cy - p * 3, p * 10, p * 3);
    }

    drawCharacter() {
        const { width, height } = this.canvas;
        const p = this.pixelSize;
        const cx = width * 0.55;
        const cy = height * 0.6;
        const bob = Math.sin(this.animationFrame * 0.4) * p * 0.5;
        const y = cy + bob;
        const ctx = this.ctx;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(cx - p * 4, cy + p * 12, p * 8, p);

        ctx.fillStyle = '#2F3B52';
        ctx.fillRect(cx - p * 3, y + p * 6, p * 2, p * 6);
        ctx.fillRect(cx + p, y + p * 6, p * 2, p * 6);

        ctx.fillStyle = '#667eea';
        ctx.fillRect(cx - p * 4, y, p * 8, p * 6);

        ctx.fillStyle = '#F1C27D';
        ctx.fillRect(cx - p * 6, y + p, p * 2, p * 5);
        ctx.fillRect(cx + p * 4, y + p, p * 2, p * 5);

        ctx.fillStyle = '#D9A45F';
        ctx.fillRect(cx - p, y - p * 2, p * 2, p * 2);

        ctx.fillStyle = '#F1C27D';
        ctx.fillRect(cx - p * 3, y - p * 7, p * 6, p * 5);

        ctx.fillStyle = '#3B2A1A';
        ctx.fillRect(cx - p * 3, y - p * 8, p * 6, p * 2);

        ctx.fillStyle = '#000';
        ctx.fillRect(cx - p * 2, y - p * 5, p, p);
        ctx.fillRect(cx + p, y - p * 5, p, p);

        this.state.diseases.forEach((diseaseId, index) => {
            const offsetX = (index - this.state.diseases.length / 2) * p * 4;
            if (diseaseId === 'trauma') {
                ctx.fillStyle = '#FFB6C1';
                ctx.fillRect(cx + p * 3 + offsetX, y - p * 4, p * 2, p);
            } else if (diseaseId === 'flu') {
                ctx.fillStyle = 'rgba(144, 238, 144, 0.4)';
                ctx.fillRect(cx - p * 3, y - p * 7, p * 6, p * 5);
            }
        });
    }
}