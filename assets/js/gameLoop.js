import { gameState } from './state.js';
import { AUTO_EXCHANGE_CONFIG } from './config.js';
import { calculatePassiveIncome } from './crystals.js';
import { updateUI, showGameOver, showMessage } from './ui.js';
import { processNeedsTick, processDiseaseTick } from './needs/index.js';

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

        // 3. Автоматический обмен ОЭ на деньги
        if (gameState.autoExchangeAmount > 0 && gameState.evolutionPoints >= gameState.autoExchangeAmount) {
            gameState.evolutionPoints -= gameState.autoExchangeAmount;
            gameState.money += gameState.autoExchangeAmount * AUTO_EXCHANGE_CONFIG.rate;
        }

        // 4. Обработка потребностей
        const needsResults = processNeedsTick();
        
        if (needsResults.deaths.length > 0) {
            gameState.isGameOver = true;
            showGameOver(`Ваш персонаж умер от ${needsResults.deaths[0]}!`);
            return;
        }

        // 🔑 5. Обработка болезней
        const diseaseResult = processDiseaseTick();
        
        // Новая болезнь появилась
        if (diseaseResult.spawned) {
            showMessage(`⚠️ Ваш персонаж заболел: ${diseaseResult.spawned.name}!`);
        }
        
        // Болезнь прогрессировала
        if (diseaseResult.progressed) {
            showMessage(`🚨 Болезнь ухудшилась: ${diseaseResult.progressed.name}!`);
        }
        
        // Смерть от болезни
        if (diseaseResult.died) {
            gameState.isGameOver = true;
            showGameOver(`Ваш персонаж умер от неизлеченной болезни: ${diseaseResult.reason}!`);
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