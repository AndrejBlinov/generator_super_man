import { gameState } from './state.js';
import { calculatePassiveIncome } from './crystals.js';
import { updateUI } from './ui.js';
import { showGameOver } from './ui.js';

let gameLoopInterval = null;

export function startGameLoop() {
    gameLoopInterval = setInterval(() => {
        if (gameState.isGameOver) return;

        // 1. Пассивный доход от кристаллов
        const passiveIncome = calculatePassiveIncome();
        gameState.evolutionPoints += passiveIncome;
        gameState.totalPointsEarned += passiveIncome;

        // 2. Телекинез: шанс доп. тренировки (+1 ОЭ/день)
        if (Math.random() < gameState.extraTrainingChance) {
            gameState.evolutionPoints += 1;
            gameState.totalPointsEarned += 1;
        }

        // 3. Календарное время (всегда тикает на 1.0 день в секунду)
        gameState.absoluteCurrentDayInYear += 1.0;
        if (gameState.absoluteCurrentDayInYear >= gameState.daysInYear) {
            gameState.absoluteCurrentDayInYear -= gameState.daysInYear;
            gameState.absoluteAgeInYears++;
        }

        // 4. Биологическое время (тикает с учетом модификаторов)
        gameState.currentDayInYear += gameState.ageTickRate;
        if (gameState.currentDayInYear >= gameState.daysInYear) {
            gameState.currentDayInYear -= gameState.daysInYear;
            gameState.ageInYears++;
            
            // Проверка смерти от старости (только по биологическому возрасту!)
            if (gameState.ageInYears >= gameState.maxAgeInYears) {
                gameState.isGameOver = true;
                showGameOver();
            }
        }

        updateUI();
    }, 1000); // 1 реальная секунда = 1 календарный день
}

export function stopGameLoop() {
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
    }
}