import { gameState, resetGameState } from './state.js';
import { loadGame, saveGame, clearSave } from './storage.js';
import { startGameLoop } from './gameLoop.js';
import { recalculateStats, buyUpgradeBulk, buyItemBulk } from './upgrades.js';
import { renderUI, updateUI, showCritPopup, showMessage, renderCrystals, renderUpgrades, renderNeeds, canTrain } from './ui.js';
import { createCrystalBulk, selectCrystal, getMaxAffordableCrystals } from './crystals.js';
import { initPanels, setOnPanelOpenCallback } from './panels.js';
import { NEEDS_CONFIG } from './config.js';

function animateHeroTraining() {
    const hero = document.getElementById('pixelHuman');

    if (!hero) return;

    hero.classList.remove('is-training');
    void hero.offsetWidth;
    hero.classList.add('is-training');

    setTimeout(() => {
        hero.classList.remove('is-training');
    }, 350);
}

function clickTrain(event) {
    if (gameState.isGameOver) return;

    if (!canTrain()) {
        showMessage("Персонаж не может тренироваться в таком состоянии!");
        return;
    }

    animateHeroTraining();

    let earned = gameState.clickPower;
    let isDoubleClick = false;
    let isCrit = false;

    if (Math.random() < gameState.doubleClickChance) {
        earned *= 2;
        isDoubleClick = true;
    }

    if (Math.random() < gameState.critChance) {
        earned *= gameState.critMultiplier;
        isCrit = true;
    }

    if (isCrit || isDoubleClick) {
        let popupText = '';

        if (isDoubleClick && isCrit) {
            popupText = `ДВОЙНОЙ + КРИТ! +${Math.round(earned)}`;
        } else if (isDoubleClick) {
            popupText = `ДВОЙНОЙ! +${Math.round(earned)}`;
        } else {
            popupText = `КРИТ! +${Math.round(earned)}`;
        }

        showCritPopup(event, earned, popupText);
    }

    gameState.evolutionPoints += earned;
    gameState.totalPointsEarned += earned;

    updateUI();
}

function restoreNeed(needId) {
    const config = NEEDS_CONFIG[needId];
    
    if (gameState.money < config.restoreCost) {
        showMessage("Недостаточно денег!");
        return false;
    }

    gameState.money -= config.restoreCost;
    gameState.needs[needId] = Math.min(config.max, gameState.needs[needId] + config.restoreAmount);
    
    showMessage(`${config.name} восстановлено!`);
    renderNeeds();
    updateUI();
    return true;
}

function getActualCount(baseCount, maxAffordable) {
    if (baseCount === 'max') return maxAffordable;
    return Math.min(parseInt(baseCount), maxAffordable);
}

function init() {
    loadGame();
    recalculateStats();
    renderUI();
    startGameLoop();

    document.getElementById('trainBtn').addEventListener('click', clickTrain);

    document.getElementById('createCrystalBtn').addEventListener('click', () => {
        const maxAffordable = getMaxAffordableCrystals();
        const actualCount = getActualCount(gameState.purchaseMultiplier, maxAffordable);
        
        if (actualCount > 0 && createCrystalBulk(actualCount)) {
            renderCrystals();
            updateUI();
        }
    });

    document.getElementById('activeCrystalsGrid').addEventListener('click', (e) => {
        const slot = e.target.closest('.crystal-slot');
        if (!slot) return;

        const index = parseInt(slot.dataset.index);
        selectCrystal('active', index);
        renderCrystals();
        updateUI();
    });

    document.getElementById('inventoryCrystalsGrid').addEventListener('click', (e) => {
        const slot = e.target.closest('.crystal-slot');
        if (!slot) return;

        const index = parseInt(slot.dataset.index);
        selectCrystal('inventory', index);
        renderCrystals();
        updateUI();
    });

    document.getElementById('upgradesContainer').addEventListener('click', (e) => {
        const multiplierBtn = e.target.closest('.multiplier-btn');
        if (multiplierBtn) {
            const multiplierValue = multiplierBtn.dataset.multiplier;
            gameState.purchaseMultiplier = multiplierValue === 'max' ? 'max' : parseInt(multiplierValue);
            renderUpgrades();
            updateUI();
            return;
        }

        const upgradeBtn = e.target.closest('.upgrade-btn[data-upgrade]');
        if (upgradeBtn && !upgradeBtn.disabled) {
            const upgradeId = upgradeBtn.dataset.upgrade;
            const count = parseInt(upgradeBtn.dataset.count) || 1;
            if (buyUpgradeBulk(upgradeId, count)) {
                renderUpgrades();
                updateUI();
            }
            return;
        }

        const itemBtn = e.target.closest('.item-btn[data-item]');
        if (itemBtn && !itemBtn.disabled) {
            const itemId = itemBtn.dataset.item;
            const count = parseInt(itemBtn.dataset.count) || 1;
            if (buyItemBulk(itemId, count)) {
                renderUpgrades();
                updateUI();
            }
            return;
        }
    });

    document.getElementById('needsContainer').addEventListener('click', (e) => {
        const btn = e.target.closest('.need-restore-btn-compact');
        if (!btn || btn.disabled) return;

        const needId = btn.dataset.need;
        restoreNeed(needId);
    });

    // 🔑 Обработчик кнопок автообмена
    document.getElementById('autoExchangeButtons').addEventListener('click', (e) => {
        const btn = e.target.closest('.exchange-btn');
        if (!btn) return;

        const percent = parseInt(btn.dataset.percent);
        gameState.autoExchangePercent = percent;
        
        const label = percent === 0 ? "выключен" : `${percent}%`;
        showMessage(`Автообмен: ${label}`);
        updateUI();
    });

    document.getElementById('saveBtn').addEventListener('click', () => {
        saveGame();
        showMessage("Игра сохранена!");
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        if (confirm("Вы уверены? Весь прогресс будет потерян, а дата сброшена к 2026-01-01!")) {
            console.log("🔄 Начинаем процесс ПОЛНОГО сброса...");
            
            localStorage.removeItem('evolutionGame');
            console.log("🗑️ localStorage очищен!");
            
            resetGameState();
            
            window.location.replace(window.location.href);
        }
    });

        // 🔑 Обработчик кнопки авто-траты
    document.getElementById('autoSpendToggle').addEventListener('click', () => {
        gameState.autoSpendEnabled = !gameState.autoSpendEnabled;
        
        const status = gameState.autoSpendEnabled ? 'включена' : 'выключена';
        showMessage(`Авто-трата денег: ${status}`);
        updateUI();
    });

    // 🔑 Обработчик кнопок автообмена (фиксированное количество)
    document.getElementById('autoExchangeButtons').addEventListener('click', (e) => {
        const btn = e.target.closest('.exchange-btn');
        if (!btn) return;

        const amount = parseInt(btn.dataset.amount);
        gameState.autoExchangeAmount = amount;
        
        const label = amount === 0 ? "выключен" : `${amount} ОЭ/тик`;
        showMessage(`Автообмен: ${label}`);
        updateUI();
    });

    // 🔑 Обработчик кнопки помощи
    document.getElementById('helpButton').addEventListener('click', () => {
        import('./panels.js').then(module => {
            module.openPanel('helpPanel');
        });
    });

    setInterval(saveGame, 30000);

    setOnPanelOpenCallback((panelId) => {
        if (panelId === 'shopPanel') {
            renderUpgrades();
        } else if (panelId === 'crystalsPanel') {
            renderCrystals();
            updateUI();
        }
    });

    initPanels();
}

init();