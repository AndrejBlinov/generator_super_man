// Рендеринг интерфейса

import { gameState } from './state.js';
import { UPGRADES_CONFIG } from './config.js';
import { calculatePassiveIncome, getSelectedCrystalIndex } from './crystals.js';
import { calculateUpgradeCost } from './upgrades.js';

export function renderUI() {
    renderCrystals();
    renderUpgrades();
    updateUI();
}

export function updateUI() {
    document.getElementById('age').textContent = 
        `${gameState.ageInYears} / ${gameState.maxAgeInYears} лет`;
    document.getElementById('points').textContent = 
        Math.round(gameState.evolutionPoints);
    document.getElementById('passive').textContent = 
        `${calculatePassiveIncome()} ОЭ/день`;
    document.getElementById('clickPower').textContent = 
        `${Math.round(gameState.clickPower)} ОЭ`;

    const createBtn = document.getElementById('createCrystalBtn');
    const hasEmptySlot = gameState.crystals.some(c => c === null);
    createBtn.disabled = gameState.evolutionPoints < 100 || !hasEmptySlot;
}

export function renderCrystals() {
    const grid = document.getElementById('crystalsGrid');
    grid.innerHTML = '';

    const selectedIndex = getSelectedCrystalIndex();

    gameState.crystals.forEach((crystal, index) => {
        const slot = document.createElement('div');
        slot.className = 'crystal-slot';
        if (index === selectedIndex) {
            slot.classList.add('selected');
        }

        if (crystal) {
            slot.innerHTML = `
                <div class="crystal-level">Lvl ${crystal.level}</div>
                <div class="crystal-income">+${crystal.income}/день</div>
            `;
        }

        slot.onclick = () => {
            import('./crystals.js').then(module => {
                module.selectCrystal(index);
            });
        };
        grid.appendChild(slot);
    });
}

export function renderUpgrades() {
    const container = document.getElementById('upgradesContainer');
    container.innerHTML = '';

    Object.keys(UPGRADES_CONFIG).forEach(upgradeId => {
        const config = UPGRADES_CONFIG[upgradeId];
        const currentLevel = gameState.upgrades[upgradeId];
        const cost = currentLevel < config.maxLevel 
            ? calculateUpgradeCost(upgradeId)
            : 0;

        const item = document.createElement('div');
        item.className = 'upgrade-item';
        item.innerHTML = `
            <div class="upgrade-info">
                <div class="upgrade-name">${config.name} [Ур. ${currentLevel}/${config.maxLevel}]</div>
                <div class="upgrade-desc">${currentLevel > 0 ? config.effect(currentLevel) : config.desc}</div>
            </div>
            <button class="upgrade-btn" ${currentLevel >= config.maxLevel || gameState.evolutionPoints < cost ? 'disabled' : ''}>
                ${currentLevel >= config.maxLevel ? 'МАКС' : `${cost} ОЭ`}
            </button>
        `;

        const btn = item.querySelector('.upgrade-btn');
        btn.onclick = () => {
            import('./upgrades.js').then(module => {
                module.buyUpgrade(upgradeId);
            });
        };
        container.appendChild(item);
    });
}

export function showMessage(text) {
    const msg = document.getElementById('message');
    msg.textContent = text;
    msg.classList.add('show');
    setTimeout(() => msg.classList.remove('show'), 2000);
}

export function showCritPopup(event, amount) {
    const popup = document.createElement('div');
    popup.className = 'crit-popup';
    popup.textContent = `КРИТ! +${Math.round(amount)}`;
    popup.style.left = event.clientX + 'px';
    popup.style.top = event.clientY + 'px';
    document.body.appendChild(popup);

    setTimeout(() => popup.remove(), 1000);
}

export function showGameOver() {
    const overlay = document.createElement('div');
    overlay.className = 'game-over';
    overlay.innerHTML = `
        <div class="game-over-content">
            <h2>💀 Игра окончена</h2>
            <p>Ваш персонаж прожил ${gameState.ageInYears} лет</p>
            <p>Всего заработано: ${Math.round(gameState.totalPointsEarned)} ОЭ</p>
            <button onclick="location.reload()" style="margin-top: 20px; padding: 15px 30px; font-size: 18px; background: #667eea; color: white; border: none; border-radius: 10px; cursor: pointer;">
                Начать заново
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
}