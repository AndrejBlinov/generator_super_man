import { gameState } from './state.js';
import { NEEDS_CONFIG, AUTO_EXCHANGE_CONFIG } from './config.js';
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

        // 🔑 3. Автоматический обмен ОЭ на деньги (фиксированное количество)
        if (gameState.autoExchangeAmount > 0 && gameState.evolutionPoints >= gameState.autoExchangeAmount) {
            gameState.evolutionPoints -= gameState.autoExchangeAmount;
            gameState.money += gameState.autoExchangeAmount * AUTO_EXCHANGE_CONFIG.rate;
        }

        // 🔑 4. Падение потребностей + авто-трата денег (если включена)
        Object.keys(NEEDS_CONFIG).forEach(needId => {
            const config = NEEDS_CONFIG[needId];
            gameState.needs[needId] = Math.max(0, gameState.needs[needId] - config.decayPerDay);
            
            // 🔑 Авто-трата только если включена
            if (gameState.autoSpendEnabled && gameState.needs[needId] < config.max && gameState.money >= config.restoreCost) {
                const deficit = config.max - gameState.needs[needId];
                const restoresNeeded = Math.ceil(deficit / config.restoreAmount);
                const affordableRestores = Math.floor(gameState.money / config.restoreCost);
                const restoresToApply = Math.min(restoresNeeded, affordableRestores);
                
                if (restoresToApply > 0) {
                    gameState.money -= restoresToApply * config.restoreCost;
                    gameState.needs[needId] = Math.min(
                        config.max, 
                        gameState.needs[needId] + restoresToApply * config.restoreAmount
                    );
                }
            }
            
            if (config.deathOnZero && gameState.needs[needId] <= 0) {
                gameState.isGameOver = true;
                showGameOver(`Ваш персонаж умер от ${config.name.toLowerCase()}!`);
                return;
            }
        });

        if (gameState.isGameOver) return;

        // 5. Календарное время
        gameState.absoluteCurrentDayInYear += 1.0;
        if (gameState.absoluteCurrentDayInYear >= gameState.daysInYear) {
            gameState.absoluteCurrentDayInYear -= gameState.daysInYear;
            gameState.absoluteAgeInYears++;
        }

        // 6. Биологическое время
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