import { gameState, legacy, stats, defaultGameState, saveGame, resetAll, getCurrentExchangeRate } from './state.js';
import { UPGRADES_CONFIG, ITEMS_CONFIG, GAME_START_DATE, CRYSTAL_COST, DIFFICULTY_CONFIG, HOUSING_CONFIG } from './config.js';
import { calculatePassiveIncome, getSelection, getCrystalLevelCost } from './crystals.js';
import { calculateBulkCost, getMaxAffordableCount, getMaxAffordableItemCount } from './upgrades.js';
import { getInheritancePreviewText, finalizeRunAndSaveLegacy, startInheritedGame } from './inheritance.js';
import { getCrystalIcon } from './crystalIcons.js';
import { saveLegacy } from './storage.js';

// 🔑 Импортируем из needs-модуля
import {
    renderNeeds,
    updateNeedsBars,
    updateNeedRestoreButtons,
    applyCharacterStates,
    renderDiseaseBlock,
    updateDiseaseUI
} from './needs/index.js';


// 🔑 Рендер панели выбора сложности
export function renderDifficultyPanel() {
    const container = document.getElementById('difficultyOptions');
    if (!container) return;

    container.innerHTML = '';

    Object.values(DIFFICULTY_CONFIG).forEach(diff => {
        const diffCard = document.createElement('div');
        diffCard.className = 'difficulty-card';
        diffCard.style.borderLeftColor = diff.color;

        diffCard.innerHTML = `
            <div class="difficulty-header">
                <span class="difficulty-icon">${diff.icon}</span>
                <div class="difficulty-info">
                    <div class="difficulty-name" style="color: ${diff.color};">${diff.name}</div>
                    <div class="difficulty-desc">${diff.description}</div>
                </div>
                <button class="difficulty-help-btn" data-tooltip="${diff.description}" title="${diff.description}">❓</button>
            </div>
            <button class="difficulty-select-btn" data-difficulty="${diff.id}" style="background: ${diff.color};">
                Выбрать
            </button>
        `;
        container.appendChild(diffCard);
    });
}

// 🔑 Запуск новой игры с выбранной сложностью
function startNewGameWithDifficulty(difficulty) {
    import('./state.js').then(stateModule => {
        stateModule.resetGameState(false, difficulty);

        import('./storage.js').then(storageModule => {
            storageModule.saveGame();
        });

        // Закрываем панель и запускаем игру
        import('./panels.js').then(panelsModule => {
            panelsModule.closePanel();
        });

        const menu = document.getElementById('mainMenu');
        const app = document.getElementById('gameApp');
        menu.style.display = 'none';
        app.style.display = 'block';

        // Запускаем движок
        import('./main.js').then(() => {
            // Вызываем startGameEngine через глобальную функцию
            if (window.startGameEngine) {
                window.startGameEngine();
            }
        });
    });
}

// Делаем функцию доступной глобально
window.startGameEngine = function () {
    import('./upgrades.js').then(upgradesModule => {
        upgradesModule.recalculateStats();
    });
    renderUI();
    import('./gameLoop.js').then(gameLoopModule => {
        gameLoopModule.startGameLoop();
    });
};

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

    document.getElementById('karmaValue').textContent = gameState.karma;

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
        // 🔑 НОВОЕ: Используем SVG-иконку вместо текста "Lvl"
        const icon = getCrystalIcon(crystal.level);
        slot.innerHTML = `
            <div class="crystal-icon-wrapper">
                ${icon}
            </div>
            <div class="crystal-income">+${crystal.income}/день</div>
        `;
    }

    return slot;
}

