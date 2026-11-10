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
    
    // Новые характеристики
    doubleClickChance: 0.0,      // Шанс двойного клика (от левитации)
    critChance: 0.0,             // Шанс крита (от рентгена)
    critMultiplier: 2,           // Множитель крита
    diseaseResistance: 0.0,      // Сопротивление болезням (от регенерации)
    extraTrainingChance: 0.0,    // Шанс доп. тренировки (от телекинеза)
    
    // Активные кристаллы (генерируют доход)
    crystals: [null, null, null, null, null],
    
    // Инвентарь (только хранение)
    crystalsInventory: [null, null, null, null, null, null, null, null, null, null],
    
    upgrades: {
        slowAging: 0,
        crystals: 0,        // Новая способность
        levitation: 0,
        xrayVision: 0,
        regeneration: 0,    // Новая способность
        telekinesis: 0      // Новая способность
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
    if (newState.upgrades.crystals === undefined) {
        newState.upgrades.crystals = 0;
    }
    if (newState.upgrades.regeneration === undefined) {
        newState.upgrades.regeneration = 0;
    }
    if (newState.upgrades.telekinesis === undefined) {
        newState.upgrades.telekinesis = 0;
    }
    if (newState.doubleClickChance === undefined) {
        newState.doubleClickChance = 0.0;
    }
    if (newState.diseaseResistance === undefined) {
        newState.diseaseResistance = 0.0;
    }
    if (newState.extraTrainingChance === undefined) {
        newState.extraTrainingChance = 0.0;
    }
    
    gameState = { ...gameState, ...newState };
}

export function getGameState() {
    return gameState;
}

export function resetGameState() {
    gameState = { ...defaultGameState, lastSaveTimestamp: Date.now() };
}