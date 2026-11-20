import { ITEMS_CONFIG } from '../config.js';
import { gameState } from '../state.js';

export class CharacterCanvasRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        if (!this.canvas) {
            console.error('❌ [CanvasRenderer] Canvas не найден');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        this.pixelSize = 7;
        this.animationFrame = 0;
        this.lastTime = 0;
        this.running = false;

        this.state = {
            housing: 'box',
            gender: 'male',
            health: 100,
            hunger: 100,
            comfort: 100,
            diseases: [],
            isCritical: false
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

        if (delta >= 66) {
            this.animationFrame++;
            this.lastTime = timestamp;
            try { this.render(); } catch (e) { console.error('⚠️ render:', e); }
        }
        requestAnimationFrame(this.animate);
    }

    render() {
        const { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);
        this.drawBackground();
        this.drawHousing();
        this.drawCharacter();
        this.drawLuxuryItems();
    }

    // ================= ФОН =================
    drawBackground() {
        const { width, height } = this.canvas;
        const ctx = this.ctx;
        const p = this.pixelSize;
        const groundY = height * 0.78;

        const grad = ctx.createLinearGradient(0, 0, 0, groundY);
        grad.addColorStop(0, '#6BA3D6');
        grad.addColorStop(0.5, '#87CEEB');
        grad.addColorStop(1, '#C8E8F5');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, groundY);

        this.drawCloud(width * 0.18, height * 0.12, p * 1.4);
        this.drawCloud(width * 0.68, height * 0.18, p * 1.1);

