import { gameState, handleDeath } from './state.js';
import { calculatePassiveIncome } from './crystals.js';
import { updateUI, showGameOver, showMessage } from './ui.js';
import { processNeedsTick, processDiseasesTick } from './needs/index.js';
import { getCurrentExchangeRate } from './state.js';
import { updateCharacterStateFromGame } from './character/index.js';
import { checkAndTriggerDailyEvent } from './events/logic.js';
import { checkTutorialCondition } from './tutorial.js';
import { checkAndUnlockAchievements } from './achievements.js';

let gameLoopInterval = null;

export function startGameLoop() {
    // Если интервал уже есть — очищаем его, чтобы не было дублирования скорости
    if (gameLoopInterval !== null) {
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
    }

    gameLoopInterval = setInterval(() => {
        // 🔑 0. ПРОВЕРКА ТУТОРИАЛА (Приоритет №1)
        const isTutorialModalOpen = document.getElementById('tutorialModal')?.classList.contains('active');
        
        if (isTutorialModalOpen) {
            // Игра на паузе! Проверяем только условие туториала и обновляем UI (чтобы рос счетчик ОЭ при клике)
            if (gameState.tutorialEnabled && typeof checkTutorialCondition === 'function') {
                checkTutorialCondition();
            }
            updateUI();
            return; // ⛔ ОСТАНАВЛИВАЕМ цикл здесь. Никаких событий, старения или падения потребностей.
        }

        // 🔑 1. ГЛАВНАЯ ПАУЗА: Если активно сюжетное событие
        if (gameState.activeEvent) return; 
        if (document.querySelector('.event-modal-backdrop.active')) return;

        // 🔑 2. ПАУЗА ПРИ ОТКРЫТЫХ ПАНЕЛЯХ
        const isAnyPanelOpen = document.querySelector('.side-panel.is-open') !== null;
        const isDonateModalOpen = document.querySelector('.donate-modal.is-open') !== null;
        if (isAnyPanelOpen || isDonateModalOpen) return;

        if (gameState.isGameOver) return;

        // 3. Уменьшаем счетчик иммунитета
        if (gameState.diseaseImmunityTicks > 0) {
            gameState.diseaseImmunityTicks--;
            if (gameState.diseaseImmunityTicks === 0) {
                showMessage("⚠️ Иммунитет от болезней закончился!");
            }
        }

        // 4. ПРОВЕРКА СОБЫТИЙ
        checkAndTriggerDailyEvent();
        
        // Если событие только что сработало, прерываем тик
        if (gameState.activeEvent) return;

        // 5. Пассивный доход
        const passiveIncome = calculatePassiveIncome();
        gameState.evolutionPoints += passiveIncome;
        gameState.totalPointsEarned += passiveIncome;

        // 6. Телекинез
        if (Math.random() < gameState.extraTrainingChance) {
            gameState.evolutionPoints += 1;
            gameState.totalPointsEarned += 1;
        }

        // 7. Автоматический обмен ОЭ на деньги
        const currentExchangeRate = getCurrentExchangeRate();
        if (gameState.autoExchangeAmount > 0 && gameState.evolutionPoints >= gameState.autoExchangeAmount) {
            gameState.evolutionPoints -= gameState.autoExchangeAmount;
            const moneyGained = gameState.autoExchangeAmount * currentExchangeRate;
            gameState.money += moneyGained;

            if (!gameState.stats) gameState.stats = { totalMoneyEarnedThisRun: 0 };
            gameState.stats.totalMoneyEarnedThisRun += moneyGained;
        }

        // 8. Потребности
        const needsResults = processNeedsTick();
        if (needsResults.deaths.length > 0) {
            gameState.isGameOver = true;
            stopGameLoop();
            handleDeath();
            showGameOver(`Ваш персонаж умер от ${needsResults.deaths[0]}!`);
            return;
        }

        // 9. Болезни
        const diseaseResult = processDiseasesTick();
        if (diseaseResult.spawned.length > 0) {
            showMessage(`⚠️ Персонаж заболел: ${diseaseResult.spawned.map(d => d.name).join(', ')}!`);
        }
        if (diseaseResult.progressed.length > 0) {
            showMessage(`🚨 Болезнь ухудшилась: ${diseaseResult.progressed.map(d => d.name).join(', ')}!`);
        }
        if (diseaseResult.died) {
            gameState.isGameOver = true;
            stopGameLoop();
            handleDeath();
            showGameOver(`Персонаж умер от неизлеченной болезни: ${diseaseResult.died}!`);
            return;
        }

        // 10. ЛОГИКА ПИТОМЦЕВ
        if (gameState.pet) {
            gameState.needs.hunger = Math.max(0, gameState.needs.hunger - 0.5);
            gameState.pet.daysLived++;
            if (gameState.pet.daysLived >= gameState.pet.lifespanDays) {
                showMessage(`😢 Ваш питомец (${gameState.pet.type === 'dog' ? 'пёс' : gameState.pet.type}) умер от старости.`);
                gameState.karma = Math.max(0, gameState.karma - 5);
                gameState.flags = gameState.flags.filter(f => f !== "has_dog");
                gameState.pet = null;
            }
        }

        // 11. Календарное время
        gameState.absoluteCurrentDayInYear += 1.0;
        if (gameState.absoluteCurrentDayInYear >= gameState.daysInYear) {
            gameState.absoluteCurrentDayInYear -= gameState.daysInYear;
            gameState.absoluteAgeInYears++;
        }

        // 12. Биологическое время
        gameState.currentDayInYear += gameState.ageTickRate;
        if (gameState.currentDayInYear >= gameState.daysInYear) {
            gameState.currentDayInYear -= gameState.daysInYear;
            gameState.ageInYears++;

            if (gameState.ageInYears >= gameState.maxAgeInYears) {
                gameState.isGameOver = true;
                stopGameLoop();
                handleDeath();
                showGameOver("Персонаж умер от старости!");
            }
        }

        // 🔑 ПРОВЕРКА ТУТОРИАЛА (для шагов, которые не блокируют UI, хотя сейчас все блокируют)
        if (gameState.tutorialEnabled && gameState.tutorialStep > 0 && typeof checkTutorialCondition === 'function') {
            checkTutorialCondition();
        }
        checkAndUnlockAchievements();

        updateCharacterStateFromGame();
        updateUI();
    }, 1000);
}

export function stopGameLoop() {
    if (gameLoopInterval !== null) {
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
    }
}
// © 2024–2026 Андрей Блинов. Все права защищены (All rights reserved).