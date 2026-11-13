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
    
    // 🔑 НОВОЕ: Наследие и Статистика
    legacy: {
        exchangeRateBonus: 0,       // +5% за каждые 10к потраченных денег
        startingCrystalsCount: 0,   // Кол-во кристаллов 1 ур. на старте
        startingAbilities: []       // Массив ID способностей 1 ур. на старте
    },
    stats: {
        runsCompleted: 0,
        totalDeaths: 0,
        totalMoneyEarnedThisRun: 0, // Для расчета "потраченных" денег
        highestCrystalLevel: 1,
        highestAgeReached: 30
    },
    
    gameVersion: GAME_VERSION,
    isGameOver: false
};

export let gameState = { ...defaultGameState };

export function setGameState(newState) {
    // ... (все старые проверки миграции) ...
    
    // 🔑 Миграция Наследия и Статистики (сохраняем их при перезагрузке!)
    if (newState.legacy === undefined) newState.legacy = { ...defaultGameState.legacy };
    if (newState.stats === undefined) newState.stats = { ...defaultGameState.stats };
    
    if (newState.needs === undefined) newState.needs = getDefaultNeeds();
    // ... (остальная миграция needs и diseases как была) ...
    
    gameState = { ...gameState, ...newState };
}

export function getGameState() {
    return gameState;
}

// 🔑 ОБНОВЛЕННЫЙ СБРОС: сохраняет legacy и stats!
export function resetGameState(keepLegacy = true) {
    const preservedLegacy = keepLegacy ? { ...gameState.legacy } : { ...defaultGameState.legacy };
    const preservedStats = keepLegacy ? { ...gameState.stats } : { ...defaultGameState.stats };
    
    // Увеличиваем счетчики при сбросе
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