export function renderUpgrades() {
    const container = document.getElementById('upgradesContainer');
    container.innerHTML = '';

    // 🔑 Единый расчёт курса — доступен во всём методе
    const currentRate = getCurrentExchangeRate();

    // 1. Переключатель множителя
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

    // 🔑 РАЗДЕЛ: НЕДВИЖИМОСТЬ
    const housingHeader = document.createElement('div');
    housingHeader.className = 'shop-section-header';
    housingHeader.innerHTML = `<h3>🏠 Недвижимость</h3><p>Определяет максимальный уровень комфорта и дает бонусы</p>`;
    container.appendChild(housingHeader);

    const housingLevels = Object.keys(HOUSING_CONFIG);
    const currentIndex = housingLevels.indexOf(gameState.housing);
    const nextIndex = currentIndex + 1;

    // 🔑 Показываем только следующий дом для покупки
    if (nextIndex < housingLevels.length) {
        const nextHouseId = housingLevels[nextIndex];
        const house = HOUSING_CONFIG[nextHouseId];
        const canAfford = gameState.money >= house.cost;

        const item = document.createElement('div');
        item.className = 'upgrade-item item-item';

        const decayText = house.decayMult < 1.0 ? `📉 Комфорт падает на ${Math.round((1 - house.decayMult) * 100)}% медленнее` : '⚠️ Комфорт падает быстрее';
        const incomeText = house.incomeMult > 1.0 ? `📈 +${Math.round((house.incomeMult - 1) * 100)}% к доходу` : '';

        const btnText = canAfford ? `Купить за ${house.cost.toLocaleString()} 💰` : `❌ Нужно ${house.cost.toLocaleString()} 💰`;
        const statusHtml = `<div style="font-size: 11px; color: #666; margin-top: 4px;">
            Макс. комфорт: <strong>${house.maxComfort}</strong><br>
            ${decayText}<br>
            ${incomeText}
        </div>`;

        item.innerHTML = `
            <div class="upgrade-info">
                <div class="upgrade-name">${house.name} ${statusHtml}</div>
            </div>
            <button class="upgrade-btn item-btn" data-housing="${house.id}" ${!canAfford ? 'disabled' : ''}>
                ${btnText}
            </button>
        `;
        container.appendChild(item);
    } else {
        // Максимальный уровень достигнут
        const maxHouse = HOUSING_CONFIG[housingLevels[housingLevels.length - 1]];
        const item = document.createElement('div');
        item.className = 'upgrade-item item-item';
        item.innerHTML = `
            <div class="upgrade-info">
                <div class="upgrade-name">✅ ${maxHouse.name} — максимальный уровень</div>
            </div>
        `;
        container.appendChild(item);
    }

    // 2. Заголовок Способностей
    const abilitiesHeader = document.createElement('div');
    abilitiesHeader.className = 'shop-section-header';
    abilitiesHeader.innerHTML = `<h3>🧬 Способности</h3><p>Постоянные улучшения с уровнями</p>`;
    container.appendChild(abilitiesHeader);

    // 3. Отрисовка Способностей (UPGRADES_CONFIG)
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

    // 4. Заголовок Вещей
    const itemsHeader = document.createElement('div');
    itemsHeader.className = 'shop-section-header';
    itemsHeader.innerHTML = `<h3>🛍️ Вещи</h3><p>Одноразовые покупки и ресурсы</p>`;
    container.appendChild(itemsHeader);

    // 5. Отрисовка Вещей (ITEMS_CONFIG)
    Object.keys(ITEMS_CONFIG).forEach(itemId => {
        const config = ITEMS_CONFIG[itemId];

        // Для предметов роскоши — своя логика
        if (config.karmaBonus || config.comfortBonus || config.healthBonus) {
            const isPurchased = gameState.luxuryItems.includes(itemId);
            const canAfford = gameState.money >= config.cost && !isPurchased;

            const item = document.createElement('div');
            item.className = 'upgrade-item item-item';

            let btnText = `Купить за ${config.cost.toLocaleString()} 💰`;
            if (isPurchased) {
                btnText = '✅ Куплено';
            } else if (!canAfford) {
                btnText = `❌ Нужно ${config.cost.toLocaleString()} 💰`;
            }

            item.innerHTML = `
                <div class="upgrade-info">
                    <div class="upgrade-name">${config.icon} ${config.name}</div>
                    <div class="upgrade-desc">${config.desc}</div>
                </div>
                <button class="upgrade-btn item-btn" data-item="${itemId}" data-count="1" ${!canAfford ? 'disabled' : ''}>
                    ${btnText}
                </button>
            `;
            container.appendChild(item);
            return; // Пропускаем стандартную логику
        }

        // Стандартная логика для обычных предметов
        const maxAffordable = getMaxAffordableItemCount(itemId);
        const actualCount = getActualCount(gameState.purchaseMultiplier, maxAffordable);
        const totalCost = config.cost * (actualCount > 0 ? actualCount : 1);
        const totalReward = Math.floor(currentRate * (actualCount > 0 ? actualCount : 1));
        const canAfford = gameState.evolutionPoints >= totalCost && actualCount > 0;

        const item = document.createElement('div');
        item.className = 'upgrade-item item-item';

        let descText = config.desc;
        if (itemId === 'money_exchange' || config.name === 'Обмен на деньги') {
            descText = `1 ОЭ = ${Math.floor(currentRate)} денег`;
        }

        let btnText = `Купить за ${config.cost} ОЭ`;
        if (gameState.purchaseMultiplier === 'max') {
            btnText = maxAffordable > 0 ? `+${totalReward} 💰 за ${totalCost} ОЭ` : 'Недоступно';
        } else if (parseInt(gameState.purchaseMultiplier) > 1) {
            btnText = `+${totalReward} 💰 за ${totalCost} ОЭ`;
        }

        item.innerHTML = `
            <div class="upgrade-info">
                <div class="upgrade-name">${config.icon} ${config.name}</div>
                <div class="upgrade-desc">${descText}</div>
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
    const lvl2Btn = document.getElementById('createCrystalLvl2Btn');
    const lvl3Btn = document.getElementById('createCrystalLvl3Btn');

    // 🔑 Независимые проверки (место vs деньги) — как в P0-фиксе
    const emptyActiveSlots = gameState.crystals.filter(c => c === null).length;
    const emptyInventorySlots = gameState.crystalsInventory.filter(c => c === null).length;
    const totalEmptySlots = emptyActiveSlots + emptyInventorySlots;
    const points = gameState.evolutionPoints;

    // --- Основная кнопка (1 ур.) ---
    if (createBtn) {
        if (totalEmptySlots === 0) {
            createBtn.disabled = true;
            createBtn.textContent = '❌ Нет свободных слотов (15/15)';
        } else if (points < CRYSTAL_COST) {
            createBtn.disabled = true;
            createBtn.textContent = `❌ Недостаточно ОЭ (нужно ${CRYSTAL_COST})`;
        } else {
            createBtn.disabled = false;
            const maxAffordable = Math.min(Math.floor(points / CRYSTAL_COST), totalEmptySlots);
            if (gameState.purchaseMultiplier === 'max') {
                createBtn.textContent = `⚡ Создать МАКС (${maxAffordable} шт.) за ${maxAffordable * CRYSTAL_COST} ОЭ`;
            } else if (parseInt(gameState.purchaseMultiplier) > 1) {
                const actualCount = Math.min(parseInt(gameState.purchaseMultiplier), maxAffordable);
                createBtn.textContent = `✨ Создать ${actualCount} шт. за ${actualCount * CRYSTAL_COST} ОЭ`;
            } else {
                createBtn.textContent = `Создать 1 кристалл за ${CRYSTAL_COST} ОЭ`;
            }
        }
    }

    // --- Кнопка 2 уровня ---
    if (lvl2Btn) {
        const cost2 = getCrystalLevelCost(2);
        if (totalEmptySlots === 0) {
            lvl2Btn.disabled = true;
            lvl2Btn.textContent = '❌ Нет слотов';
        } else if (points < cost2) {
            lvl2Btn.disabled = true;
            lvl2Btn.textContent = `❌ Нужно ${cost2} ОЭ`;
        } else {
            lvl2Btn.disabled = false;
            lvl2Btn.textContent = `Создать 2 ур. (${cost2} ОЭ)`;
        }
    }

    // --- Кнопка 3 уровня ---
    if (lvl3Btn) {
        const cost3 = getCrystalLevelCost(3);
        if (totalEmptySlots === 0) {
            lvl3Btn.disabled = true;
            lvl3Btn.textContent = '❌ Нет слотов';
        } else if (points < cost3) {
            lvl3Btn.disabled = true;
            lvl3Btn.textContent = `❌ Нужно ${cost3} ОЭ`;
        } else {
            lvl3Btn.disabled = false;
            lvl3Btn.textContent = `Создать 3 ур. (${cost3} ОЭ)`;
        }
    }
}

export function updateItemButtons() {
    document.querySelectorAll('.item-btn').forEach((btn) => {
        const itemId = btn.dataset.item;
        if (!itemId) return;

        const config = ITEMS_CONFIG[itemId];
        if (!config) return;

        if (config.karmaBonus || config.comfortBonus || config.healthBonus) {
            const isPurchased = gameState.luxuryItems.includes(itemId);
            const canAfford = gameState.money >= config.cost;

            // Блокируем, если уже куплено или не хватает денег
            btn.disabled = isPurchased || !canAfford;

            // Обновляем текст кнопки, чтобы он не сбивался
            if (isPurchased) {
                btn.textContent = '✅ Куплено';
            } else if (!canAfford) {
                btn.textContent = `❌ Нужно ${config.cost.toLocaleString()} 💰`;
            } else {
                btn.textContent = `Купить за ${config.cost.toLocaleString()} 💰`;
            }
            return; // Пропускаем стандартную логику ниже
        }

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
        // 🔑 Показываем игроку, сколько денег он получит с учетом бонуса наследия
        const currentRate = getCurrentExchangeRate();
        const moneyGain = gameState.autoExchangeAmount * currentRate;

        valueDisplay.textContent = gameState.autoExchangeAmount === 0
            ? 'Выкл'
            : `${gameState.autoExchangeAmount} ОЭ = ${moneyGain} 💰`;
    }

    const autoSpendBtn = document.getElementById('autoSpendToggle');
    const autoSpendStatus = document.getElementById('autoSpendStatus');

    if (autoSpendBtn && autoSpendStatus) {
        autoSpendStatus.textContent = gameState.autoSpendEnabled ? 'ВКЛ' : 'ВЫКЛ';
        autoSpendBtn.classList.toggle('active', gameState.autoSpendEnabled);
    }

    const autoTreatBtn = document.getElementById('autoTreatToggle');
    const autoTreatStatus = document.getElementById('autoTreatStatus');

    if (autoTreatBtn && autoTreatStatus) {
        autoTreatStatus.textContent = gameState.autoTreatEnabled ? 'ВКЛ' : 'ВЫКЛ';
        autoTreatBtn.classList.toggle('active', gameState.autoTreatEnabled);
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

// export function showGameOver(reason = "Ваш персонаж умер!") {
//     const overlay = document.createElement('div');
//     overlay.className = 'game-over';

//     let inheritancePreview = '';
//     try {
//         inheritancePreview = getInheritancePreviewText();
//     } catch (e) {
//         inheritancePreview = '<p>Бонусы наследия недоступны.</p>';
//     }

//     overlay.innerHTML = `
//         <div class="game-over-content" style="max-width: 600px; text-align: left; max-height: 85vh; overflow-y: auto;">
//             <h2 style="text-align: center; color: #dc3545; margin-bottom: 15px;">💀 Игра окончена</h2>
//             <p style="text-align: center; font-size: 18px; margin-bottom: 15px;"><strong>${reason}</strong></p>

//             <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
//                 <p style="margin: 0 0 5px 0;"><strong>📊 Статистика этого поколения:</strong></p>
//                 <p style="margin: 0;">Прожито лет: <strong>${gameState.ageInYears}</strong></p>
//                 <p style="margin: 0;">Всего заработано ОЭ: <strong>${Math.round(gameState.totalPointsEarned)}</strong></p>
//                 <p style="margin: 0;">Всего заработано 💰: <strong>${Math.round(gameState.stats.totalMoneyEarnedThisRun)}</strong></p>
//             </div>

//             <div style="background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%); padding: 15px; border-radius: 10px; border-left: 4px solid #9c27b0; margin-bottom: 15px;">
//                 <h3 style="color: #6a1b9a; margin: 0 0 10px 0;">🧬 Бонусы наследия</h3>
//                 ${inheritancePreview}
//             </div>

//             <div style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
//                 <button id="inheritAfterDeathBtn" style="flex: 1; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: bold;">
//                     🧬 Наследовать<br>
//                     <span style="font-size: 12px; font-weight: normal;">Получить бонусы</span>
//                 </button>
//                 <button id="fullResetBtn" style="flex: 1; padding: 15px; background: #dc3545; color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: bold;">
//                     🔄 С нуля<br>
//                     <span style="font-size: 12px; font-weight: normal;">Без бонусов</span>
//                 </button>
//             </div>
//         </div>
//     `;

//     document.body.appendChild(overlay);

//     // 🔑 Обработчик "Наследовать"
//     document.getElementById('inheritAfterDeathBtn').addEventListener('click', () => {
//         overlay.remove();
//         import('./inheritance.js').then(module => {
//             module.applyInheritance();
//             // Полная перезагрузка для применения всех бонусов
//             window.location.reload();
//         });
//     });

//     // 🔑 Обработчик "С нуля"
//     document.getElementById('fullResetBtn').addEventListener('click', () => {
//         if (confirm("Вы уверены? ВСЕ бонусы и статистика будут потеряны!")) {
//             overlay.remove();
//             localStorage.removeItem('evolutionGame');
//             window.location.reload();
//         }
//     });
// }

export function showInheritanceModal(isAfterDeath = false) {
    const previewText = getInheritancePreviewText();

    const overlay = document.createElement('div');
    overlay.className = 'game-over'; // Используем те же стили, что и для Game Over
    overlay.innerHTML = `
        <div class="game-over-content" style="max-width: 500px; text-align: left;">
            <h2 style="text-align: center; color: #667eea;">🧬 Наследие</h2>
            ${previewText}
            <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: center;">
                <button id="cancelInheritBtn" style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
                    Отмена
                </button>
                <button id="confirmInheritBtn" style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;">
                    Начать новое поколение
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('cancelInheritBtn').addEventListener('click', () => {
        overlay.remove();
    });

    document.getElementById('confirmInheritBtn').addEventListener('click', () => {
        overlay.remove();
        import('./inheritance.js').then(module => {
            // Запускаем новую игру с бонусами
            module.startInheritedGame(gameState.difficulty || 'medium');
            window.location.reload();
        });
    });
}

// 🔑 ЭКРАН СМЕРТИ: наследие фиксируется всегда, кнопки имеют РАЗНЫЙ функционал
export function showDeathScreen(reason) {
    // 1. Фиксируем наследие СРАЗУ — независимо от выбора кнопки
    try { finalizeRunAndSaveLegacy(); } catch (e) { console.error(e); }

    const overlay = document.createElement('div');
    overlay.className = 'game-over';

    // 2. Статистика
    const diffNames = { easy: 'Лёгкая 🌱', medium: 'Средняя ⚖️', hard: 'Тяжёлая 💀' };
    const karma = gameState.karma ?? 50;
    const karmaColor = karma < 35 ? '#e53e3e' : (karma > 65 ? '#38a169' : '#d69e2e');
    const karmaLabel = karma < 35 ? 'Тёмная' : (karma > 65 ? 'Светлая' : 'Нейтральная');

    let inheritancePreview = '';
    try {
        inheritancePreview = getInheritancePreviewText();
    } catch (e) {
        inheritancePreview = '<div class="legacy-empty">Бонусы недоступны.</div>';
    }

    overlay.innerHTML = `
        <div class="game-over-content death-screen">
            <h2 class="death-title">💀 Игра окончена</h2>
            <p class="death-reason">${reason}</p>

            <div class="death-stats">
                <h3>📊 Итоги поколения</h3>
                <div class="death-stat-grid">
                    <div class="death-stat">
                        <span class="ds-label">Возраст</span>
                        <span class="ds-value">${gameState.ageInYears} лет</span>
                    </div>
                    <div class="death-stat">
                        <span class="ds-label">Сложность</span>
                        <span class="ds-value">${diffNames[gameState.difficulty] || 'Средняя ⚖️'}</span>
                    </div>
                    <div class="death-stat">
                        <span class="ds-label">Карма</span>
                        <span class="ds-value" style="color:${karmaColor}">${karma} · ${karmaLabel}</span>
                    </div>
                    <div class="death-stat">
                        <span class="ds-label">Заработано ОЭ</span>
                        <span class="ds-value">${Math.round(gameState.totalPointsEarned).toLocaleString('ru-RU')}</span>
                    </div>
                    <div class="death-stat">
                        <span class="ds-label">Заработано 💰</span>
                        <span class="ds-value">${Math.round(gameState.stats?.totalMoneyEarnedThisRun || 0).toLocaleString('ru-RU')}</span>
                    </div>
                    <div class="death-stat">
                        <span class="ds-label">Поколение №</span>
                        <span class="ds-value">${stats.runsCompleted}</span>
                    </div>
                </div>
            </div>

            <div class="death-legacy">
                <h3>🧬 Наследие следующего поколения</h3>
                ${inheritancePreview}
            </div>

            <div class="death-buttons">
                <button id="inheritAfterDeathBtn" class="death-btn death-btn-primary">
                    🧬 Новое поколение<span>С бонусами · тот же пол и сложность</span>
                </button>
                <button id="backToMenuBtn" class="death-btn death-btn-secondary">
                    🏠 В меню<span>Вернуться в главное меню</span>
                </button>
                <button id="fullResetBtn" class="death-btn death-btn-danger">
                    🗑️ Сбросить всё<span>Удалить наследие и статистику</span>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // 🔑 Кнопка 1: МГНОВЕННЫЙ рестарт с бонусами (без перезагрузки страницы)
    document.getElementById('inheritAfterDeathBtn').addEventListener('click', () => {
        overlay.remove();

        const savedGender = gameState.gender;
        const savedDifficulty = gameState.difficulty || 'medium';

        // Полный сброс состояния
        Object.assign(gameState, JSON.parse(JSON.stringify(defaultGameState)));
        gameState.gender = savedGender;
        gameState.difficulty = savedDifficulty;
        gameState.isGameOver = false;

        // Стартовая карма по сложности
        const diffConfig = DIFFICULTY_CONFIG[savedDifficulty] || DIFFICULTY_CONFIG.medium;
        gameState.karma = diffConfig.startKarma ?? 40;

        // 🔑 Применяем накопленное наследие (кристаллы)
        (legacy.startingCrystals || []).forEach(c => {
            const emptyActive = gameState.crystals.findIndex(cr => cr === null);
            const emptyInv = gameState.crystalsInventory.findIndex(cr => cr === null);
            if (emptyActive !== -1) {
                gameState.crystals[emptyActive] = { level: c.level, income: c.income };
            } else if (emptyInv !== -1) {
                gameState.crystalsInventory[emptyInv] = { level: c.level, income: c.income };
            }
        });
        legacy.startingCrystals = [];

        // 🔑 Стартовые способности
        (legacy.startingAbilities || []).forEach(abilityId => {
            if (gameState.upgrades[abilityId] !== undefined) gameState.upgrades[abilityId] += 1;
        });
        legacy.startingAbilities = [];

        // 🔑 Наследуемый дом
        gameState.housing = legacy.inheritedHousing || 'box';
        const house = HOUSING_CONFIG[gameState.housing] || HOUSING_CONFIG.box;
        if (gameState.needs.comfort > house.maxComfort) {
            gameState.needs.comfort = house.maxComfort;
        }

        saveLegacy(legacy);
        saveGame();

        // Запуск движка (глобальная функция из этого же файла)
        window.startGameEngine();
    });

    // 🔑 Кнопка 2: В главное меню (наследие уже сохранено)
    document.getElementById('backToMenuBtn').addEventListener('click', () => {
        overlay.remove();
        window.location.reload();
    });

    // 🔑 Кнопка 3: Полный сброс (наследие + статистика)
    document.getElementById('fullResetBtn').addEventListener('click', () => {
        if (confirm("⚠️ Вы уверены? БУДУТ УДАЛЕНЫ: наследие, статистика поколений и все рекорды. Это действие необратимо!")) {
            overlay.remove();
            resetAll();
            window.location.reload();
        }
    });
}

// 🔑 ОБНОВЛЁННАЯ showGameOver — теперь вызывает showDeathScreen
export function showGameOver(reason = "Ваш персонаж умер!") {
    showDeathScreen(reason);
}
// © 2024–2026 Андрей Блинов. Все права защищены (All rights reserved).