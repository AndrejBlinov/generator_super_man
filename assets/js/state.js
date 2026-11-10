import { GAME_VERSION } from './config.js';

export const defaultGameState = {
    evolutionPoints: 0,
    totalPointsEarned: 0,
    
    // Биологический возраст (замедляется улучшениями)
    ageInYears: 30,
    currentDayInYear: 0,
    maxAgeInYears: 100,
    
    // Календарное время (абсолютное, не замедляется)
    absoluteAgeInYears: 30,
    absoluteCurrentDayInYear: 0,
    
    daysInYear: 365,
    lastSaveTimestamp: Date.now(),
    clickPower: 1,
    ageTickRate: 1.0,
    critChance: 0.0,
    critMultiplier: 5,
    
    // Активные кристаллы (генерируют доход)
    crystals: [null, null, null, null, null],
    
    // Инвентарь (только хранение)
    crystalsInventory: [null, null, null, null, null, null, null, null, null, null],
    
    upgrades: {
        slowAging: 0,
        levitation: 0,
        xrayVision: 0
    },
    gameVersion: GAME_VERSION,
    isGameOver: false
};

export let gameState = { ...defaultGameState };

export function setGameState(newState) {
    // Миграция старых сохранений
    if (newState.absoluteAgeInYears === undefined) {
        newState.absoluteAgeInYears = newState.ageInYears || 30;
        newState.absoluteCurrentDayInYear = newState.currentDayInYear || 0;
    }
    if (newState.crystalsInventory === undefined) {
        newState.crystalsInventory = [null, null, null, null, null, null, null, null, null, null];
    }
    gameState = { ...gameState, ...newState };
}

export function getGameState() {
    return gameState;
}

export function resetGameState() {
    gameState = { ...defaultGameState, lastSaveTimestamp: Date.now() };
}