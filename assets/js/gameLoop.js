// Игровой цикл

import { gameState } from './state.js';
import { calculatePassiveIncome } from './crystals.js';
import { updateUI } from './ui.js';
import { showGameOver } from './ui.js';

let gameLoopInterval = null;

export function startGameLoop() {
    gameLoopInterval = setInterval(() => {
        if (gameState.isGameOver) return;

        // Пассивный доход от кристаллов
        const passiveIncome = calculatePassiveIncome();
        gameState.evolutionPoints += passiveIncome;
        gameState.totalPointsEarned += passiveIncome;

        // Старение
        gameState.currentDayInYear += gameState.ageTickRate;
        
        if (gameState.currentDayInYear >= gameState.daysInYear) {
            gameState.currentDayInYear -= gameState.daysInYear;
            gameState.ageInYears++;
            
            // Проверка смерти от старости
            if (gameState.ageInYears >= gameState.maxAgeInYears) {
                gameState.isGameOver = true;
                showGameOver();
            }
        }

        updateUI();
    }, 1000); // 1 секунда = 1 игровой день
}

export function stopGameLoop() {
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
    }
}