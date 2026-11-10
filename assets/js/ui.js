import { gameState } from './state.js';
import { UPGRADES_CONFIG, ITEMS_CONFIG, GAME_START_DATE, NEEDS_CONFIG } from './config.js';
import { calculatePassiveIncome, getSelection } from './crystals.js';
import { calculateUpgradeCost} from './upgrades.js';

// Функция для преобразования дней в дату YYYY-MM-DD
function formatCalendarDate(years, days) {
    const startDate = new Date(
        GAME_START_DATE.year,
        GAME_START_DATE.month - 1,
        GAME_START_DATE.day
    );
    
    // 🔑 КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: 
    // Берем количество прошедших лет, умножаем на 365 и прибавляем текущие дни.
    // (years у нас начинается с 30, поэтому вычитаем 30, чтобы считать только прошедшее время)
    const totalDaysPassed = ((years - 30) * 365) + days;
    
    // Объект Date в JS сам умеет правильно переносить месяцы и годы при сложении дней!
    startDate.setDate(startDate.getDate() + totalDaysPassed);
    
    const finalYear = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    
    return `${finalYear}-${month}-${day}`;
}

export function renderUI() {
    renderNeeds();
    renderCrystals();
    renderUpgrades();
    updateUI();
}

// 🔑 Рендер потребностей
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

export function updateUI() {
    const bioDays = Math.floor(gameState.currentDayInYear);

    document.getElementById('bioAge').textContent = 
        `${gameState.ageInYears} лет ${bioDays} дн. / ${gameState.maxAgeInYears} лет`;
    
    document.getElementById('calendarAge').textContent = 
        formatCalendarDate(gameState.absoluteAgeInYears, gameState.absoluteCurrentDayInYear);
        
    document.getElementById('points').textContent = 
        Math.round(gameState.evolutionPoints);
    
    // 🔑 Добавляем отображение денег
    document.getElementById('money').textContent = 
        `${gameState.money} 💰`;
        
    document.getElementById('passive').textContent = 
        `${calculatePassiveIncome()} ОЭ/день`;
    document.getElementById('clickPower').textContent = 
        `${Math.round(gameState.clickPower)} ОЭ`;

    updateShopButtons();
    updateCrystalCreateButton();
    updateItemButtons(); // 🔑 Обновляем кнопки вещей
    updateNeedRestoreButtons();
    updateNeedsBars();
    updateShopButtons();
    applyCharacterStates(); // 🔑 Применяем визуальные состояния
}

// 🔑 Обновляет доступность кнопок восстановления потребностей
export function updateNeedRestoreButtons() {
    document.querySelectorAll('.need-restore-btn').forEach((btn) => {
        const needId = btn.dataset.need;
        if (!needId) return;

        const config = NEEDS_CONFIG[needId];
        btn.disabled = gameState.money < config.restoreCost;
    });
}

// 🔑 Обновляет только прогресс-бары потребностей (без перерисовки DOM)
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

// Обновляет доступность кнопок магазина без перерисовки всего DOM
export function updateShopButtons() {
    document.querySelectorAll('.upgrade-btn').forEach((btn) => {
        const upgradeId = btn.dataset.upgrade;
        if (!upgradeId) return;

        const config = UPGRADES_CONFIG[upgradeId];
        const currentLevel = gameState.upgrades[upgradeId];

        if (currentLevel >= config.maxLevel) {
            btn.disabled = true;
            btn.textContent = 'МАКС';
            return;
        }

        const cost = calculateUpgradeCost(upgradeId);
        btn.disabled = gameState.evolutionPoints < cost;
        btn.textContent = `${cost} ОЭ`;
    });
}

