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
            // 🔑 ЗАЩИТА: ошибка в одном кадре не убивает всю анимацию
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
        this.drawBackground();
        this.drawGround();
        this.drawDwelling();

        if (this.state.isCritical || this.state.isSick) {
            this.drawHospitalBed();
        } else {
            this.drawCharacter();
        }
    }

    drawBackground() {
        const { width, height } = this.canvas;
        const grad = this.ctx.createLinearGradient(0, 0, 0, height);
        switch (this.state.environment) {
            case 'luxury': grad.addColorStop(0, '#ffeaa7'); grad.addColorStop(1, '#fdcb6e'); break;
            case 'normal': grad.addColorStop(0, '#87CEEB'); grad.addColorStop(1, '#E0F6FF'); break;
            case 'poor': grad.addColorStop(0, '#a9a9a9'); grad.addColorStop(1, '#d3d3d3'); break;
            case 'homeless': grad.addColorStop(0, '#2c3e50'); grad.addColorStop(1, '#4a5568'); break;
            default: grad.addColorStop(0, '#87CEEB'); grad.addColorStop(1, '#E0F6FF');
        }
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, width, height);
    }

    drawGround() {
        const { width, height } = this.canvas;
        const groundY = height * 0.75;
        this.ctx.fillStyle = '#8B7355';
        this.ctx.fillRect(0, groundY, width, height - groundY);

        // Текстура травы/земли
        const p = this.pixelSize;
        this.ctx.fillStyle = '#6B5340';
        for (let x = 0; x < width; x += p * 8) {
            this.ctx.fillRect(x, groundY, p * 3, p);
        }
    }

    drawDwelling() {
        const { width, height } = this.canvas;
        const x = width * 0.08;
        const y = height * 0.45;

        switch (this.state.environment) {
            case 'luxury':
                this.drawMansion(x, y);
                break;
            case 'normal':
                this.drawHouse(x, y);
                break;
            case 'poor':
                this.drawOldHouse(x, y);
                break;
            case 'homeless':
                this.drawCardboardBox(x, y);
                this.drawRain();
                break;
        }
    }

    // 🏰 ОСОБНЯК
    drawMansion(x, y) {
        const p = this.pixelSize;
        const ctx = this.ctx;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(x + p * 2, y + p * 14, p * 26, p * 2);

        ctx.fillStyle = '#6b6b6b';
        ctx.fillRect(x, y + p * 12, p * 30, p * 2);
        ctx.fillStyle = '#555555';
        ctx.fillRect(x + p * 2, y + p * 10, p * 26, p * 2);

        ctx.fillStyle = '#f0e6d2';
        ctx.fillRect(x + p * 2, y, p * 26, p * 10);

        ctx.fillStyle = '#e6d9c0';
        for (let i = 0; i < 26; i += 4) {
            ctx.fillRect(x + p * 2 + i * p, y, p, p * 10);
        }

        ctx.fillStyle = '#8b3a3a';
        ctx.beginPath();
        ctx.moveTo(x - p * 2, y + p * 2);
        ctx.lineTo(x + p * 15, y - p * 8);
        ctx.lineTo(x + p * 32, y + p * 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#a54a4a';
        ctx.fillRect(x + p * 6, y - p * 4, p * 18, p * 6);
        ctx.fillStyle = '#8b3a3a';
        ctx.beginPath();
        ctx.moveTo(x + p * 4, y - p * 4);
        ctx.lineTo(x + p * 15, y - p * 10);
        ctx.lineTo(x + p * 26, y - p * 4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(x + p * 5, y + p * 3, p * 5, p * 5);
        ctx.fillRect(x + p * 20, y + p * 3, p * 5, p * 5);

        ctx.fillStyle = '#4a3728';
        ctx.fillRect(x + p * 7, y + p * 3, p, p * 5);
        ctx.fillRect(x + p * 22, y + p * 3, p, p * 5);
        ctx.fillRect(x + p * 5, y + p * 5, p * 5, p);
        ctx.fillRect(x + p * 20, y + p * 5, p * 5, p);

        ctx.fillStyle = 'rgba(255, 255, 200, 0.6)';
        ctx.fillRect(x + p * 5, y + p * 3, p * 2, p * 2);
        ctx.fillRect(x + p * 20, y + p * 3, p * 2, p * 2);

        ctx.fillStyle = '#5c3a1e';
        ctx.fillRect(x + p * 11, y + p * 5, p * 8, p * 5);
        ctx.fillStyle = '#4a2e18';
        ctx.fillRect(x + p * 14, y + p * 5, p, p * 5);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x + p * 12, y + p * 7, p, p);
        ctx.fillRect(x + p * 16, y + p * 7, p, p);

        ctx.fillStyle = '#7a5243';
        ctx.fillRect(x + p * 22, y - p * 6, p * 4, p * 8);
        ctx.fillStyle = '#5c3a2e';
        ctx.fillRect(x + p * 21, y - p * 7, p * 6, p * 2);

        ctx.fillStyle = '#2d6a24';
        ctx.fillRect(x + p * 2, y + p * 6, p * 3, p * 4);
        ctx.fillRect(x + p * 3, y + p * 5, p * 2, p * 2);
    }

    // 🏠 ОБЫЧНЫЙ ДОМ (теперь существует!)
    drawHouse(x, y) {
        const p = this.pixelSize;
        const ctx = this.ctx;

        // Тень
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(x + p, y + p * 12, p * 22, p * 2);

        // Фундамент
        ctx.fillStyle = '#7d7d7d';
        ctx.fillRect(x - p, y + p * 11, p * 24, p * 2);

        // Стены (тёплый бежевый)
        ctx.fillStyle = '#e8c89a';
        ctx.fillRect(x, y + p * 2, p * 22, p * 9);

        // Текстура брёвен (горизонтальные линии)
        ctx.fillStyle = '#d4b078';
        for (let i = 0; i < 9; i += 2) {
            ctx.fillRect(x, y + p * 2 + i * p, p * 22, p * 0.5);
        }

        // Дымчатая крыша (двускатная)
        ctx.fillStyle = '#6b4226';
        ctx.beginPath();
        ctx.moveTo(x - p * 2, y + p * 2);
        ctx.lineTo(x + p * 11, y - p * 6);
        ctx.lineTo(x + p * 24, y + p * 2);
        ctx.closePath();
        ctx.fill();

        // Светлая сторона крыши
        ctx.fillStyle = '#8b5a33';
        ctx.beginPath();
        ctx.moveTo(x - p * 2, y + p * 2);
        ctx.lineTo(x + p * 11, y - p * 6);
        ctx.lineTo(x + p * 11, y + p * 2);
        ctx.closePath();
        ctx.fill();

        // Труба
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(x + p * 17, y - p * 5, p * 3, p * 5);
        ctx.fillStyle = '#5c2e0e';
        ctx.fillRect(x + p * 16, y - p * 6, p * 5, p * 2);

        // Окно слева
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(x + p * 3, y + p * 4, p * 5, p * 4);
        ctx.fillStyle = '#4a3728';
        ctx.fillRect(x + p * 5, y + p * 4, p, p * 4);
        ctx.fillRect(x + p * 3, y + p * 5, p * 5, p);
        // Свет в окне
        ctx.fillStyle = 'rgba(255, 240, 150, 0.7)';
        ctx.fillRect(x + p * 3, y + p * 4, p * 2, p);

        // Окно справа
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(x + p * 14, y + p * 4, p * 5, p * 4);
        ctx.fillStyle = '#4a3728';
        ctx.fillRect(x + p * 16, y + p * 4, p, p * 4);
        ctx.fillRect(x + p * 14, y + p * 5, p * 5, p);

        // Дверь
        ctx.fillStyle = '#5c3a1e';
        ctx.fillRect(x + p * 9, y + p * 6, p * 4, p * 5);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x + p * 11, y + p * 8, p, p);

        // Заборчик перед домом
        ctx.fillStyle = '#a07850';
        for (let i = 0; i < 22; i += 3) {
            ctx.fillRect(x + p * i, y + p * 10, p, p * 2);
        }
        ctx.fillRect(x, y + p * 10, p * 22, p);
    }

    // 🏚️ СТАРЫЙ ДОМ (теперь существует!)
    drawOldHouse(x, y) {
        const p = this.pixelSize;
        const ctx = this.ctx;

        // Тень
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(x + p, y + p * 12, p * 18, p * 2);

        // Стены (серые, потрескавшиеся)
        ctx.fillStyle = '#9a9a9a';
        ctx.fillRect(x, y + p * 3, p * 18, p * 8);

        // Более тёмная тень на стене
        ctx.fillStyle = '#7a7a7a';
        ctx.fillRect(x, y + p * 3, p * 4, p * 8);

        // Провисшая кривая крыша
        ctx.fillStyle = '#4a4a4a';
        ctx.beginPath();
        ctx.moveTo(x - p, y + p * 3);
        ctx.lineTo(x + p * 5, y - p * 3);
        ctx.lineTo(x + p * 13, y - p * 2); // провисание
        ctx.lineTo(x + p * 19, y + p * 3);
        ctx.closePath();
        ctx.fill();

        // Заплатка на крыше
        ctx.fillStyle = '#6b6b6b';
        ctx.fillRect(x + p * 12, y - p * 1, p * 4, p * 2);

        // Трещины на стене
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + p * 3, y + p * 4);
        ctx.lineTo(x + p * 5, y + p * 7);
        ctx.lineTo(x + p * 4, y + p * 9);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + p * 14, y + p * 5);
        ctx.lineTo(x + p * 16, y + p * 8);
        ctx.stroke();

        // Заколоченное окно
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(x + p * 6, y + p * 5, p * 4, p * 3);
        ctx.fillStyle = '#6b5340';
        ctx.fillRect(x + p * 5, y + p * 5, p * 6, p);
        ctx.fillRect(x + p * 5, y + p * 7, p * 6, p);

        // Кривая дверь
        ctx.fillStyle = '#5c4a3a';
        ctx.fillRect(x + p * 12, y + p * 6, p * 3, p * 5);
        ctx.fillStyle = '#3a2e22';
        ctx.fillRect(x + p * 12, y + p * 6, p, p * 5);

        // Сорняки у фундамента
        ctx.fillStyle = '#4a7a3a';
        ctx.fillRect(x + p * 2, y + p * 10, p, p * 2);
        ctx.fillRect(x + p * 8, y + p * 10, p, p * 2);
        ctx.fillRect(x + p * 15, y + p * 10, p, p * 2);
    }

    // 📦 КАРТОННАЯ КОРОБКА
    drawCardboardBox(x, y) {
        const p = this.pixelSize;
        const ctx = this.ctx;

        // Тень
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x - p, y + p * 12, p * 16, p * 2);

        // Коробка
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(x, y + p * 4, p * 14, p * 8);

        // Тёмная грань
        ctx.fillStyle = '#8b6508';
        ctx.fillRect(x, y + p * 4, p * 3, p * 8);

        // Открытые клапаны
        ctx.fillStyle = '#a0750a';
        ctx.fillRect(x - p, y + p * 2, p * 5, p * 2);
        ctx.fillRect(x + p * 10, y + p * 2, p * 5, p * 2);

        // Вход
        ctx.fillStyle = '#2a1a05';
        ctx.fillRect(x + p * 4, y + p * 7, p * 6, p * 5);

        // Надпись на коробке
        ctx.fillStyle = '#5c4008';
        ctx.fillRect(x + p * 5, y + p * 5, p * 4, p);
        ctx.fillRect(x + p * 6, y + p * 6, p * 2, p);

        // Мусор рядом
        ctx.fillStyle = '#666';
        ctx.fillRect(x + p * 16, y + p * 11, p * 3, p);
        ctx.fillStyle = '#888';
        ctx.fillRect(x + p * 18, y + p * 10, p * 2, p);

        // Лужа
        ctx.fillStyle = 'rgba(100, 140, 180, 0.5)';
        ctx.fillRect(x - p * 3, y + p * 13, p * 8, p * 2);
    }

    // 🌧️ ДОЖДЬ (теперь существует!)
    drawRain() {
        const { width, height } = this.canvas;
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(200, 220, 255, 0.6)';
        for (let i = 0; i < 30; i++) {
            const rx = (i * 17 + this.animationFrame * 3) % width;
            const ry = (i * 23 + this.animationFrame * 5) % (height * 0.7);
            ctx.fillRect(rx, ry, 2, 8);
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