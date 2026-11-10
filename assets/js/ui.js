import { gameState } from './state.js';
import { UPGRADES_CONFIG, GAME_START_DATE } from './config.js';
import { calculatePassiveIncome, getSelection } from './crystals.js';
import { calculateUpgradeCost } from './upgrades.js';

// Функция для преобразования дней в дату YYYY-MM-DD
function formatCalendarDate(years, days) {
    const startDate = new Date(
        GAME_START_DATE.year,
        GAME_START_DATE.month - 1,
        GAME_START_DATE.day
    );
    
    startDate.setFullYear(startDate.getFullYear());
    startDate.setDate(startDate.getDate() + days);
    
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

export function renderUI() {
    renderCrystals();
    renderUpgrades();
    updateUI();
}

export function updateUI() {
    const bioDays = Math.floor(gameState.currentDayInYear);
    const calDays = Math.floor(gameState.absoluteCurrentDayInYear);

    document.getElementById('bioAge').textContent = 
        `${gameState.ageInYears} лет ${bioDays} дн. / ${gameState.maxAgeInYears} лет`;
    
    document.getElementById('calendarAge').textContent = 
        formatCalendarDate(gameState.absoluteAgeInYears, calDays);
        
    document.getElementById('points').textContent = 
        Math.round(gameState.evolutionPoints);
    document.getElementById('passive').textContent = 
        `${calculatePassiveIncome()} ОЭ/день`;
    document.getElementById('clickPower').textContent = 
        `${Math.round(gameState.clickPower)} ОЭ`;

    const createBtn = document.getElementById('createCrystalBtn');
    const hasActiveSlot = gameState.crystals.some(c => c === null);
    const hasInventorySlot = gameState.crystalsInventory.some(c => c === null);
    createBtn.disabled = gameState.evolutionPoints < 100 || (!hasActiveSlot && !hasInventorySlot);
}

export function renderCrystals() {
    const { index: selectedIndex, zone: selectedZone } = getSelection();

    const activeGrid = document.getElementById('activeCrystalsGrid');
    activeGrid.innerHTML = '';
    
    gameState.crystals.forEach((crystal, index) => {
        const slot = createCrystalSlot(crystal, 'active', index, selectedIndex === index && selectedZone === 'active');
        activeGrid.appendChild(slot);
    });

    const inventoryGrid = document.getElementById('inventoryCrystalsGrid');
    inventoryGrid.innerHTML = '';
    
    gameState.crystalsInventory.forEach((crystal, index) => {
        const slot = createCrystalSlot(crystal, 'inventory', index, selectedIndex === index && selectedZone === 'inventory');
        inventoryGrid.appendChild(slot);
    });
}

function createCrystalSlot(crystal, zone, index, isSelected) {
    const slot = document.createElement('div');
    slot.className = 'crystal-slot';
    slot.dataset.zone = zone;
    slot.dataset.index = index;
    
    if (isSelected) {
        slot.classList.add('selected');
    }

    if (crystal) {
        slot.innerHTML = `
            <div class="crystal-level">Lvl ${crystal.level}</div>
            <div class="crystal-income">+${crystal.income}/день</div>
        `;
    }
    
    return slot;
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
        
        // Формируем описание с текущим эффектом и финальным баффом
        let effectText = config.desc;
        if (currentLevel > 0) {
            effectText = config.effect(currentLevel);
        }
        
        const finalBuffText = config.finalBuff ? config.finalBuff(config.maxLevel) : '';

        item.innerHTML = `
            <div class="upgrade-info">
                <div class="upgrade-name">${config.name} [Ур. ${currentLevel}/${config.maxLevel}]</div>
                <div class="upgrade-desc">${effectText}</div>
                ${finalBuffText ? `<div class="upgrade-final-buff">${finalBuffText}</div>` : ''}
            </div>
            <button class="upgrade-btn" data-upgrade="${upgradeId}" ${currentLevel >= config.maxLevel || gameState.evolutionPoints < cost ? 'disabled' : ''}>
                ${currentLevel >= config.maxLevel ? 'МАКС' : `${cost} ОЭ`}
            </button>
        `;
        container.appendChild(item);
    });
}

export function showMessage(text) {
    const msg = document.getElementById('message');
    msg.textContent = text;
    msg.classList.add('show');
    setTimeout(() => msg.classList.remove('show'), 2000);
}

export function showCritPopup(event, amount, customText = null) {
    const popup = document.createElement('div');
    popup.className = 'crit-popup';
    popup.textContent = customText || `КРИТ! +${Math.round(amount)}`;
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
            <button id="restartBtn" style="margin-top: 20px; padding: 15px 30px; font-size: 18px; background: #667eea; color: white; border: none; border-radius: 10px; cursor: pointer;">
                Начать заново
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
    
    document.getElementById('restartBtn').addEventListener('click', () => {
        import('./storage.js').then(storage => {
            storage.clearSave();
            location.reload();
        });
    });
}