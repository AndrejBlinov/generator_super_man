// Точка входа

import { gameState, resetGameState } from './state.js';
import { loadGame, saveGame, clearSave } from './storage.js';
import { startGameLoop } from './gameLoop.js';
import { recalculateStats } from './upgrades.js';
import { renderUI, showCritPopup } from './ui.js';

function clickTrain(event) {
    if (gameState.isGameOver) return;

    let earned = gameState.clickPower;
    let isCrit = false;

    if (Math.random() < gameState.critChance) {
        earned *= gameState.critMultiplier;
        isCrit = true;
        showCritPopup(event, earned);
    }

    gameState.evolutionPoints += earned;
    gameState.totalPointsEarned += earned;
}

function init() {
    loadGame();
    recalculateStats();
    renderUI();
    startGameLoop();

    document.getElementById('trainBtn').onclick = clickTrain;
    document.getElementById('createCrystalBtn').onclick = () => {
        import('./crystals.js').then(module => {
            module.createCrystal();
        });
    };
    document.getElementById('saveBtn').onclick = () => {
        saveGame();
        import('./ui.js').then(module => {
            module.showMessage("Игра сохранена!");
        });
    };
    document.getElementById('resetBtn').onclick = () => {
        if (confirm("Вы уверены? Весь прогресс будет потерян!")) {
            clearSave();
            location.reload();
        }
    };

    setInterval(saveGame, 30000);
}

init();