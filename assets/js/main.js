import { gameState, resetGameState } from './state.js';
import { loadGame, saveGame, clearSave } from './storage.js';
import { startGameLoop } from './gameLoop.js';
import { recalculateStats, buyUpgrade } from './upgrades.js';
import { renderUI, updateUI, showCritPopup, showMessage, renderCrystals, renderUpgrades } from './ui.js';
import { createCrystal, selectCrystal } from './crystals.js';

function clickTrain(event) {
    if (gameState.isGameOver) return;
    
    let earned = gameState.clickPower;
    let isDoubleClick = false;
    let isCrit = false;

    // Проверка двойного клика (левитация)
    if (Math.random() < gameState.doubleClickChance) {
        earned *= 2;
        isDoubleClick = true;
    }

    // Проверка крита (рентген)
    if (Math.random() < gameState.critChance) {
        earned *= gameState.critMultiplier;
        isCrit = true;
    }

    // Показываем попап только если был крит или двойной клик
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
        const btn = e.target.closest('.upgrade-btn');
        if (!btn || btn.disabled) return;
        
        const upgradeId = btn.dataset.upgrade;
        if (buyUpgrade(upgradeId)) {
            renderUpgrades();
            updateUI();
        }
    });

    document.getElementById('saveBtn').addEventListener('click', () => {
        saveGame();
        showMessage("Игра сохранена!");
    });

    // 🔧 ИСПРАВЛЕННЫЙ СБРОС
    document.getElementById('resetBtn').addEventListener('click', () => {
        if (confirm("Вы уверены? Весь прогресс будет потерян!")) {
            // 1. Явно сбрасываем состояние в памяти
            resetGameState();
            // 2. Очищаем localStorage
            clearSave();
            // 3. Перезагружаем страницу
            location.reload();
        }
    });

    setInterval(saveGame, 30000);
}

init();