import { gameState } from './state.js';
import { AUTO_EXCHANGE_CONFIG } from './config.js';
import { calculatePassiveIncome } from './crystals.js';
import { updateUI, showGameOver, showMessage } from './ui.js';
import { processNeedsTick, processDiseasesTick } from './needs/index.js';

let gameLoopInterval = null;

export function startGameLoop() {
    gameLoopInterval = setInterval(() => {
        if (gameState.isGameOver) return;

        // 1. Пассивный доход
        const passiveIncome = calculatePassiveIncome();
        gameState.evolutionPoints += passiveIncome;
        gameState.totalPointsEarned += passiveIncome;

        // 2. Телекинез
        if (Math.random() < gameState.extraTrainingChance) {
            gameState.evolutionPoints += 1;
            gameState.totalPointsEarned += 1;
        }

        // 3. Автоматический обмен ОЭ на деньги (с учетом бонуса наследия!)
        const currentExchangeRate = 10 + (gameState.legacy.exchangeRateBonus || 0);
        if (gameState.autoExchangeAmount > 0 && gameState.evolutionPoints >= gameState.autoExchangeAmount) {
            gameState.evolutionPoints -= gameState.autoExchangeAmount;
            const moneyGained = gameState.autoExchangeAmount * currentExchangeRate;
            gameState.money += moneyGained;
            gameState.stats.totalMoneyEarnedThisRun += moneyGained; // 🔑 Трекинг
        }

        // 4. Потребности
        const needsResults = processNeedsTick();
        if (needsResults.deaths.length > 0) {
            gameState.isGameOver = true;
            gameState.stats.totalDeaths += 1; // 🔑 Трекинг смертей
            showGameOver(`Ваш персонаж умер от ${needsResults.deaths[0]}!`);
            return;
        }

        // 5. Болезни
        const diseaseResult = processDiseasesTick();
        if (diseaseResult.spawned.length > 0) {
            showMessage(`⚠️ Персонаж заболел: ${diseaseResult.spawned.map(d => d.name).join(', ')}!`);
        }
        if (diseaseResult.progressed.length > 0) {
            showMessage(`🚨 Болезнь ухудшилась: ${diseaseResult.progressed.map(d => d.name).join(', ')}!`);
        }
        if (diseaseResult.died) {
            gameState.isGameOver = true;
            gameState.stats.totalDeaths += 1;
            showGameOver(`Персонаж умер от неизлеченной болезни: ${diseaseResult.died}!`);
            return;
        }

        // 6. Календарное время
        gameState.absoluteCurrentDayInYear += 1.0;
        if (gameState.absoluteCurrentDayInYear >= gameState.daysInYear) {
            gameState.absoluteCurrentDayInYear -= gameState.daysInYear;
            gameState.absoluteAgeInYears++;
        }

        // 7. Биологическое время
        gameState.currentDayInYear += gameState.ageTickRate;
        if (gameState.currentDayInYear >= gameState.daysInYear) {
            gameState.currentDayInYear -= gameState.daysInYear;
            gameState.ageInYears++;
            
            if (gameState.ageInYears >= gameState.maxAgeInYears) {
                gameState.isGameOver = true;
                gameState.stats.totalDeaths += 1;
                showGameOver("Персонаж умер от старости!");
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