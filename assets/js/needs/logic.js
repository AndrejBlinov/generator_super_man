import { gameState } from '../state.js';
import { NEEDS_CONFIG } from './config.js';
import { getDiseaseHealthDecayBonus, isDiseaseBlockingTraining, getActiveDiseasesInfo } from './diseases/index.js';
import { HOUSING_CONFIG } from './../config.js';

export function decayNeed(needId) {
    const config = NEEDS_CONFIG[needId];
    let decay = config.decayPerDay;

    // 🔑 Для здоровья — бонус от болезней и предметов роскоши
    if (needId === 'health') {
        decay += getDiseaseHealthDecayBonus();
        
        // Бонус от абонементов в спортзал
        if (gameState.maxHealthBonus) {
            // Увеличиваем максимальное здоровье
            config.max = 100 + gameState.maxHealthBonus;
        }
    }

    // Для комфорта — применяем множитель жилья и бонусы роскоши
    if (needId === 'comfort') {
        const housing = HOUSING_CONFIG[gameState.housing] || HOUSING_CONFIG.box;
        decay = decay * housing.decayMult;
        
        // Бонус от машины/яхты
        if (gameState.luxuryItems.includes('sports_car')) {
            decay *= 0.9; // Комфорт падает на 10% медленнее
        }
        if (gameState.luxuryItems.includes('yacht')) {
            decay *= 0.8; // Комфорт падает на 20% медленнее
        }
    }

    gameState.needs[needId] = Math.max(0, gameState.needs[needId] - decay);
}

export function restoreNeed(needId, amount = null) {
    const config = NEEDS_CONFIG[needId];

    let currentMax = config.max;
    if (needId === 'comfort') {
        const housing = HOUSING_CONFIG[gameState.housing] || HOUSING_CONFIG.box;
        currentMax = housing.maxComfort;
    }

    if (gameState.needs[needId] >= currentMax) {
        return false;
    }

    const restoreAmount = amount !== null ? amount : config.restoreAmount;

    // 1. Проверяем, хватает ли денег
    if (gameState.money < config.restoreCost) {
        return false;
    }

    // 2. Списываем деньги
    gameState.money -= config.restoreCost;

    // 3. Рассчитываем новое значение
    let newValue = gameState.needs[needId] + restoreAmount;

    // 4. 🔑 КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Ограничиваем максимум в зависимости от потребности
    if (needId === 'comfort') {
        const currentHousing = HOUSING_CONFIG[gameState.housing] || HOUSING_CONFIG.box;
        // Комфорт НЕ МОЖЕТ превысить лимит текущего жилья
        newValue = Math.min(currentHousing.maxComfort, newValue);
    } else {
        // Остальные потребности (голод, здоровье) ограничены своим стандартным максимумом (обычно 100)
        newValue = Math.min(config.max, newValue);
    }

    // 5. Записываем итоговое значение
    gameState.needs[needId] = newValue;

    return true;
}

export function applyAutoSpend(needId) {
    if (!gameState.autoSpendEnabled) return;

    const config = NEEDS_CONFIG[needId];
    
    // 🔑 Определяем РЕАЛЬНЫЙ максимум для этой потребности
    let currentMax = config.max;
    if (needId === 'comfort') {
        const housing = HOUSING_CONFIG[gameState.housing] || HOUSING_CONFIG.box;
        currentMax = housing.maxComfort;
    }

    const currentValue = gameState.needs[needId];

    // 🔑 ПРОВЕРКА 1: Нужно ли вообще восстанавливать?
    if (currentValue >= currentMax) return;

    // 🔑 ПРОВЕРКА 2: Рентабельно ли пополнять?
    // Если при пополнении мы выйдем за лимит, то часть денег потратится впустую
    if (currentValue + config.restoreAmount > currentMax) {
        return; // Не пополняем, ждём пока значение упадёт ниже
    }

    // 🔑 ПРОВЕРКА 3: Хватает ли денег?
    if (gameState.money < config.restoreCost) return;

    // Рассчитываем количество пополнений
    const deficit = currentMax - currentValue;
    const restoresNeeded = Math.ceil(deficit / config.restoreAmount);
    const affordableRestores = Math.floor(gameState.money / config.restoreCost);
    const restoresToApply = Math.min(restoresNeeded, affordableRestores);

    if (restoresToApply > 0) {
        gameState.money -= restoresToApply * config.restoreCost;
        
        let newValue = currentValue + restoresToApply * config.restoreAmount;
        newValue = Math.min(currentMax, newValue);
        
        gameState.needs[needId] = newValue;
    }
}

