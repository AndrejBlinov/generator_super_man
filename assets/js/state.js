import { GAME_VERSION, NEEDS_CONFIG, AUTO_EXCHANGE_CONFIG } from './config.js';

export const defaultGameState = {
    evolutionPoints: 0,
    totalPointsEarned: 0,
    money: 0,
    
    // 🔑 Автообмен ОЭ на деньги (фиксированное количество)
    autoExchangeAmount: AUTO_EXCHANGE_CONFIG.default,
    
    // 🔑 Авто-трата денег на потребности (вкл/выкл)
    autoSpendEnabled: true,
    
    purchaseMultiplier: 1,
    
    needs: {
        hunger: NEEDS_CONFIG.hunger.max,
        comfort: NEEDS_CONFIG.comfort.max,
        health: NEEDS_CONFIG.health.max
    },
    
    ageInYears: 30,
    currentDayInYear: 0,
    maxAgeInYears: 100,
    
    absoluteAgeInYears: 30,
    absoluteCurrentDayInYear: 0,
    
    daysInYear: 365,
    lastSaveTimestamp: Date.now(),
    clickPower: 1,
    ageTickRate: 1.0,
    
    doubleClickChance: 0.0,
    critChance: 0.0,
    critMultiplier: 2,
    diseaseResistance: 0.0,
    extraTrainingChance: 0.0,
    
    crystals: [null, null, null, null, null],
    crystalsInventory: [null, null, null, null, null, null, null, null, null, null],
    
    upgrades: {
        slowAging: 0,
        crystals: 0,
        levitation: 0,
        xrayVision: 0,
        regeneration: 0,
        telekinesis: 0
    },
    gameVersion: GAME_VERSION,
    isGameOver: false
};

export let gameState = { ...defaultGameState };

export function setGameState(newState) {
    if (newState.absoluteAgeInYears === undefined) {
        newState.absoluteAgeInYears = newState.ageInYears || 30;
        newState.absoluteCurrentDayInYear = newState.currentDayInYear || 0;
    }
    if (newState.crystalsInventory === undefined) {
        newState.crystalsInventory = [null, null, null, null, null, null, null, null, null, null];
    }
    if (newState.upgrades.crystals === undefined) newState.upgrades.crystals = 0;
    if (newState.upgrades.regeneration === undefined) newState.upgrades.regeneration = 0;
    if (newState.upgrades.telekinesis === undefined) newState.upgrades.telekinesis = 0;
    if (newState.doubleClickChance === undefined) newState.doubleClickChance = 0.0;
    if (newState.diseaseResistance === undefined) newState.diseaseResistance = 0.0;
    if (newState.extraTrainingChance === undefined) newState.extraTrainingChance = 0.0;
    if (newState.money === undefined) newState.money = 0;
    if (newState.purchaseMultiplier === undefined) newState.purchaseMultiplier = 1;
    
    // 🔑 Миграция для новых полей
    if (newState.autoExchangeAmount === undefined) {
        // Если есть старое поле autoExchangePercent, конвертируем
        if (newState.autoExchangePercent !== undefined) {
            newState.autoExchangeAmount = 0; // По умолчанию 0
        } else {
            newState.autoExchangeAmount = AUTO_EXCHANGE_CONFIG.default;
        }
    }
    if (newState.autoSpendEnabled === undefined) newState.autoSpendEnabled = true;
    
    if (newState.needs === undefined) {
        newState.needs = {
            hunger: NEEDS_CONFIG.hunger.max,
            comfort: NEEDS_CONFIG.comfort.max,
            health: NEEDS_CONFIG.health.max
        };
    } else {
        if (newState.needs.hunger === undefined) newState.needs.hunger = NEEDS_CONFIG.hunger.max;
        if (newState.needs.comfort === undefined) newState.needs.comfort = NEEDS_CONFIG.comfort.max;
        if (newState.needs.health === undefined) newState.needs.health = NEEDS_CONFIG.health.max;
    }
    
    gameState = { ...gameState, ...newState };
}

export function getGameState() {
    return gameState;
}

export function resetGameState() {
    gameState = { ...defaultGameState, lastSaveTimestamp: Date.now() };
}