import { gameState } from './state.js';
import { loadGame, saveGame, clearSave } from './storage.js';
import { startGameLoop } from './gameLoop.js';
import { recalculateStats, buyUpgrade } from './upgrades.js';
import { renderUI, updateUI, showCritPopup, showMessage, renderCrystals, renderUpgrades } from './ui.js';
import { createCrystal, selectCrystal } from './crystals.js';

function clickTrain(event) {
    if (gameState.isGameOver) return;
    
    let earned = gameState.clickPower;

    if (Math.random() < gameState.critChance) {
        earned *= gameState.critMultiplier;
        showCritPopup(event, earned);
    }

    gameState.evolutionPoints += earned;
    gameState.totalPointsEarned += earned;
    updateUI(); // Мгновенное обновление интерфейса после клика
}

function init() {
    loadGame();
    recalculateStats();
    renderUI();
    startGameLoop();

    // 1. Кнопка тренировки
    document.getElementById('trainBtn').addEventListener('click', clickTrain);
    
    // 2. Кнопка создания кристалла
    document.getElementById('createCrystalBtn').addEventListener('click', () => {
        if (createCrystal()) {
            updateUI();
        }
    });

    // 3. Делегирование событий для АКТИВНЫХ кристаллов
    document.getElementById('activeCrystalsGrid').addEventListener('click', (e) => {
        const slot = e.target.closest('.crystal-slot');
        if (!slot) return;
        
        const index = parseInt(slot.dataset.index);
        selectCrystal('active', index);
        renderCrystals();
        updateUI();
    });

    // 4. Делегирование событий для ИНВЕНТАРЯ
    document.getElementById('inventoryCrystalsGrid').addEventListener('click', (e) => {
        const slot = e.target.closest('.crystal-slot');
        if (!slot) return;
        
        const index = parseInt(slot.dataset.index);
        selectCrystal('inventory', index);
        renderCrystals();
        updateUI();
    });

    // 5. Делегирование событий для кнопок магазина
    document.getElementById('upgradesContainer').addEventListener('click', (e) => {
        const btn = e.target.closest('.upgrade-btn');
        if (!btn || btn.disabled) return;
        
        const upgradeId = btn.dataset.upgrade;
        if (buyUpgrade(upgradeId)) {
            renderUpgrades();
            updateUI();
        }
    });

    // 6. Кнопки управления
    document.getElementById('saveBtn').addEventListener('click', () => {
        saveGame();
        showMessage("Игра сохранена!");
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        if (confirm("Вы уверены? Весь прогресс будет потерян!")) {
            clearSave();
            location.reload();
        }
    });

    // Автосохранение каждые 30 секунд
    setInterval(saveGame, 30000);
}

init();