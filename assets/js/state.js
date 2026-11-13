import { GAME_VERSION } from './config.js';
import { NEEDS_CONFIG, getDefaultNeeds } from './needs/index.js';

export const defaultGameState = {
    evolutionPoints: 0,
    totalPointsEarned: 0,
    money: 0,
    
    autoExchangeAmount: 0,
    autoSpendEnabled: true,
    autoTreatEnabled: false,
    purchaseMultiplier: 1,
    
    needs: getDefaultNeeds(),
    activeDiseases: [],
    
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
        slowAging: 0, crystals: 0, levitation: 0, xrayVision: 0, regeneration: 0, telekinesis: 0
    },
    
    legacy: {
        exchangeRateBonus: 0,
        startingCrystalsCount: 0,
        startingAbilities: []
    },
    stats: {
        runsCompleted: 0,
        totalDeaths: 0,
        totalMoneyEarnedThisRun: 0,
        highestCrystalLevel: 1,
        highestAgeReached: 30
    },
    
    gameVersion: GAME_VERSION,
    isGameOver: false
};

export let gameState = { ...defaultGameState };

export function setGameState(newState) {
    // 1. Базовые миграции
    if (newState.absoluteAgeInYears === undefined) {
        newState.absoluteAgeInYears = newState.ageInYears || 30;
        newState.absoluteCurrentDayInYear = newState.currentDayInYear || 0;
    }
    
    // 2. 🔑 ЖЕСТКАЯ ЗАЩИТА МАССИВОВ И ОБЪЕКТОВ (чтобы ничего не сбрасывалось)
    if (!Array.isArray(newState.activeDiseases)) {
        newState.activeDiseases = newState.activeDisease ? [newState.activeDisease] : [];
    }
    delete newState.activeDisease; // очистка старого ключа, если он есть

    if (!Array.isArray(newState.crystals)) newState.crystals = [null, null, null, null, null];
    if (!Array.isArray(newState.crystalsInventory)) newState.crystalsInventory = Array(10).fill(null);

    if (typeof newState.upgrades !== 'object' || newState.upgrades === null) {
        newState.upgrades = { ...defaultGameState.upgrades };
    }

    if (typeof newState.needs !== 'object' || newState.needs === null) {
        newState.needs = getDefaultNeeds();
    } else {
        const defaults = getDefaultNeeds();
        Object.keys(defaults).forEach(needId => {
            if (newState.needs[needId] === undefined) {
                newState.needs[needId] = defaults[needId];
            }
        });
    }

    if (typeof newState.legacy !== 'object' || newState.legacy === null) {
        newState.legacy = { ...defaultGameState.legacy };
    }

    if (typeof newState.stats !== 'object' || newState.stats === null) {
        newState.stats = { ...defaultGameState.stats };
    }

    // 3. Миграции примитивов
    if (newState.doubleClickChance === undefined) newState.doubleClickChance = 0.0;
    if (newState.diseaseResistance === undefined) newState.diseaseResistance = 0.0;
    if (newState.extraTrainingChance === undefined) newState.extraTrainingChance = 0.0;
    if (newState.money === undefined) newState.money = 0;
    if (newState.purchaseMultiplier === undefined) newState.purchaseMultiplier = 1;
    if (newState.autoExchangeAmount === undefined) newState.autoExchangeAmount = 0;
    if (newState.autoSpendEnabled === undefined) newState.autoSpendEnabled = true;
    if (newState.autoTreatEnabled === undefined) newState.autoTreatEnabled = false;

    // 4. Финальное слияние (сохраняет все массивы и объекты из newState)
    gameState = { ...gameState, ...newState };
}

export function getGameState() {
    return gameState;
}

export function resetGameState(keepLegacy = true) {
    const preservedLegacy = keepLegacy ? { ...gameState.legacy } : { ...defaultGameState.legacy };
    const preservedStats = keepLegacy ? { ...gameState.stats } : { ...defaultGameState.stats };
    
    if (keepLegacy) {
        preservedStats.runsCompleted += 1;
    }

    gameState = { 
        ...defaultGameState, 
        legacy: preservedLegacy,
        stats: preservedStats,
        lastSaveTimestamp: Date.now() 
    };
}