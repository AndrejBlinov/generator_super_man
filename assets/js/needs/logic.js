// Логика потребностей: падение, восстановление, смерть, проверка тренировки

import { gameState } from '../state.js';
import { NEEDS_CONFIG } from './config.js';
import { getActiveDiseaseInfo, getDiseaseHealthDecayBonus, isDiseaseBlockingTraining } from './diseases/index.js';

export function decayNeed(needId) {
    const config = NEEDS_CONFIG[needId];
    let decay = config.decayPerDay;

    // 🔑 Если это здоровье и есть активная болезнь — увеличиваем падение
    if (needId === 'health') {
        decay += getDiseaseHealthDecayBonus();
    }

    gameState.needs[needId] = Math.max(0, gameState.needs[needId] - decay);
}

// Восстановление потребности за деньги
export function restoreNeed(needId, amount = null) {
    const config = NEEDS_CONFIG[needId];
    const restoreAmount = amount !== null ? amount : config.restoreAmount;

    if (gameState.money < config.restoreCost) {
        return false;
    }

    gameState.money -= config.restoreCost;
    gameState.needs[needId] = Math.min(config.max, gameState.needs[needId] + restoreAmount);
    return true;
}

// Автоматическое восстановление до 100% (если включено и есть деньги)
export function applyAutoSpend(needId) {
    if (!gameState.autoSpendEnabled) return;

    const config = NEEDS_CONFIG[needId];

    if (gameState.needs[needId] < config.max && gameState.money >= config.restoreCost) {
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
}

// Проверка смерти от потребности
export function checkNeedDeath(needId) {
    const config = NEEDS_CONFIG[needId];

    if (config.deathOnZero && gameState.needs[needId] <= 0) {
        return { died: true, reason: config.name.toLowerCase() };
    }

    return { died: false };
}

// Обработка всех потребностей за один тик
export function processNeedsTick() {
    const results = {
        deaths: [],
        restored: []
    };

    Object.keys(NEEDS_CONFIG).forEach(needId => {
        // 1. Падение
        decayNeed(needId);

        // 2. Автоматическое восстановление
        const moneyBefore = gameState.money;
        applyAutoSpend(needId);
        if (gameState.money < moneyBefore) {
            results.restored.push(needId);
        }

        // 3. Проверка смерти
        const deathCheck = checkNeedDeath(needId);
        if (deathCheck.died) {
            results.deaths.push(deathCheck.reason);
        }
    });

    return results;
}

// Проверка возможности тренироваться
export function canTrain() {

    if (isDiseaseBlockingTraining()) return false;

    const hungerValue = gameState.needs.hunger;
    const comfortValue = gameState.needs.comfort;
    const healthValue = gameState.needs.health;

    const hungerConfig = NEEDS_CONFIG.hunger;
    const comfortConfig = NEEDS_CONFIG.comfort;
    const healthConfig = NEEDS_CONFIG.health;

    // Голод: нельзя тренироваться, если < 30%
    const hungerPercent = (hungerValue / hungerConfig.max) * 100;
    if (hungerPercent < 30) return false;

    // Комфорт: нельзя тренироваться, если < 30%
    const comfortPercent = (comfortValue / comfortConfig.max) * 100;
    if (comfortPercent < 30) return false;

    // Здоровье: нельзя тренироваться, если < 40%
    const healthPercent = (healthValue / healthConfig.max) * 100;
    if (healthPercent < 40) return false;

    return true;
}

// Получение причины блокировки тренировки (для сообщения)
export function getTrainingBlockReason() {
    // 🔑 Сначала проверяем болезнь
    if (isDiseaseBlockingTraining()) {
        const disease = getActiveDiseaseInfo();
        if (disease) return `Персонаж болен (${disease.name})! Нужно лечение.`;
    }

    const hungerPercent = (gameState.needs.hunger / NEEDS_CONFIG.hunger.max) * 100;
    const comfortPercent = (gameState.needs.comfort / NEEDS_CONFIG.comfort.max) * 100;
    const healthPercent = (gameState.needs.health / NEEDS_CONFIG.health.max) * 100;

    if (hungerPercent < 30) return "Персонаж слишком голоден!";
    if (comfortPercent < 30) return "Персонаж бездомный! Восстановите комфорт.";
    if (healthPercent < 40) return "Персонаж слишком болен!";

    return "Персонаж не может тренироваться!";
}

// Получить начальное состояние потребностей (для миграции)
export function getDefaultNeeds() {
    const needs = {};
    Object.keys(NEEDS_CONFIG).forEach(needId => {
        needs[needId] = NEEDS_CONFIG[needId].max;
    });
    return needs;
}