import { gameState, resetGameState } from './state.js';
import { loadGame, saveGame, clearSave } from './storage.js';
import { startGameLoop } from './gameLoop.js';
import { recalculateStats, buyUpgrade, buyItem} from './upgrades.js';
import { renderUI, updateUI, showCritPopup, showMessage, renderCrystals, renderUpgrades, canTrain } from './ui.js';
import { createCrystal, selectCrystal } from './crystals.js';
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

    // 🔑 Используем новую функцию canTrain()
    if (!canTrain()) {
        showMessage("Персонаж не может тренироваться в таком состоянии!");
        return;
    }

    // 🔑 Проверка комфорта
    if (gameState.needs.comfort <= 0) {
        showMessage("Персонаж слишком устал! Восстановите комфорт.");
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

// 🔑 Восстановление потребности
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

function init() {
    loadGame();
    recalculateStats();
    renderUI();
    startGameLoop();

    document.getElementById('trainBtn').addEventListener('click', clickTrain);

    document.getElementById('createCrystalBtn').addEventListener('click', () => {
        if (createCrystal()) {
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
        // Обработка покупки способности
        const upgradeBtn = e.target.closest('.upgrade-btn[data-upgrade]');
        if (upgradeBtn && !upgradeBtn.disabled) {
            const upgradeId = upgradeBtn.dataset.upgrade;
            if (buyUpgrade(upgradeId)) {
                renderUpgrades();
                updateUI();
            }
            return;
        }

        // 🔑 Обработка покупки вещи
        const itemBtn = e.target.closest('.item-btn[data-item]');
        if (itemBtn && !itemBtn.disabled) {
            const itemId = itemBtn.dataset.item;
            if (buyItem(itemId)) {
                renderUpgrades();
                updateUI();
            }
            return;
        }
    });

    // 🔑 Обработчик кнопок восстановления потребностей
    document.getElementById('needsContainer').addEventListener('click', (e) => {
        const btn = e.target.closest('.need-restore-btn');
        if (!btn || btn.disabled) return;

        const needId = btn.dataset.need;
        restoreNeed(needId);
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

    setInterval(saveGame, 30000);

    initPanels();
}

init();