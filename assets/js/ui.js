import { gameState } from './state.js';
import { UPGRADES_CONFIG, ITEMS_CONFIG, GAME_START_DATE } from './config.js';
import { calculatePassiveIncome, getSelection, getMaxAffordableCrystals } from './crystals.js';
import { calculateBulkCost, getMaxAffordableCount, getMaxAffordableItemCount } from './upgrades.js';

// 🔑 Импортируем из needs-модуля
import { 
    renderNeeds, 
    updateNeedsBars, 
    updateNeedRestoreButtons,
    applyCharacterStates,
    renderDiseaseBlock,
    updateDiseaseUI
} from './needs/index.js';

function formatCalendarDate(years, days) {
    const startDate = new Date(
        GAME_START_DATE.year,
        GAME_START_DATE.month - 1,
        GAME_START_DATE.day
    );
    
    startDate.setFullYear(startDate.getFullYear() + (years - 30));
    startDate.setDate(startDate.getDate() + days);
    
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

function getActualCount(baseCount, maxAffordable) {
    if (baseCount === 'max') return maxAffordable;
    return Math.min(parseInt(baseCount), maxAffordable);
}

export function renderUI() {
    renderNeeds();
    renderDiseaseBlock();
    renderCrystals();
    renderUpgrades();
    updateUI();
}

export function updateUI() {
    const bioDays = Math.floor(gameState.currentDayInYear);

    document.getElementById('bioAge').textContent = 
        `${gameState.ageInYears} лет ${bioDays} дн. / ${gameState.maxAgeInYears} лет`;
    
    document.getElementById('calendarAge').textContent = 
        formatCalendarDate(gameState.absoluteAgeInYears, gameState.absoluteCurrentDayInYear);
        
    document.getElementById('points').textContent = 
        Math.round(gameState.evolutionPoints);
    
    document.getElementById('money').textContent = 
        `${gameState.money} 💰`;
        
    document.getElementById('passive').textContent = 
        `${calculatePassiveIncome()} ОЭ/день`;
    document.getElementById('clickPower').textContent = 
        `${Math.round(gameState.clickPower)} ОЭ`;

    // 🔑 Вызываем функции из needs-модуля
    updateNeedsBars();
    updateNeedRestoreButtons();
    updateDiseaseUI();
    
    updateShopButtons();
    updateCrystalCreateButton();
    updateItemButtons();
    updateAutoExchangeButtons();
    
    applyCharacterStates();
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

    const multiplierSwitcher = document.createElement('div');
    multiplierSwitcher.className = 'multiplier-switcher';
    multiplierSwitcher.innerHTML = `
        <span class="multiplier-label">Количество:</span>
        <button class="multiplier-btn ${gameState.purchaseMultiplier === 1 ? 'active' : ''}" data-multiplier="1">x1</button>
        <button class="multiplier-btn ${gameState.purchaseMultiplier === 10 ? 'active' : ''}" data-multiplier="10">x10</button>
        <button class="multiplier-btn ${gameState.purchaseMultiplier === 100 ? 'active' : ''}" data-multiplier="100">x100</button>
        <button class="multiplier-btn ${gameState.purchaseMultiplier === 'max' ? 'active' : ''}" data-multiplier="max">MAX</button>
    `;
    container.appendChild(multiplierSwitcher);

    const abilitiesHeader = document.createElement('div');
    abilitiesHeader.className = 'shop-section-header';
    abilitiesHeader.innerHTML = `<h3>🧬 Способности</h3><p>Постоянные улучшения с уровнями</p>`;
    container.appendChild(abilitiesHeader);

    Object.keys(UPGRADES_CONFIG).forEach(upgradeId => {
        const config = UPGRADES_CONFIG[upgradeId];
        const currentLevel = gameState.upgrades[upgradeId];
        const remainingToMax = config.maxLevel - currentLevel;
        
        const maxAffordable = getMaxAffordableCount(upgradeId);
        const actualCount = getActualCount(gameState.purchaseMultiplier, Math.min(remainingToMax, maxAffordable > 0 ? maxAffordable : 0));
        const cost = actualCount > 0 ? calculateBulkCost(upgradeId, actualCount) : calculateBulkCost(upgradeId, 1);
        
        const isMaxed = currentLevel >= config.maxLevel;
        const canAfford = gameState.evolutionPoints >= cost && actualCount > 0;

        const item = document.createElement('div');
        item.className = 'upgrade-item';
        
        let effectText = config.desc;
        if (currentLevel > 0) {
            effectText = config.effect(currentLevel);
        }
        
        const finalBuffText = config.finalBuff ? config.finalBuff(config.maxLevel) : '';

        let btnText = 'МАКС';
        if (!isMaxed) {
            if (gameState.purchaseMultiplier === 'max') {
                btnText = maxAffordable > 0 ? `${maxAffordable} ур. за ${cost} ОЭ` : 'Недоступно';
            } else {
                const displayCount = Math.min(parseInt(gameState.purchaseMultiplier), remainingToMax);
                btnText = displayCount > 1 ? `${displayCount} ур. за ${cost} ОЭ` : `${cost} ОЭ`;
            }
        }

        item.innerHTML = `
            <div class="upgrade-info">
                <div class="upgrade-name">${config.name} [Ур. ${currentLevel}/${config.maxLevel}]</div>
                <div class="upgrade-desc">${effectText}</div>
                ${finalBuffText ? `<div class="upgrade-final-buff">${finalBuffText}</div>` : ''}
            </div>
            <button class="upgrade-btn" data-upgrade="${upgradeId}" data-count="${actualCount || 1}" ${isMaxed || !canAfford ? 'disabled' : ''}>
                ${btnText}
            </button>
        `;
        container.appendChild(item);
    });

    const itemsHeader = document.createElement('div');
    itemsHeader.className = 'shop-section-header';
    itemsHeader.innerHTML = `<h3>🛍️ Вещи</h3><p>Одноразовые покупки и ресурсы</p>`;
    container.appendChild(itemsHeader);

    Object.keys(ITEMS_CONFIG).forEach(itemId => {
        const config = ITEMS_CONFIG[itemId];
        const maxAffordable = getMaxAffordableItemCount(itemId);
        const actualCount = getActualCount(gameState.purchaseMultiplier, maxAffordable);
        const totalCost = config.cost * (actualCount > 0 ? actualCount : 1);
        const totalReward = config.reward * (actualCount > 0 ? actualCount : 1);
        
        const canAfford = gameState.evolutionPoints >= totalCost && actualCount > 0;

        const item = document.createElement('div');
        item.className = 'upgrade-item item-item';
        
        let btnText = `Купить за ${config.cost} ОЭ`;
        if (gameState.purchaseMultiplier === 'max') {
            btnText = maxAffordable > 0 
                ? `+${totalReward} 💰 за ${totalCost} ОЭ` 
                : 'Недоступно';
        } else if (parseInt(gameState.purchaseMultiplier) > 1) {
            btnText = `+${totalReward} 💰 за ${totalCost} ОЭ`;
        }
        
        item.innerHTML = `
            <div class="upgrade-info">
                <div class="upgrade-name">${config.icon} ${config.name}</div>
                <div class="upgrade-desc">${config.desc}</div>
            </div>
            <button class="upgrade-btn item-btn" data-item="${itemId}" data-count="${actualCount || 1}" ${!canAfford ? 'disabled' : ''}>
                ${btnText}
            </button>
        `;
        container.appendChild(item);
    });
}

export function updateShopButtons() {
    renderUpgrades();
}

export function updateCrystalCreateButton() {
    const createBtn = document.getElementById('createCrystalBtn');
    if (!createBtn) return;

    const maxAffordable = getMaxAffordableCrystals();
    const actualCount = getActualCount(gameState.purchaseMultiplier, maxAffordable);
    const totalCost = 100 * (actualCount > 0 ? actualCount : 1);
    
    createBtn.disabled = actualCount <= 0 || gameState.evolutionPoints < totalCost;
    
    if (gameState.purchaseMultiplier === 'max') {
        createBtn.textContent = maxAffordable > 0 
            ? `Создать ${maxAffordable} кристалл(ов) за ${totalCost} ОЭ`
            : 'Нет свободных слотов';
    } else if (parseInt(gameState.purchaseMultiplier) > 1) {
        createBtn.textContent = `Создать ${parseInt(gameState.purchaseMultiplier)} кристалл(ов) за ${totalCost} ОЭ`;
    } else {
        createBtn.textContent = 'Создать кристалл (100 ОЭ)';
    }
}

export function updateItemButtons() {
    document.querySelectorAll('.item-btn').forEach((btn) => {
        const itemId = btn.dataset.item;
        if (!itemId) return;

        const config = ITEMS_CONFIG[itemId];
        const maxAffordable = getMaxAffordableItemCount(itemId);
        const actualCount = getActualCount(gameState.purchaseMultiplier, maxAffordable);
        const totalCost = config.cost * (actualCount > 0 ? actualCount : 1);
        
        btn.disabled = gameState.evolutionPoints < totalCost || actualCount <= 0;
    });
}

export function updateAutoExchangeButtons() {
    document.querySelectorAll('.exchange-btn').forEach((btn) => {
        const amount = parseInt(btn.dataset.amount);
        btn.classList.toggle('active', amount === gameState.autoExchangeAmount);
    });
    
    const valueDisplay = document.getElementById('autoExchangeValue');
    if (valueDisplay) {
        valueDisplay.textContent = gameState.autoExchangeAmount === 0 
            ? 'Выкл' 
            : `${gameState.autoExchangeAmount} ОЭ`;
    }
    
    const autoSpendBtn = document.getElementById('autoSpendToggle');
    const autoSpendStatus = document.getElementById('autoSpendStatus');
    
    if (autoSpendBtn && autoSpendStatus) {
        autoSpendStatus.textContent = gameState.autoSpendEnabled ? 'ВКЛ' : 'ВЫКЛ';
        autoSpendBtn.classList.toggle('active', gameState.autoSpendEnabled);
    }
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

export function showGameOver(reason = "Ваш персонаж умер!") {
    const overlay = document.createElement('div');
    overlay.className = 'game-over';
    overlay.innerHTML = `
        <div class="game-over-content">
            <h2>💀 Игра окончена</h2>
            <p>${reason}</p>
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