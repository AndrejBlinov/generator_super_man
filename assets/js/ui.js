import { gameState } from './state.js';
import { UPGRADES_CONFIG, ITEMS_CONFIG, NEEDS_CONFIG, GAME_START_DATE } from './config.js';
import { calculatePassiveIncome, getSelection, getMaxAffordableCrystals } from './crystals.js';
import { calculateBulkCost, getMaxAffordableCount, getMaxAffordableItemCount } from './upgrades.js';

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

// 🔑 Получает реальное количество покупки с учётом множителя
function getActualCount(baseCount, maxAffordable) {
    if (baseCount === 'max') return maxAffordable;
    return Math.min(parseInt(baseCount), maxAffordable);
}

export function renderUI() {
    renderNeeds();
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

    updateNeedsBars();
    updateShopButtons();
    updateCrystalCreateButton();
    updateItemButtons();
    updateNeedRestoreButtons();
    updateAutoExchangeButtons();
    applyCharacterStates();
}

export function renderNeeds() {
    const container = document.getElementById('needsContainer');
    if (!container) return;

    container.innerHTML = '';

    Object.keys(NEEDS_CONFIG).forEach(needId => {
        const config = NEEDS_CONFIG[needId];
        const currentValue = Math.round(gameState.needs[needId]);
        const percentage = (currentValue / config.max) * 100;

        const needElement = document.createElement('div');
        needElement.className = 'need-compact-item';
        
        let statusClass = '';
        if (percentage <= 20) statusClass = 'critical';
        else if (percentage <= 50) statusClass = 'warning';

        needElement.innerHTML = `
            <div class="need-icon-wrapper ${statusClass}">
                <span class="need-icon">${config.icon}</span>
                <span class="need-value-compact">${currentValue}</span>
            </div>
            <button class="need-restore-btn-compact" data-need="${needId}" ${gameState.money < config.restoreCost ? 'disabled' : ''}>
                +${config.restoreAmount} (${config.restoreCost}💰)
            </button>
        `;
        
        container.appendChild(needElement);
    });
}

export function updateNeedsBars() {
    Object.keys(NEEDS_CONFIG).forEach(needId => {
        const config = NEEDS_CONFIG[needId];
        const currentValue = Math.round(gameState.needs[needId]);
        const percentage = (currentValue / config.max) * 100;

        const needItem = document.querySelector(`[data-need="${needId}"]`)?.closest('.need-compact-item');
        
        if (needItem) {
            const valueDisplay = needItem.querySelector('.need-value-compact');
            const iconWrapper = needItem.querySelector('.need-icon-wrapper');
            
            if (valueDisplay) {
                valueDisplay.textContent = currentValue;
            }
            
            if (iconWrapper) {
                iconWrapper.classList.remove('critical', 'warning');
                if (percentage <= 20) iconWrapper.classList.add('critical');
                else if (percentage <= 50) iconWrapper.classList.add('warning');
            }
        }
    });
}

