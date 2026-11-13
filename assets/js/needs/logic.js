import { gameState } from '../state.js';
import { NEEDS_CONFIG } from './config.js';
import { getDiseaseHealthDecayBonus, isDiseaseBlockingTraining, getActiveDiseasesInfo } from './diseases/index.js';

export function decayNeed(needId) {
    const config = NEEDS_CONFIG[needId];
    let decay = config.decayPerDay;
    
    if (needId === 'health') {
        decay += getDiseaseHealthDecayBonus();
    }
    
    gameState.needs[needId] = Math.max(0, gameState.needs[needId] - decay);
}

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
    
    return results;
}

export function canTrain() {
    // 🔑 Проверка болезни
    if (isDiseaseBlockingTraining()) return false;
    
    const hungerPercent = (gameState.needs.hunger / NEEDS_CONFIG.hunger.max) * 100;
    if (hungerPercent < 30) return false;
    
    const comfortPercent = (gameState.needs.comfort / NEEDS_CONFIG.comfort.max) * 100;
    if (comfortPercent < 30) return false;
    
    const healthPercent = (gameState.needs.health / NEEDS_CONFIG.health.max) * 100;
    if (healthPercent < 40) return false;
    
    return true;
}

export function getTrainingBlockReason() {
    // 🔑 Сначала проверяем болезнь
    if (isDiseaseBlockingTraining()) {
        const diseases = getActiveDiseasesInfo();
        const blocking = diseases.filter(d => d.effects.blockTraining);
        if (blocking.length > 0) {
            return `Персонаж болен (${blocking.map(d => d.name).join(', ')})! Нужно лечение.`;
        }
    }
    
    const hungerPercent = (gameState.needs.hunger / NEEDS_CONFIG.hunger.max) * 100;
    const comfortPercent = (gameState.needs.comfort / NEEDS_CONFIG.comfort.max) * 100;
    const healthPercent = (gameState.needs.health / NEEDS_CONFIG.health.max) * 100;
    
    if (hungerPercent < 30) return "Персонаж слишком голоден!";
    if (comfortPercent < 30) return "Персонаж бездомный! Восстановите комфорт.";
    if (healthPercent < 40) return "Персонаж слишком болен!";
    
    return "Персонаж не может тренироваться!";
}

export function getDefaultNeeds() {
    const needs = {};
    Object.keys(NEEDS_CONFIG).forEach(needId => {
        needs[needId] = NEEDS_CONFIG[needId].max;
    });
    return needs;
}