// Обновляет доступность кнопки создания кристалла
export function updateCrystalCreateButton() {
    const createBtn = document.getElementById('createCrystalBtn');
    if (!createBtn) return;

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

    // 🔑 Заголовок блока способностей
    const abilitiesHeader = document.createElement('div');
    abilitiesHeader.className = 'shop-section-header';
    abilitiesHeader.innerHTML = `<h3>🧬 Способности</h3><p>Постоянные улучшения с уровнями</p>`;
    container.appendChild(abilitiesHeader);

    // Рендер способностей
    Object.keys(UPGRADES_CONFIG).forEach(upgradeId => {
        const config = UPGRADES_CONFIG[upgradeId];
        const currentLevel = gameState.upgrades[upgradeId];
        const cost = currentLevel < config.maxLevel 
            ? calculateUpgradeCost(upgradeId)
            : 0;

        const item = document.createElement('div');
        item.className = 'upgrade-item';
        
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

    // 🔑 Заголовок блока вещей
    const itemsHeader = document.createElement('div');
    itemsHeader.className = 'shop-section-header';
    itemsHeader.innerHTML = `<h3>🛍️ Вещи</h3><p>Одноразовые покупки и ресурсы</p>`;
    container.appendChild(itemsHeader);

    // Рендер вещей
    Object.keys(ITEMS_CONFIG).forEach(itemId => {
        const config = ITEMS_CONFIG[itemId];
        
        const item = document.createElement('div');
        item.className = 'upgrade-item item-item';
        
        item.innerHTML = `
            <div class="upgrade-info">
                <div class="upgrade-name">${config.icon} ${config.name}</div>
                <div class="upgrade-desc">${config.desc}</div>
            </div>
            <button class="upgrade-btn item-btn" data-item="${itemId}" ${gameState.evolutionPoints < config.cost ? 'disabled' : ''}>
                Купить за ${config.cost} ОЭ
            </button>
        `;
        container.appendChild(item);
    });
}

// 🔑 Обновляет доступность кнопок покупки вещей
export function updateItemButtons() {
    document.querySelectorAll('.item-btn').forEach((btn) => {
        const itemId = btn.dataset.item;
        if (!itemId) return;

        const config = ITEMS_CONFIG[itemId];
        btn.disabled = gameState.evolutionPoints < config.cost;
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

// 🔑 Определяет состояние потребности
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

// 🔑 Применяет визуальные состояния к человечку
export function applyCharacterStates() {
    const human = document.getElementById('pixelHuman');
    const environment = document.getElementById('environment');
    const caption = document.getElementById('characterCaption');
    const healthEffects = document.getElementById('healthEffects');
    const hungerEffects = document.getElementById('hungerEffects');

    if (!human || !environment || !caption) return;

    // Очищаем старые классы
    human.className = 'pixel-human';
    environment.className = 'environment';
    healthEffects.innerHTML = '';
    hungerEffects.innerHTML = '';

    let statusMessages = [];

    // Обработка комфорта (окружение)
    const comfortState = getNeedState('comfort');
    if (comfortState.environment) {
        environment.classList.add(comfortState.environment);
    }
    if (comfortState.key === 'homeless') {
        statusMessages.push("Бездомный");
    } else if (comfortState.key === 'poor') {
        statusMessages.push("Живёт в бедности");
    }

    // Обработка голода
    const hungerState = getNeedState('hunger');
    if (hungerState.key === 'hungry') {
        human.classList.add('hungry');
        statusMessages.push("Голоден");
        // Добавляем эффект урчания
        hungerEffects.innerHTML = '<div class="hunger-rumble"></div>';
    } else if (hungerState.key === 'starving') {
        human.classList.add('starving', 'lying-down');
        statusMessages.push("Голодает!");
    } else if (hungerState.key === 'happy') {
        statusMessages.push("Сытый и довольный");
    }

    // Обработка здоровья
    const healthState = getNeedState('health');
    if (healthState.key === 'sick') {
        human.classList.add('sick');
        statusMessages.push("Болеет");
        // Рандомный эффект болезни
        const randomEffect = healthState.effects[Math.floor(Math.random() * healthState.effects.length)];
        human.classList.add(`effect-${randomEffect}`);
        healthEffects.innerHTML = `<div class="health-effect-${randomEffect}"></div>`;
    } else if (healthState.key === 'critical') {
        human.classList.add('in-hospital', 'lying-down');
        statusMessages.push("В больнице");
    } else if (healthState.key === 'coma') {
        human.classList.add('in-coma', 'lying-down');
        statusMessages.push("В КОМЕ!");
    }

    // Обновляем подпись
    if (statusMessages.length > 0) {
        caption.textContent = statusMessages.join(' • ');
    } else {
        caption.textContent = "Герой готов к тренировкам";
    }
}

// 🔑 Проверяет, может ли персонаж тренироваться
export function canTrain() {
    const comfortState = getNeedState('comfort');
    const hungerState = getNeedState('hunger');
    const healthState = getNeedState('health');

    if (comfortState.key === 'homeless') return false;
    if (hungerState.key === 'starving') return false;
    if (healthState.key === 'critical' || healthState.key === 'coma') return false;

    return true;
}