export function updateNeedRestoreButtons() {
    document.querySelectorAll('.need-restore-btn-compact').forEach((btn) => {
        const needId = btn.dataset.need;
        if (!needId) return;

        const config = NEEDS_CONFIG[needId];
        btn.disabled = gameState.money < config.restoreCost;
    });
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

    // 🔑 Переключатель множителей
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

    // Заголовок блока способностей
    const abilitiesHeader = document.createElement('div');
    abilitiesHeader.className = 'shop-section-header';
    abilitiesHeader.innerHTML = `<h3>🧬 Способности</h3><p>Постоянные улучшения с уровнями</p>`;
    container.appendChild(abilitiesHeader);

    // Рендер способностей
    Object.keys(UPGRADES_CONFIG).forEach(upgradeId => {
        const config = UPGRADES_CONFIG[upgradeId];
        const currentLevel = gameState.upgrades[upgradeId];
        const remainingToMax = config.maxLevel - currentLevel;
        
        // 🔑 Реальное количество с учётом множителя и максимума
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

        // 🔑 Формируем текст кнопки с учётом количества
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

    // Заголовок блока вещей
    const itemsHeader = document.createElement('div');
    itemsHeader.className = 'shop-section-header';
    itemsHeader.innerHTML = `<h3>🛍️ Вещи</h3><p>Одноразовые покупки и ресурсы</p>`;
    container.appendChild(itemsHeader);

    // Рендер вещей
    Object.keys(ITEMS_CONFIG).forEach(itemId => {
        const config = ITEMS_CONFIG[itemId];
        const maxAffordable = getMaxAffordableItemCount(itemId);
        const actualCount = getActualCount(gameState.purchaseMultiplier, maxAffordable);
        const totalCost = config.cost * (actualCount > 0 ? actualCount : 1);
        const totalReward = config.reward * (actualCount > 0 ? actualCount : 1);
        
        const canAfford = gameState.evolutionPoints >= totalCost && actualCount > 0;

        const item = document.createElement('div');
        item.className = 'upgrade-item item-item';
        
        // 🔑 Исправленный лейбл: показываем количество ПОЛУЧЕННОГО ресурса, а не операций
        let btnText = `Купить за ${config.cost} ОЭ`;
        if (gameState.purchaseMultiplier === 'max') {
            btnText = maxAffordable > 0 
                ? `+${totalReward} за ${totalCost} ОЭ` 
                : 'Недоступно';
        } else if (parseInt(gameState.purchaseMultiplier) > 1) {
            btnText = `+${totalReward} за ${totalCost} ОЭ`;
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
    // Перерисовываем магазин целиком, чтобы обновить цены с учётом множителя
    renderUpgrades();
}

export function updateCrystalCreateButton() {
    const createBtn = document.getElementById('createCrystalBtn');
    if (!createBtn) return;

    const maxAffordable = getMaxAffordableCrystals();
    const actualCount = getActualCount(gameState.purchaseMultiplier, maxAffordable);
    const totalCost = 100 * (actualCount > 0 ? actualCount : 1);
    
    createBtn.disabled = actualCount <= 0 || gameState.evolutionPoints < totalCost;
    
    // 🔑 Обновляем текст кнопки
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

// Состояния персонажа
export function getNeedState(needId) {
    const config = NEEDS_CONFIG[needId];
    const value = gameState.needs[needId];
    const percentage = (value / config.max) * 100;

    for (const [stateKey, stateConfig] of Object.entries(config.states)) {
        if (percentage >= stateConfig.min && percentage <= stateConfig.max) {
            return { key: stateKey, ...stateConfig, percentage };
        }
    }

    return { key: 'unknown', percentage };
}

export function applyCharacterStates() {
    const human = document.getElementById('pixelHuman');
    const stage = document.getElementById('characterStage'); // 🔑 Теперь меняем фон блока
    const caption = document.getElementById('characterCaption');
    const healthEffects = document.getElementById('healthEffects');
    const hungerEffects = document.getElementById('hungerEffects');

    if (!human || !stage || !caption) return;

    human.className = 'pixel-human';
    // 🔑 Очищаем классы фона
    stage.classList.remove('env-luxury', 'env-normal', 'env-poor', 'env-homeless');
    
    if (healthEffects) healthEffects.innerHTML = '';
    if (hungerEffects) hungerEffects.innerHTML = '';

    let statusMessages = [];

    // 🔑 Обработка комфорта — меняем ФОН блока
    const comfortState = getNeedState('comfort');
    if (comfortState.environment) {
        stage.classList.add(`env-${comfortState.environment}`);
    }
    
    if (comfortState.key === 'homeless') {
        statusMessages.push("🌧️ На улице");
    } else if (comfortState.key === 'poor') {
        statusMessages.push("🏚️ В старом доме");
    } else if (comfortState.key === 'normal') {
        statusMessages.push("🏠 В обычном доме");
    } else if (comfortState.key === 'luxury') {
        statusMessages.push("🏰 В замке");
    }

    // Обработка голода
    const hungerState = getNeedState('hunger');
    if (hungerState.key === 'hungry') {
        human.classList.add('hungry');
        statusMessages.push("🍔 Голоден");
        if (hungerEffects) hungerEffects.innerHTML = '<div class="hunger-rumble"></div>';
    } else if (hungerState.key === 'starving') {
        human.classList.add('starving', 'lying-down');
        statusMessages.push("💀 Голодает!");
    } else if (hungerState.key === 'happy') {
        // Не добавляем в статус — и так видно по фону
    }

    // Обработка здоровья
    const healthState = getNeedState('health');
    if (healthState.key === 'sick') {
        human.classList.add('sick');
        statusMessages.push("🤒 Болеет");
        const randomEffect = healthState.effects[Math.floor(Math.random() * healthState.effects.length)];
        human.classList.add(`effect-${randomEffect}`);
        if (healthEffects) healthEffects.innerHTML = `<div class="health-effect-${randomEffect}"></div>`;
    } else if (healthState.key === 'critical') {
        human.classList.add('in-hospital', 'lying-down');
        statusMessages.push("🏥 В больнице");
    } else if (healthState.key === 'coma') {
        human.classList.add('in-coma', 'lying-down');
        statusMessages.push("💤 В КОМЕ!");
    }

    if (statusMessages.length > 0) {
        caption.textContent = statusMessages.join(' • ');
    } else {
        caption.textContent = "✨ Герой готов к тренировкам";
    }
}

export function canTrain() {
    const comfortState = getNeedState('comfort');
    const hungerState = getNeedState('hunger');
    const healthState = getNeedState('health');

    if (comfortState.key === 'homeless') return false;
    if (hungerState.key === 'starving') return false;
    if (healthState.key === 'critical' || healthState.key === 'coma') return false;

    return true;
}

// 🔑 Обновляет подсветку кнопок автообмена и статус авто-траты
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
    
    // 🔑 Обновляем кнопку авто-траты
    const autoSpendBtn = document.getElementById('autoSpendToggle');
    const autoSpendStatus = document.getElementById('autoSpendStatus');
    
    if (autoSpendBtn && autoSpendStatus) {
        autoSpendStatus.textContent = gameState.autoSpendEnabled ? 'ВКЛ' : 'ВЫКЛ';
        autoSpendBtn.classList.toggle('active', gameState.autoSpendEnabled);
    }
}