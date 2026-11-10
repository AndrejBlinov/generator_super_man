import { gameState } from './state.js';
import { NEEDS_CONFIG } from './config.js';
import { calculatePassiveIncome } from './crystals.js';
import { updateUI, showGameOver } from './ui.js';

let gameLoopInterval = null;

export function startGameLoop() {
    gameLoopInterval = setInterval(() => {
        if (gameState.isGameOver) return;

        // 1. Пассивный доход от кристаллов
        const passiveIncome = calculatePassiveIncome();
        gameState.evolutionPoints += passiveIncome;
        gameState.totalPointsEarned += passiveIncome;

        // 2. Телекинез: шанс доп. тренировки
        if (Math.random() < gameState.extraTrainingChance) {
            gameState.evolutionPoints += 1;
            gameState.totalPointsEarned += 1;
        }

        // 🔑 3. Падение потребностей
        Object.keys(NEEDS_CONFIG).forEach(needId => {
            const config = NEEDS_CONFIG[needId];
            gameState.needs[needId] = Math.max(0, gameState.needs[needId] - config.decayPerDay);
            
            // 🔑 Автоматическое восстановление, если < 50% и есть деньги
            if (gameState.needs[needId] < config.max * 0.5 && gameState.money >= config.restoreCost) {
                gameState.money -= config.restoreCost;
                gameState.needs[needId] = Math.min(config.max, gameState.needs[needId] + config.restoreAmount);
            }
            
            // Проверка смерти
            if (config.deathOnZero && gameState.needs[needId] <= 0) {
                gameState.isGameOver = true;
                showGameOver(`Ваш персонаж умер от ${config.name.toLowerCase()}!`);
                return;
            }
        });

        if (gameState.isGameOver) return;

        // 4. Календарное время
        gameState.absoluteCurrentDayInYear += 1.0;
        if (gameState.absoluteCurrentDayInYear >= gameState.daysInYear) {
            gameState.absoluteCurrentDayInYear -= gameState.daysInYear;
            gameState.absoluteAgeInYears++;
        }

        // 5. Биологическое время
        gameState.currentDayInYear += gameState.ageTickRate;
        if (gameState.currentDayInYear >= gameState.daysInYear) {
            gameState.currentDayInYear -= gameState.daysInYear;
            gameState.ageInYears++;
            
            if (gameState.ageInYears >= gameState.maxAgeInYears) {
                gameState.isGameOver = true;
                showGameOver("Ваш персонаж умер от старости!");
            }
        }

        updateUI();
    }, 1000);
}

export function stopGameLoop() {
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
    }
}