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

        this.pixelSize = 6;
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

        if (delta >= 100) { // ~10 FPS
            this.animationFrame++;
            this.lastTime = timestamp;
            this.render();
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
    }

    drawDwelling() {
        const { width, height } = this.canvas;
        const x = width * 0.1;
        const y = height * 0.45;
        const size = this.pixelSize * 10;
        const p = this.pixelSize;
        const ctx = this.ctx;

        if (this.state.environment === 'luxury') {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(x, y, size * 2, size * 1.5);
            ctx.fillStyle = '#FFC107';
            ctx.fillRect(x - p * 2, y - p * 6, p * 4, p * 6);
            ctx.fillRect(x + size * 2 - p * 2, y - p * 6, p * 4, p * 6);
            ctx.fillStyle = '#8B0000';
            ctx.fillRect(x - p * 3, y - p * 8, p * 6, p * 2);
            ctx.fillRect(x + size * 2 - p * 3, y - p * 8, p * 6, p * 2);
        } else if (this.state.environment === 'normal') {
            ctx.fillStyle = '#F5DEB3';
            ctx.fillRect(x, y, size * 1.5, size);
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.moveTo(x - p, y);
            ctx.lineTo(x + size * 0.75, y - p * 6);
            ctx.lineTo(x + size * 1.5 + p, y);
            ctx.closePath();
            ctx.fill();
        } else if (this.state.environment === 'poor') {
            ctx.fillStyle = '#808080';
            ctx.fillRect(x, y, size * 1.3, size * 0.9);
            ctx.fillStyle = '#505050';
            ctx.fillRect(x - p, y - p * 3, size * 1.3 + p * 2, p * 4);
        } else if (this.state.environment === 'homeless') {
            ctx.fillStyle = 'rgba(200, 220, 255, 0.6)';
            for (let i = 0; i < 30; i++) {
                const rx = (i * 17 + this.animationFrame * 3) % width;
                const ry = (i * 23 + this.animationFrame * 5) % (height * 0.7);
                ctx.fillRect(rx, ry, 2, 8);
            }
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
        
        // Лежачий персонаж
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

        // Эффекты болезней
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