export function checkNeedDeath(needId) {
    const config = NEEDS_CONFIG[needId];

    if (config.deathOnZero && gameState.needs[needId] <= 0) {
        return { died: true, reason: config.name.toLowerCase() };
    }

    return { died: false };
}

export function processNeedsTick() {
    const results = {
        deaths: [],
        restored: []
    };

    // 🔑 ВСЁ падение потребностей теперь идёт через decayNeed
    // (включая множитель жилья для комфорта)
    Object.keys(NEEDS_CONFIG).forEach(needId => {
        decayNeed(needId);

        const moneyBefore = gameState.money;
        applyAutoSpend(needId);
        if (gameState.money < moneyBefore) {
            results.restored.push(needId);
        }

        const deathCheck = checkNeedDeath(needId);
        if (deathCheck.died) {
            results.deaths.push(deathCheck.reason);
        }
    });

    // 🔑 ЖЁСТКИЙ ПОТОЛОК: комфорт не может быть выше лимита жилья
    const currentHousing = HOUSING_CONFIG[gameState.housing] || HOUSING_CONFIG.box;
    if (gameState.needs.comfort > currentHousing.maxComfort) {
        gameState.needs.comfort = currentHousing.maxComfort;
    }

    return results;
}

export function canTrain() {
    // Проверка на болезнь (если есть такая функция)
    if (typeof isDiseaseBlockingTraining === 'function' && isDiseaseBlockingTraining()) {
        return false;
    }

    const hungerPercent = (gameState.needs.hunger / NEEDS_CONFIG.hunger.max) * 100;
    if (hungerPercent < 30) return false;

    const healthPercent = (gameState.needs.health / NEEDS_CONFIG.health.max) * 100;
    if (healthPercent < 40) return false;

    // 🔑 ГЛАВНОЕ: Запрет только при 0 или ниже
    if (gameState.needs.comfort <= 0) {
        return false;
    }

    return true;
}

export function getTrainingBlockReason() {
    if (typeof isDiseaseBlockingTraining === 'function' && isDiseaseBlockingTraining()) {
        if (typeof getActiveDiseasesInfo === 'function') {
            const diseases = getActiveDiseasesInfo();
            const blocking = diseases.filter(d => d.effects && d.effects.blockTraining);
            if (blocking.length > 0) {
                return `Персонаж болен (${blocking.map(d => d.name).join(', ')})! Нужно лечение.`;
            }
        }
    }

    const hungerPercent = (gameState.needs.hunger / NEEDS_CONFIG.hunger.max) * 100;
    const healthPercent = (gameState.needs.health / NEEDS_CONFIG.health.max) * 100;

    if (hungerPercent < 30) return "Персонаж слишком голоден!";
    if (healthPercent < 40) return "Персонаж слишком болен!";
    
    // 🔑 ГЛАВНОЕ: Сообщение только при реальном нуле
    if (gameState.needs.comfort <= 0) {
        return "Комфорт на нуле! Персонаж не может тренироваться в таких ужасных условиях.";
    }

    return "Можно тренироваться";
}

export function getDefaultNeeds() {
    const needs = {};
    Object.keys(NEEDS_CONFIG).forEach(needId => {
        needs[needId] = NEEDS_CONFIG[needId].max;
    });
    return needs;
}
// © 2024–2026 Андрей Блинов. Все права защищены (All rights reserved).