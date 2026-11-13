import { GAME_VERSION, DIFFICULTY_CONFIG } from './config.js';
import { NEEDS_CONFIG, getDefaultNeeds } from './needs/index.js';
import { 
    saveActiveGame, loadActiveGame, clearActiveGame,
    saveLegacy, loadLegacy,
    saveStats, loadStats,
    migrateFromOldFormat, // 🔑 Импорт здесь, а не через require
    clearAll              // 🔑 Импорт здесь, а не через require
} from './storage.js';

// Дефолтное наследие
export const defaultLegacy = {
    exchangeRateBonus: 0,
    startingCrystalsCount: 0,
    startingAbilities: []
};

// Дефолтная статистика
export const defaultStats = {
    runsCompleted: 0,
    totalDeaths: 0,
    totalMoneyEarnedAllTime: 0,
    highestCrystalLevel: 1,
    highestAgeReached: 30,
    lastRunDifficulty: 'medium'
};

// Дефолтное состояние активной игры
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
    
    diseaseImmunityTicks: 0,
    difficulty: 'medium',
    
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
    
    stats: { totalMoneyEarnedThisRun: 0 }, // Для отслеживания трат внутри одного прохождения
    
    isGameOver: false
};

// Текущее состояние игры
export let gameState = { ...defaultGameState };
export let legacy = { ...defaultLegacy };
export let stats = { ...defaultStats };

// ==========================================
// ЗАГРУЗКА ИГРЫ (вызывается при старте)
// ==========================================
export function loadFullGame() {
    // 1. Миграция со старого формата (если есть старый ключ evolutionGame)
    migrateFromOldFormat();
    
    // 2. Загружаем наследие
    const savedLegacy = loadLegacy();
    if (savedLegacy) {
        legacy = { ...defaultLegacy, ...savedLegacy };
    }
    
    // 3. Загружаем статистику
    const savedStats = loadStats();
    if (savedStats) {
        stats = { ...defaultStats, ...savedStats };
    }
    
    // 4. Загружаем активную игру
    const savedActive = loadActiveGame();
    if (savedActive) {
        gameState = applyMigrations({ ...defaultGameState, ...savedActive });
        return true; // Есть активное сохранение
    }
    
    // 5. Если нет активной игры — начинаем с дефолтного состояния
    gameState = { ...defaultGameState };
    return false;
}

// Миграции полей (защита от старых сохранений)
function applyMigrations(state) {
    if (state.absoluteAgeInYears === undefined) {
        state.absoluteAgeInYears = state.ageInYears || 30;
        state.absoluteCurrentDayInYear = state.currentDayInYear || 0;
    }
    if (!Array.isArray(state.activeDiseases)) {
        state.activeDiseases = state.activeDisease ? [state.activeDisease] : [];
    }
    delete state.activeDisease;
    if (!Array.isArray(state.crystals)) state.crystals = [null, null, null, null, null];
    if (!Array.isArray(state.crystalsInventory)) state.crystalsInventory = Array(10).fill(null);
    if (typeof state.upgrades !== 'object' || state.upgrades === null) {
        state.upgrades = { ...defaultGameState.upgrades };
    }
    if (typeof state.needs !== 'object' || state.needs === null) {
        state.needs = getDefaultNeeds();
    } else {
        const defaults = getDefaultNeeds();
        Object.keys(defaults).forEach(needId => {
            if (state.needs[needId] === undefined) state.needs[needId] = defaults[needId];
        });
    }
    
    // Миграции примитивов
    if (state.doubleClickChance === undefined) state.doubleClickChance = 0.0;
    if (state.diseaseResistance === undefined) state.diseaseResistance = 0.0;
    if (state.extraTrainingChance === undefined) state.extraTrainingChance = 0.0;
    if (state.money === undefined) state.money = 0;
    if (state.purchaseMultiplier === undefined) state.purchaseMultiplier = 1;
    if (state.autoExchangeAmount === undefined) state.autoExchangeAmount = 0;
    if (state.autoSpendEnabled === undefined) state.autoSpendEnabled = true;
    if (state.autoTreatEnabled === undefined) state.autoTreatEnabled = false;
    if (state.diseaseImmunityTicks === undefined) state.diseaseImmunityTicks = 0;
    if (state.difficulty === undefined) state.difficulty = 'medium';
    if (typeof state.stats !== 'object' || state.stats === null) {
        state.stats = { totalMoneyEarnedThisRun: 0 };
    }
    
    return state;
}

// ==========================================
// СОХРАНЕНИЕ
// ==========================================
export function saveGame() {
    saveActiveGame(gameState);
}

// ==========================================
// СБРОС
// ==========================================

// Сброс активной игры (при смерти или начале новой)
export function resetActiveGame(difficulty = 'medium') {
    const diffConfig = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
    
    console.log(`🔄 [resetActiveGame] Сброс с сложностью: ${difficulty}, старт. возраст: ${diffConfig.startAge}`);
    
    gameState = {
        ...defaultGameState,
        needs: getDefaultNeeds(),
        difficulty: difficulty,
        ageInYears: diffConfig.startAge,
        absoluteAgeInYears: diffConfig.startAge,
        diseaseImmunityTicks: diffConfig.diseaseImmunityDays,
        lastSaveTimestamp: Date.now()
    };
    
    // Сохраняем сложность в статистику
    stats.lastRunDifficulty = difficulty;
    saveStats(stats);
}

// Сброс всего (только при полном сбросе из меню)
export function resetAll() {
    gameState = { ...defaultGameState, needs: getDefaultNeeds() };
    legacy = { ...defaultLegacy };
    stats = { ...defaultStats };
    
    clearAll();
}

// Обработка смерти: сохраняем статистику, удаляем активную игру
export function handleDeath() {
    // Обновляем статистику
    stats.totalDeaths += 1;
    stats.runsCompleted += 1;
    stats.highestAgeReached = Math.max(stats.highestAgeReached, gameState.ageInYears);
    stats.totalMoneyEarnedAllTime += (gameState.stats?.totalMoneyEarnedThisRun || 0);
    
    const allCrystals = [...gameState.crystals, ...gameState.crystalsInventory];
    const maxLvl = allCrystals.filter(c => c).reduce((max, c) => Math.max(max, c.level), 1);
    stats.highestCrystalLevel = Math.max(stats.highestCrystalLevel, maxLvl);
    
    // Сохраняем статистику
    saveStats(stats);
    
    // Удаляем активную игру
    clearActiveGame();
}

// Получатели
export function getGameState() { return gameState; }
export function getLegacy() { return legacy; }
export function getStats() { return stats; }