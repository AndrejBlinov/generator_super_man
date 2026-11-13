import { GAME_VERSION } from './config.js';
import { NEEDS_CONFIG, getDefaultNeeds } from './needs/index.js';

export const defaultGameState = {
    evolutionPoints: 0,
    totalPointsEarned: 0,
    money: 0,
    
    autoExchangeAmount: 0,
    autoSpendEnabled: true,
    
    purchaseMultiplier: 1,
    
    needs: getDefaultNeeds(),
    
    // 🔑 Активная болезнь (null или объект { id, ticksRemaining, progressed })
    activeDisease: null,
    
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
    if (newState.autoExchangeAmount === undefined) newState.autoExchangeAmount = 0;
    if (newState.autoSpendEnabled === undefined) newState.autoSpendEnabled = true;
    
    // 🔑 Миграция болезней
    if (newState.activeDisease === undefined) newState.activeDisease = null;
    
    if (newState.needs === undefined) {
        newState.needs = getDefaultNeeds();
    } else {
        const defaults = getDefaultNeeds();
        Object.keys(defaults).forEach(needId => {
            if (newState.needs[needId] === undefined) {
                newState.needs[needId] = defaults[needId];
            }
        });
    }
    
    gameState = { ...gameState, ...newState };
}

export function getGameState() {
    return gameState;
}

export function resetGameState() {
    gameState = { ...defaultGameState, lastSaveTimestamp: Date.now() };
}