        const groundGrad = ctx.createLinearGradient(0, groundY, 0, height);
        groundGrad.addColorStop(0, '#5a8a4a');
        groundGrad.addColorStop(0.3, '#4a7a3a');
        groundGrad.addColorStop(1, '#3a5a2a');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, groundY, width, height - groundY);

        ctx.fillStyle = '#3d6630';
        for (let i = 0; i < width; i += p) {
            const h = (Math.sin(i * 0.1) + 1) * p * 0.5;
            ctx.fillRect(i, groundY, p * 0.5, p + h);
        }
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(0, groundY, width, p * 0.5);
    }

    drawCloud(x, y, p) {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillRect(x, y, p * 6, p * 2);
        ctx.fillRect(x + p, y - p, p * 4, p);
        ctx.fillRect(x + p * 2, y - p * 2, p * 2, p);
        ctx.fillStyle = 'rgba(200,220,240,0.5)';
        ctx.fillRect(x, y + p * 2, p * 6, p * 0.5);
    }

    // ================= ЖИЛЬЁ =================
    drawHousing() {
        const { width, height } = this.canvas;
        const p = this.pixelSize;
        const groundY = height * 0.78;
        const x = width * 0.10;
        const y = groundY;

        switch (this.state.housing) {
            case 'box': this.drawCardboardBox(x, y, p); break;
            case 'shed': this.drawShed(x, y, p); break;
            case 'dilapidated':
            case 'old': this.drawNormalHouse(x, y, p, this.state.housing === 'old'); break;
            case 'normal': this.drawNormalHouse(x, y, p, false); break;
            case 'good': this.drawMansion(x, y, p, false); break;
            case 'mansion': this.drawMansion(x, y, p, true); break;
            default: this.drawCardboardBox(x, y, p);
        }
    }

    drawCardboardBox(x, y, p) {
        const ctx = this.ctx;
        ctx.fillStyle = '#a67c00';
        ctx.fillRect(x, y - p * 10, p * 14, p * 10);
        ctx.fillStyle = '#c4941a';
        ctx.fillRect(x, y - p * 10, p * 3, p * 10);
        ctx.fillStyle = '#7a5a00';
        ctx.fillRect(x + p * 11, y - p * 10, p * 3, p * 10);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        for (let i = 0; i < 10; i += 2) ctx.fillRect(x, y - p * 10 + p * i, p * 14, p * 0.3);
        ctx.fillStyle = '#c4941a';
        ctx.fillRect(x - p, y - p * 12, p * 5, p * 2);
        ctx.fillRect(x + p * 10, y - p * 12, p * 5, p * 2);
        ctx.fillStyle = '#1a0f05';
        ctx.fillRect(x + p * 4, y - p * 8, p * 6, p * 8);
        ctx.fillStyle = '#0a0502';
        ctx.fillRect(x + p * 5, y - p * 7, p * 4, p * 6);
        ctx.fillStyle = '#d4a843';
        ctx.fillRect(x + p * 5, y - p * 9, p * 4, p * 0.8);
        ctx.fillStyle = '#5c4008';
        ctx.fillRect(x + p * 6, y - p * 7, p * 2, p * 2);
    }

    drawShed(x, y, p) {
        const ctx = this.ctx;
        ctx.fillStyle = '#6b4226';
        ctx.fillRect(x, y - p * 14, p * 16, p * 14);
        ctx.fillStyle = '#5a3520';
        for (let i = 0; i < 14; i += 2) ctx.fillRect(x, y - p * 14 + p * i, p * 16, p * 0.5);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x, y - p * 14, p * 3, p * 14);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x + p * 13, y - p * 14, p * 3, p * 14);
        ctx.fillStyle = '#4a2e18';
        ctx.beginPath();
        ctx.moveTo(x - p * 2, y - p * 14);
        ctx.lineTo(x + p * 8, y - p * 22);
        ctx.lineTo(x + p * 18, y - p * 14);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#3a2515';
        ctx.fillRect(x + p * 6, y - p * 10, p * 4, p * 10);
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(x + p * 8, y - p * 5, p, p);
    }

    drawNormalHouse(x, y, p, ruined = false) {
        const ctx = this.ctx;
        ctx.fillStyle = ruined ? '#a89a82' : '#e8c89a';
        ctx.fillRect(x, y - p * 16, p * 18, p * 16);
        ctx.fillStyle = ruined ? '#8a7d66' : '#d4b078';
        for (let i = 0; i < 16; i += 3)
            for (let j = 0; j < 18; j += 4)
                ctx.fillRect(x + p * j, y - p * 16 + p * i, p * 2, p);
        ctx.fillStyle = ruined ? '#4a4a4a' : '#6b4226';
        ctx.beginPath();
        ctx.moveTo(x - p, y - p * 16);
        ctx.lineTo(x + p * 9, y - p * 24);
        ctx.lineTo(x + p * 19, y - p * 16);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(x + p * 3, y - p * 12, p * 4, p * 4);
        ctx.fillRect(x + p * 11, y - p * 12, p * 4, p * 4);
        ctx.fillStyle = '#4a3728';
        ctx.fillRect(x + p * 5, y - p * 12, p, p * 4);
        ctx.fillRect(x + p * 13, y - p * 12, p, p * 4);
        ctx.fillRect(x + p * 3, y - p * 10, p * 4, p);
        ctx.fillRect(x + p * 11, y - p * 10, p * 4, p);
        ctx.fillStyle = '#5c3a1e';
        ctx.fillRect(x + p * 7, y - p * 10, p * 4, p * 10);
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(x + p * 9, y - p * 5, p, p);
        if (ruined) {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(x + p * 2, y - p * 14, p * 0.6, p * 8);
            ctx.fillRect(x + p * 14, y - p * 11, p * 0.6, p * 6);
        }
    }

    drawMansion(x, y, p, grand = false) {
        const ctx = this.ctx;
        const w = grand ? 26 : 22;
        const h = grand ? 26 : 22;
        ctx.fillStyle = '#f0e6d2';
        ctx.fillRect(x, y - p * h, p * w, p * h);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(x, y - p * h, p * 4, p * h);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x + p * (w - 4), y - p * h, p * 4, p * h);
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(x + p * 4, y - p * (h - 4), p * 5, p * 5);
        ctx.fillRect(x + p * (w - 9), y - p * (h - 4), p * 5, p * 5);
        ctx.fillRect(x + p * 4, y - p * 12, p * 5, p * 5);
        ctx.fillRect(x + p * (w - 9), y - p * 12, p * 5, p * 5);
        ctx.fillStyle = '#4a3728';
        ctx.fillRect(x + p * 6, y - p * (h - 4), p, p * 5);
        ctx.fillRect(x + p * (w - 7), y - p * (h - 4), p, p * 5);
        ctx.fillRect(x + p * 4, y - p * (h - 2), p * 5, p);
        ctx.fillRect(x + p * (w - 9), y - p * (h - 2), p * 5, p);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(x + p * 4.5, y - p * (h - 3.5), p * 1.5, p * 1.5);
        ctx.fillRect(x + p * (w - 8.5), y - p * (h - 3.5), p * 1.5, p * 1.5);
        ctx.fillStyle = '#8b3a3a';
        ctx.beginPath();
        ctx.moveTo(x - p * 2, y - p * h);
        ctx.lineTo(x + p * (w / 2), y - p * (h + 10));
        ctx.lineTo(x + p * (w + 2), y - p * h);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#5c3a1e';
        ctx.fillRect(x + p * 9, y - p * 14, p * 6, p * 14);
        ctx.fillStyle = '#4a2e18';
        ctx.fillRect(x + p * 9, y - p * 14, p, p * 14);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x + p * 13, y - p * 7, p, p);
        ctx.fillStyle = '#e8dcc8';
        ctx.fillRect(x + p * 2, y - p * (h - 4), p * 2, p * (h - 4));
        ctx.fillRect(x + p * (w - 4), y - p * (h - 4), p * 2, p * (h - 4));
        if (grand) {
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(x + p * (w / 2 - 1), y - p * (h + 9), p * 2, p * 2);
        }
    }

    // ================= ОДЕЖДА: ТИР ПО КОМФОРТУ =================
    getOutfitTier() {
        const c = this.state.comfort;
        if (c <= 20) return 'tattered';   // рваная + грязь (критично, как у кнопок)
        if (c <= 50) return 'poor';       // потрёпанная (предупреждение)
        if (c <= 80) return 'normal';     // обычная чистая
        return 'rich';                    // богатая
    }

    // ================= ПЕРСОНАЖ =================
    drawCharacter() {
        const { width, height } = this.canvas;
        const p = this.pixelSize;
        const ctx = this.ctx;
        const isFemale = this.state.gender === 'female';
        const tier = this.getOutfitTier();

        const cx = width * 0.62;
        const groundY = height * 0.78;
        const cy = groundY + p * 0.5;
        const bob = Math.sin(this.animationFrame * 0.3) * (p * 0.15);
        const y = cy + bob;

        // Тень (3 слоя)
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(cx - p * 4, groundY + p * 0.5, p * 8, p * 1.5);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(cx - p * 5, groundY + p * 2, p * 10, p);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(cx - p * 6, groundY + p * 3, p * 12, p * 0.5);

        if (isFemale) this.drawFemaleBody(cx, y, p, tier);
        else this.drawMaleBody(cx, y, p, tier);

        this.drawHead(cx, y, p, isFemale, tier);

        // Состояния (анимации поверх тела)
        this.drawHungerAnim(cx, y, p);
        this.drawSickAnim(cx, y, p);
        this.drawCriticalAura(cx, y, p);
    }

    // --- МУЖСКОЕ ТЕЛО ---
    drawMaleBody(cx, y, p, tier) {
        const ctx = this.ctx;

        // Ноги
        ctx.fillStyle = tier === 'tattered' ? '#3a3a3a' : '#2F3B52';
        ctx.fillRect(cx - p * 3.5, y - p * 10, p * 3, p * 10);
        ctx.fillRect(cx + p * 0.5, y - p * 10, p * 3, p * 10);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(cx - p * 3, y - p * 8, p * 0.4, p * 6);
        ctx.fillRect(cx + p * 1, y - p * 8, p * 0.4, p * 6);
        // Ботинки
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(cx - p * 3.5, y - p * 1.5, p * 3, p * 2);
        ctx.fillRect(cx + p * 0.5, y - p * 1.5, p * 3, p * 2);
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(cx - p * 3.5, y + p * 0.3, p * 3, p * 0.5);
        ctx.fillRect(cx + p * 0.5, y + p * 0.3, p * 3, p * 0.5);

        // Торс — цвет зависит от тира
        const colors = {
            tattered: '#6b6b5a', poor: '#7a8aa0', normal: '#667eea', rich: '#4a5ab8'
        };
        const grad = ctx.createLinearGradient(0, y - p * 20, 0, y - p * 10);
        grad.addColorStop(0, colors[tier]);
        grad.addColorStop(1, this.shade(colors[tier], -0.15));
        ctx.fillStyle = grad;
        ctx.fillRect(cx - p * 4, y - p * 20, p * 8, p * 10);

        // Воротник
        ctx.fillStyle = this.shade(colors[tier], -0.25);
        ctx.fillRect(cx - p * 3, y - p * 20, p * 6, p * 1.5);
        ctx.fillStyle = this.shade(colors[tier], -0.4);
        ctx.beginPath();
        ctx.moveTo(cx - p * 2, y - p * 20);
        ctx.lineTo(cx, y - p * 18);
        ctx.lineTo(cx + p * 2, y - p * 20);
        ctx.closePath();
        ctx.fill();

        // Пуговицы: богатые = золото, бедные = серые/нет
        ctx.fillStyle = tier === 'rich' ? '#ffd700' : tier === 'tattered' ? '#888' : '#fff';
        if (tier !== 'tattered') {
            ctx.fillRect(cx - p * 0.3, y - p * 18, p * 0.6, p * 0.6);
            ctx.fillRect(cx - p * 0.3, y - p * 15, p * 0.6, p * 0.6);
            ctx.fillRect(cx - p * 0.3, y - p * 12, p * 0.6, p * 0.6);
        }

        // Складки
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(cx - p * 3, y - p * 19, p * 0.4, p * 8);
        ctx.fillRect(cx + p * 2.5, y - p * 19, p * 0.4, p * 8);

        // Рваная одежда: дыры + неровный низ + заплатки
        if (tier === 'tattered' || tier === 'poor') {
            ctx.fillStyle = '#F1C27D'; // дыры = кожа
            ctx.fillRect(cx - p * 2, y - p * 13, p * 1.2, p * 1.5);
            ctx.fillRect(cx + p * 1.5, y - p * 17, p, p * 1.2);
            if (tier === 'tattered') {
                ctx.fillRect(cx + p * 2.8, y - p * 12, p * 0.8, p * 1.5);
                ctx.fillStyle = '#8a7a5a'; // заплатка
                ctx.fillRect(cx - p * 3.5, y - p * 16, p * 1.5, p * 1.5);
                // неровный низ рубашки
                ctx.fillStyle = this.shade(colors[tier], -0.3);
                ctx.fillRect(cx - p * 4, y - p * 10.5, p * 1, p * 0.5);
                ctx.fillRect(cx - p * 2, y - p * 10.8, p * 1.2, p * 0.8);
                ctx.fillRect(cx + p * 1, y - p * 10.3, p * 1, p * 0.3);
            }
        }

        // Богатая одежда: жилет + отвороты + блик
        if (tier === 'rich') {
            ctx.fillStyle = '#2c3570';
            ctx.fillRect(cx - p * 4, y - p * 20, p * 1.5, p * 10);
            ctx.fillRect(cx + p * 2.5, y - p * 20, p * 1.5, p * 10);
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fillRect(cx - p * 3.5, y - p * 19, p * 0.5, p * 7);
            ctx.fillRect(cx + p * 3, y - p * 19, p * 0.5, p * 7);
        }

        // Руки (левая — базовая, правая может держаться за живот)
        const holdingStomach = this.state.hunger < 50;
        this.drawArm(cx - p * 5.5, y - p * 19, p, holdingStomach ? false : false);
        this.drawArm(cx + p * 3, y - p * 19, p, holdingStomach, true);

        // Шея
        ctx.fillStyle = '#D9A45F';
        ctx.fillRect(cx - p * 1.2, y - p * 22, p * 2.4, p * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(cx - p * 1.2, y - p * 20.5, p * 2.4, p * 0.5);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(cx - p * 0.3, y - p * 21, p * 0.6, p * 0.5); // адамово яблоко
    }

    drawArm(x, topY, p, bent = false, right = false) {
        const ctx = this.ctx;
        ctx.fillStyle = '#F1C27D';
        if (bent) {
            // рука согнута к животу
            ctx.fillRect(x, topY, p * 2.5, p * 4);
            const innerX = right ? x - p * 2.5 : x + p * 2.5;
            ctx.fillRect(innerX, topY + p * 4, p * 2.5, p * 2);
            ctx.fillStyle = '#E0B06D';
            ctx.fillRect(right ? innerX - p * 0.5 : innerX + p * 2, topY + p * 5, p * 1.5, p * 1.5);
        } else {
            ctx.fillRect(x, topY, p * 2.5, p * 8);
            ctx.fillStyle = 'rgba(0,0,0,0.08)';
            ctx.fillRect(x + p * 0.2, topY + p * 2, p * 2, p * 2); // бицепс
            ctx.fillStyle = '#E0B06D';
            ctx.fillRect(x, topY + p * 8, p * 2.5, p * 3);
            ctx.fillStyle = '#D9A45F';
            for (let i = 0; i < 5; i++)
                ctx.fillRect(x + p * 0.2 + p * i * 0.5, topY + p * 10.5, p * 0.4, p * 0.8);
        }
    }

    // --- ЖЕНСКОЕ ТЕЛО (детализированное) ---
    drawFemaleBody(cx, y, p, tier) {
        const ctx = this.ctx;

        // Ноги в чулках/колготках
        const legGrad = ctx.createLinearGradient(cx - p * 3, 0, cx - p, 0);
        legGrad.addColorStop(0, '#5a6fd4');
        legGrad.addColorStop(1, '#3f51b5');
        ctx.fillStyle = legGrad;
        ctx.fillRect(cx - p * 2.8, y - p * 9, p * 2.2, p * 9);
        ctx.fillRect(cx + p * 0.6, y - p * 9, p * 2.2, p * 9);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(cx - p * 2.6, y - p * 8, p * 0.4, p * 7);
        ctx.fillRect(cx + p * 0.8, y - p * 8, p * 0.4, p * 7);

        // Туфли на каблуке
        ctx.fillStyle = tier === 'rich' ? '#8b1a4a' : '#2c1810';
        ctx.fillRect(cx - p * 2.8, y - p * 1.5, p * 2.2, p * 1.5);
        ctx.fillRect(cx + p * 0.6, y - p * 1.5, p * 2.2, p * 1.5);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(cx - p * 2.4, y - p * 1.2, p * 0.5, p * 0.5);
        ctx.fillRect(cx + p * 1, y - p * 1.2, p * 0.5, p * 0.5);
        ctx.fillStyle = '#1a0f0a';
        ctx.fillRect(cx - p * 2.6, y, p * 0.8, p * 0.6);
        ctx.fillRect(cx + p * 1.4, y, p * 0.8, p * 0.6);

        // Платье/юбка — цвет по тиру
        const colors = {
            tattered: '#7a6a6a', poor: '#b06a8a', normal: '#e91e63', rich: '#d4145a'
        };
        const dressGrad = ctx.createLinearGradient(0, y - p * 22, 0, y - p * 6);
        dressGrad.addColorStop(0, this.shade(colors[tier], 0.15));
        dressGrad.addColorStop(1, colors[tier]);
        ctx.fillStyle = dressGrad;

        // Лиф (узкая талия + грудь)
        ctx.fillRect(cx - p * 2.8, y - p * 20, p * 5.6, p * 6);
        // Талия (заужение)
        ctx.fillRect(cx - p * 2.4, y - p * 14, p * 4.8, p * 2);
        // Юбка (расширение к низу, ступенчатая)
        ctx.fillRect(cx - p * 3.2, y - p * 12, p * 6.4, p * 3);
        ctx.fillRect(cx - p * 3.8, y - p * 9, p * 7.6, p * 3);

        // Намёк на грудь (блики)
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(cx - p * 2, y - p * 19, p * 1.5, p * 1.2);
        ctx.fillRect(cx + p * 0.5, y - p * 19, p * 1.5, p * 1.2);
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(cx - p * 0.4, y - p * 18, p * 0.8, p * 3);

        // Пояс
        ctx.fillStyle = tier === 'rich' ? '#ffd700' : this.shade(colors[tier], -0.3);
        ctx.fillRect(cx - p * 2.5, y - p * 14.5, p * 5, p * 0.8);
        if (tier === 'rich') {
            ctx.fillStyle = '#ffed4e';
            ctx.fillRect(cx - p * 0.4, y - p * 14.4, p * 0.8, p * 0.6);
        }

        // Складки юбки
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(cx - p * 2.5, y - p * 11, p * 0.4, p * 4);
        ctx.fillRect(cx + p * 2, y - p * 11, p * 0.4, p * 4);
        ctx.fillRect(cx - p * 0.2, y - p * 10, p * 0.4, p * 3);

        // Рваный подол для низких тиров
        if (tier === 'tattered' || tier === 'poor') {
            ctx.fillStyle = '#F1C27D';
            ctx.fillRect(cx - p * 3.5, y - p * 7, p * 1, p * 1.2);
            ctx.fillRect(cx + p * 2.2, y - p * 7.5, p * 0.8, p * 1);
            if (tier === 'tattered') {
                ctx.fillStyle = '#9a8a7a'; // заплатка
                ctx.fillRect(cx - p * 1.5, y - p * 10, p * 1.5, p * 1.5);
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.fillRect(cx - p * 2, y - p * 17, p * 0.8, p * 1);
            }
        }

        // Богатое платье: оборка + блёстки
        if (tier === 'rich') {
            ctx.fillStyle = this.shade(colors[tier], 0.2);
            ctx.fillRect(cx - p * 4, y - p * 6.5, p * 8, p * 0.8);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(cx - p * 3, y - p * 16, p * 0.4, p * 0.4);
            ctx.fillRect(cx + p * 2, y - p * 12, p * 0.4, p * 0.4);
            ctx.fillRect(cx - p * 1, y - p * 9, p * 0.4, p * 0.4);
        }

        // Руки (тонкие)
        const holdingStomach = this.state.hunger < 50;
        this.drawFemaleArm(cx - p * 4.8, y - p * 19, p, false);
        this.drawFemaleArm(cx + p * 2.8, y - p * 19, p, holdingStomach);

        // Шея (тонкая)
        ctx.fillStyle = '#F1C27D';
        ctx.fillRect(cx - p * 0.9, y - p * 22, p * 1.8, p * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(cx - p * 0.9, y - p * 20.5, p * 1.8, p * 0.5);

        // Ожерелье для богатого тира
        if (tier === 'rich') {
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(cx - p * 1.2, y - p * 20.8, p * 2.4, p * 0.4);
            ctx.fillRect(cx - p * 0.3, y - p * 20.4, p * 0.6, p * 0.6);
        }
    }

    drawFemaleArm(x, topY, p, bent = false) {
        const ctx = this.ctx;
        ctx.fillStyle = '#F1C27D';
        if (bent) {
            ctx.fillRect(x, topY, p * 1.8, p * 4);
            ctx.fillRect(x - p * 2, topY + p * 4, p * 2, p * 1.8);
            ctx.fillStyle = '#E0B06D';
            ctx.fillRect(x - p * 2.5, topY + p * 4.5, p * 1.3, p * 1.3);
        } else {
            ctx.fillRect(x, topY, p * 1.8, p * 8);
            ctx.fillStyle = '#E0B06D';
            ctx.fillRect(x, topY + p * 8, p * 1.8, p * 2.5);
            ctx.fillStyle = '#D9A45F';
            for (let i = 0; i < 4; i++)
                ctx.fillRect(x + p * 0.1 + p * i * 0.4, topY + p * 10, p * 0.3, p * 0.7);
        }
    }

    // --- ГОЛОВА (общая, с полом и тиrom) ---
    drawHead(cx, y, p, isFemale, tier) {
        const ctx = this.ctx;
        ctx.fillStyle = '#F1C27D';
        ctx.fillRect(cx - p * 3, y - p * 28, p * 6, p * 6);
        ctx.fillRect(cx - p * 2, y - p * 29, p * 4, p); // макушка
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(cx - p * 2, y - p * 27, p * 4, p * 0.5);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(cx - p * 3, y - p * 24, p * 6, p * 2);
        // Скулы (у женщин ярче)
        ctx.fillStyle = isFemale ? 'rgba(255,150,150,0.35)' : 'rgba(255,200,150,0.3)';
        ctx.fillRect(cx - p * 2.5, y - p * 25, p * 1.5, p * 1);
        ctx.fillRect(cx + p * 1, y - p * 25, p * 1.5, p * 1);

        // Волосы
        if (isFemale) {
            // Чёлка + объём + длинные пряди + хвост
            const hg = ctx.createLinearGradient(0, y - p * 31, 0, y - p * 27);
            hg.addColorStop(0, '#7a4a2e');
            hg.addColorStop(1, '#5c3a1e');
            ctx.fillStyle = hg;
            ctx.fillRect(cx - p * 4, y - p * 30, p * 8, p * 3);
            ctx.fillRect(cx - p * 3.5, y - p * 31, p * 7, p);
            // Чёлка (косая)
            ctx.fillRect(cx - p * 3, y - p * 27, p * 4, p * 1.5);
            ctx.fillRect(cx + p * 1, y - p * 27, p * 2, p * 1);
            // Длинные боковые пряди
            ctx.fillRect(cx - p * 4, y - p * 27, p * 1.5, p * 12);
            ctx.fillRect(cx + p * 2.5, y - p * 27, p * 1.5, p * 12);
            // Затылок
            ctx.fillRect(cx - p * 3, y - p * 26, p * 6, p * 2);
            // Блики
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(cx - p * 3, y - p * 30, p * 2, p * 0.5);
            ctx.fillRect(cx - p * 3.5, y - p * 25, p * 0.5, p * 4);
            ctx.fillRect(cx + p * 2.5, y - p * 24, p * 0.3, p * 3);
            // Резинка/украшение для rich
            if (tier === 'rich') {
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(cx + p * 2.5, y - p * 26, p * 1.5, p * 0.8);
            }
            // Текстура
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(cx - p * 2, y - p * 28, p * 0.2, p * 9);
            ctx.fillRect(cx + p * 1, y - p * 28, p * 0.2, p * 9);
        } else {
            const hg = ctx.createLinearGradient(0, y - p * 30, 0, y - p * 28);
            hg.addColorStop(0, '#4a3524');
            hg.addColorStop(1, '#3B2A1A');
            ctx.fillStyle = hg;
            ctx.fillRect(cx - p * 3, y - p * 29, p * 6, p * 2);
            ctx.fillRect(cx - p * 2.5, y - p * 30, p * 5, p);
            ctx.fillRect(cx - p * 3, y - p * 28, p * 0.8, p * 3);
            ctx.fillRect(cx + p * 2.2, y - p * 28, p * 0.8, p * 3);
            ctx.fillStyle = '#2a1f14';
            ctx.fillRect(cx - p * 2, y - p * 29, p * 0.5, p);
            ctx.fillRect(cx + p * 1, y - p * 29, p * 0.5, p);
            ctx.fillRect(cx, y - p * 30, p * 0.5, p * 0.8);
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fillRect(cx - p * 2, y - p * 29.5, p * 1, p * 0.3);
            ctx.fillRect(cx + p * 0.5, y - p * 29.5, p * 1, p * 0.3);
        }

        // Брови
        ctx.fillStyle = isFemale ? '#5c3a1e' : '#3B2A1A';
        ctx.fillRect(cx - p * 2.2, y - p * 26, p * 1.8, p * 0.4);
        ctx.fillRect(cx + p * 0.4, y - p * 26, p * 1.8, p * 0.4);

        // Глаза
        ctx.fillStyle = '#fff';
        ctx.fillRect(cx - p * 2.2, y - p * 25, p * 1.8, p * 1.2);
        ctx.fillRect(cx + p * 0.4, y - p * 25, p * 1.8, p * 1.2);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(cx - p * 2.2, y - p * 25, p * 1.8, p * 0.2);
        ctx.fillRect(cx + p * 0.4, y - p * 25, p * 1.8, p * 0.2);
        // Радужка
        ctx.fillStyle = '#4a3728';
        ctx.fillRect(cx - p * 1.8, y - p * 24.8, p * 1, p * 1);
        ctx.fillRect(cx + p * 0.8, y - p * 24.8, p * 1, p * 1);
        ctx.fillStyle = '#000';
        ctx.fillRect(cx - p * 1.5, y - p * 24.6, p * 0.5, p * 0.6);
        ctx.fillRect(cx + p * 1.1, y - p * 24.6, p * 0.5, p * 0.6);
        ctx.fillStyle = '#fff';
        ctx.fillRect(cx - p * 1.6, y - p * 24.7, p * 0.3, p * 0.3);
        ctx.fillRect(cx + p * 1, y - p * 24.7, p * 0.3, p * 0.3);
        // Ресницы (только у женщин)
        if (isFemale) {
            ctx.fillStyle = '#2a1a0a';
            ctx.fillRect(cx - p * 2.4, y - p * 25.2, p * 2.2, p * 0.3);
            ctx.fillRect(cx + p * 0.2, y - p * 25.2, p * 2.2, p * 0.3);
            ctx.fillRect(cx - p * 2.4, y - p * 25.5, p * 0.3, p * 0.3);
            ctx.fillRect(cx + p * 2.2, y - p * 25.5, p * 0.3, p * 0.3);
        }

        // Нос
        ctx.fillStyle = '#D9A45F';
        ctx.fillRect(cx - p * 0.5, y - p * 23, p, p * 1.2);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(cx - p * 0.3, y - p * 22, p * 0.6, p * 0.3);

        // Рот: у женщин яркая помада
        ctx.fillStyle = isFemale ? (tier === 'rich' ? '#c2185b' : '#e05a7a') : '#c0392b';
        ctx.fillRect(cx - p * 1, y - p * 21, p * 2, p * 0.6);
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(cx - p * 0.8, y - p * 20.5, p * 1.6, p * 0.3);
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fillRect(cx - p * 0.5, y - p * 21, p * 0.5, p * 0.2);

        // Уши
        ctx.fillStyle = '#E0B06D';
        ctx.fillRect(cx - p * 3.5, y - p * 26, p * 0.8, p * 1.8);
        ctx.fillRect(cx + p * 2.7, y - p * 26, p * 0.8, p * 1.8);
        ctx.fillStyle = '#D9A45F';
        ctx.fillRect(cx - p * 3.3, y - p * 25.5, p * 0.4, p * 1);
        ctx.fillRect(cx + p * 2.9, y - p * 25.5, p * 0.4, p * 1);
        // Серьги у женщин
        if (isFemale && tier === 'rich') {
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(cx - p * 3.4, y - p * 24, p * 0.6, p * 0.8);
            ctx.fillRect(cx + p * 2.8, y - p * 24, p * 0.6, p * 0.8);
        }
    }

    // ================= АНИМАЦИИ СОСТОЯНИЙ =================

    // Голод < 50: рука на животе (уже в теле) + волны урчания; < 20: волны чаще + зелёный оттенок лица
    drawHungerAnim(cx, y, p) {
        const ctx = this.ctx;
        const hunger = this.state.hunger;
        if (hunger >= 50) return;

        const critical = hunger < 20;
        const speed = critical ? 12 : 24; // при критичном урчит быстрее

        // Волны урчания (дуги) справа от живота
        for (let i = 0; i < 3; i++) {
            const phase = ((this.animationFrame + i * speed / 3) % speed) / speed;
            const radius = p * (1 + phase * 3);
            const alpha = (1 - phase) * (critical ? 0.8 : 0.5);
            ctx.strokeStyle = `rgba(120, 200, 120, ${alpha})`;
            ctx.lineWidth = p * 0.4;
            ctx.beginPath();
            ctx.arc(cx + p * 4.5, y - p * 11, radius, -Math.PI / 3, Math.PI / 3);
            ctx.stroke();
        }

        // Зелёный оттенок лица при критичном голоде
        if (critical) {
            ctx.fillStyle = 'rgba(140, 180, 120, 0.25)';
            ctx.fillRect(cx - p * 3, y - p * 28, p * 6, p * 6);
        }
    }

    // Болезнь: мерцающая сыпь на коже + иконки
    drawSickAnim(cx, y, p) {
        const ctx = this.ctx;
        const diseases = this.state.diseases;
        if (!diseases.length) return;

        // Пятна сыпи (позиции фиксированные, видимость мерцает по кадру)
        const spots = [
            [cx - p * 2, y - p * 26], [cx + p * 1.5, y - p * 25],
            [cx - p * 1, y - p * 17], [cx + p * 2, y - p * 14],
            [cx - p * 3, y - p * 12], [cx, y - p * 22]
        ];
        spots.forEach((s, i) => {
            const visible = ((this.animationFrame + i * 7) % 20) < 12;
            if (visible) {
                ctx.fillStyle = 'rgba(200, 60, 60, 0.55)';
                ctx.fillRect(s[0], s[1], p * 0.7, p * 0.7);
            }
        });

        // Специфичные эффекты
        diseases.forEach((d, i) => {
            const ox = (i - diseases.length / 2) * p * 4;
            if (d === 'trauma') {
                ctx.fillStyle = '#FFB6C1';
                ctx.fillRect(cx + p * 2 + ox, y - p * 28, p * 2, p * 1.2);
                ctx.fillStyle = '#fff';
                ctx.fillRect(cx + p * 2 + ox, y - p * 28, p * 2, p * 0.3);
                ctx.fillStyle = '#888';
                ctx.fillRect(cx + p * 2.5 + ox, y - p * 27.7, p, p * 0.2);
            } else if (d === 'flu') {
                // испарения над головой
                for (let w = 0; w < 2; w++) {
                    const ph = ((this.animationFrame + w * 10) % 20) / 20;
                    ctx.fillStyle = `rgba(144, 238, 144, ${(1 - ph) * 0.6})`;
                    ctx.fillRect(cx - p * 2 + ox + w * p * 3, y - p * 31 - ph * p * 2, p * 1.2, p * 1.2);
                }
            }
        });
    }

    // Критичное здоровье: пульсирующая красная аура
    drawCriticalAura(cx, y, p) {
        const ctx = this.ctx;
        if (!(this.state.isCritical || this.state.health < 20)) return;
        const pulse = (Math.sin(this.animationFrame * 0.5) + 1) / 2;
        ctx.fillStyle = `rgba(255, 0, 0, ${0.08 + pulse * 0.1})`;
        ctx.fillRect(cx - p * 6, y - p * 32, p * 12, p * 34);
    }

    // Утилита: затемнить/осветлить hex-цвет
    shade(hex, amt) {
        const n = parseInt(hex.slice(1), 16);
        let r = (n >> 16) + Math.round(255 * amt);
        let g = ((n >> 8) & 0xff) + Math.round(255 * amt);
        let b = (n & 0xff) + Math.round(255 * amt);
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
        return `rgb(${r},${g},${b})`;
    }

    // 🔑 НОВОЕ: Отрисовка предметов роскоши на персонаже
    drawLuxuryItems(ctx, x, y, scale) {
        if (!gameState.luxuryItems || gameState.luxuryItems.length === 0) return;

        const itemSize = 20 * scale;

        gameState.luxuryItems.forEach((itemId, index) => {
            const config = ITEMS_CONFIG[itemId];
            if (!config.visual) return;

            ctx.save();

            switch (config.visual) {
                case 'watch':
                    // Часы на запястье
                    ctx.translate(x + 30 * scale, y + 60 * scale);
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(0, 0, itemSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#333';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    // Циферблат
                    ctx.fillStyle = '#FFF';
                    ctx.beginPath();
                    ctx.arc(0, 0, itemSize / 3, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case 'ring':
                    // Кольцо на пальце
                    ctx.translate(x + 25 * scale, y + 70 * scale);
                    ctx.strokeStyle = '#FFD700';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(0, 0, itemSize / 3, 0, Math.PI * 2);
                    ctx.stroke();
                    // Бриллиант
                    ctx.fillStyle = '#E0F7FF';
                    ctx.beginPath();
                    ctx.moveTo(0, -itemSize / 3);
                    ctx.lineTo(itemSize / 4, 0);
                    ctx.lineTo(0, itemSize / 4);
                    ctx.lineTo(-itemSize / 4, 0);
                    ctx.closePath();
                    ctx.fill();
                    break;

                case 'car':
                    // Машина рядом с персонажем
                    ctx.translate(x + 80 * scale, y + 80 * scale);
                    ctx.fillStyle = '#FF4444';
                    ctx.fillRect(0, 0, itemSize * 2, itemSize);
                    // Окна
                    ctx.fillStyle = '#87CEEB';
                    ctx.fillRect(itemSize * 0.3, 0, itemSize * 0.6, itemSize * 0.5);
                    // Колёса
                    ctx.fillStyle = '#333';
                    ctx.beginPath();
                    ctx.arc(itemSize * 0.4, itemSize, itemSize / 4, 0, Math.PI * 2);
                    ctx.arc(itemSize * 1.6, itemSize, itemSize / 4, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case 'yacht':
                    // Яхта рядом с персонажем
                    ctx.translate(x + 80 * scale, y + 70 * scale);
                    ctx.fillStyle = '#FFF';
                    ctx.beginPath();
                    ctx.moveTo(0, itemSize);
                    ctx.lineTo(itemSize * 2, itemSize);
                    ctx.lineTo(itemSize * 1.8, 0);
                    ctx.lineTo(itemSize * 0.2, 0);
                    ctx.closePath();
                    ctx.fill();
                    // Парус
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.moveTo(itemSize, 0);
                    ctx.lineTo(itemSize * 1.5, itemSize * 0.8);
                    ctx.lineTo(itemSize, itemSize);
                    ctx.closePath();
                    ctx.fill();
                    break;

                case 'gym':
                    // Гантели рядом (абонемент в спортзал)
                    ctx.translate(x + 70 * scale, y + 90 * scale);
                    ctx.fillStyle = '#666';
                    ctx.fillRect(0, 0, itemSize * 1.5, itemSize / 4);
                    ctx.fillStyle = '#333';
                    ctx.fillRect(0, -itemSize / 4, itemSize / 3, itemSize / 2);
                    ctx.fillRect(itemSize * 1.2, -itemSize / 4, itemSize / 3, itemSize / 2);
                    break;
            }

            ctx.restore();
        });
    }
}