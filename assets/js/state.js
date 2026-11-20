import { GAME_VERSION, DIFFICULTY_CONFIG, HOUSING_CONFIG } from './config.js';
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
    startingAbilities: [],
    inheritedHousing: 'box'
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

    tutorialEnabled: false,
    tutorialStep: 0,

    autoExchangeAmount: 0,
    autoSpendEnabled: false,
    autoTreatEnabled: false,
    purchaseMultiplier: 1,

    needs: getDefaultNeeds(),
    activeDiseases: [],
    housing: 'box',
    gender: 'male',
    luxuryItems: [],

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

    // 🔑 НОВЫЕ ПОЛЯ ДЛЯ СИСТЕМЫ СОБЫТИЙ
    karma: 40, // Будет перезаписано сложностью при старте
    flags: [], // Массив строк: ['married', 'engaged', 'has_dog']
    scheduledEvent: null, // { eventId, triggerAtAbsoluteDay, context }
    activeEvent: null, // { eventId, variantKey, choices } (если не null, игра на паузе)
    lastEventDay: 0, // Абсолютный день последнего события (для кулдауна)
    pet: null,

    isGameOver: false,
};

// Текущее состояние игры
export let gameState = { ...defaultGameState };
export let legacy = { ...defaultLegacy };
export let stats = { ...defaultStats };

// ==========================================
// ЗАГРУЗКА ИГРЫ (вызывается при старте)
// ==========================================
export function loadFullGame() {
    // 1. Миграция со старого формата
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

    // 🔑 ЗАЩИТА ОТ ЗОМБИ: Не загружаем сохранение, если в нём персонаж уже мёртв
    if (savedActive && !savedActive.isGameOver) {
        gameState = applyMigrations({ ...defaultGameState, ...savedActive });
        return true; // Есть активное сохранение
    }

    // 5. Если нет активной игры (или персонаж мёртв) — начинаем с дефолтного состояния
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
    if (!Array.isArray(state.luxuryItems)) {
        state.luxuryItems = [];
    }
    if (state.karma === undefined) state.karma = 40;
    if (gameState.tutorialEnabled === undefined) gameState.tutorialEnabled = false;
    if (gameState.tutorialStep === undefined) gameState.tutorialStep = 0;
    if (state.doubleClickChance === undefined) state.doubleClickChance = 0.0;
    if (state.diseaseResistance === undefined) state.diseaseResistance = 0.0;
    if (state.extraTrainingChance === undefined) state.extraTrainingChance = 0.0;
    if (state.money === undefined) state.money = 0;
    if (state.purchaseMultiplier === undefined) state.purchaseMultiplier = 1;
    if (state.autoExchangeAmount === undefined) state.autoExchangeAmount = 0;
    if (state.autoSpendEnabled === undefined) state.autoSpendEnabled = false;
    if (state.autoTreatEnabled === undefined) state.autoTreatEnabled = false;
    if (state.diseaseImmunityTicks === undefined) state.diseaseImmunityTicks = 0;
    if (state.difficulty === undefined) state.difficulty = 'medium';
    if (state.housing === undefined) state.housing = 'box';
    if (state.gender === undefined) state.gender = 'male';
    if (typeof state.stats !== 'object' || state.stats === null) {
        state.stats = { totalMoneyEarnedThisRun: 0 };
    }

    return state;
}

// ==========================================
// СОХРАНЕНИЕ
// ==========================================
export function saveGame() {
    if (gameState.isGameOver) {
        clearActiveGame();
        return;
    }

    // 🔑 Принудительно обновляем timestamp перед сохранением
    gameState.lastSaveTimestamp = Date.now();

    try {
        saveActiveGame(gameState);
    } catch (e) {
        console.error("Ошибка сохранения:", e);
    }
}


// 🔑 Расчёт актуального курса обмена с учётом наследия
export function getCurrentExchangeRate() {
    const baseRate = 10; // Базовый курс
    const bonus = legacy.exchangeRateBonus || 0; // Бонус от наследия (в процентах)
    return baseRate + (baseRate * bonus / 100);
}

// ==========================================
// СБРОС
// ==========================================

// Сброс активной игры (при смерти или начале новой)
export function resetActiveGame(difficulty = 'medium', gender = 'male') {
    const diffConfig = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;

    console.log(`🔄 [resetActiveGame] Сброс: ${difficulty}, возраст: ${diffConfig.startAge}, деньги: ${diffConfig.startMoney}`);

    gameState = {
        ...defaultGameState,
        needs: getDefaultNeeds(),
        difficulty: difficulty,
        ageInYears: diffConfig.startAge,
        absoluteAgeInYears: diffConfig.startAge,
        gender: gender,
        diseaseImmunityTicks: diffConfig.diseaseImmunityDays,
        karma: diffConfig.startKarma || 40,
        money: diffConfig.startMoney || 0,
        housing: 'box',
        lastSaveTimestamp: Date.now()
    };

    // 🔑 Обрезаем комфорт под лимит жилья (коробка = 20)
    const housing = HOUSING_CONFIG[gameState.housing] || HOUSING_CONFIG.box;
    if (gameState.needs.comfort > housing.maxComfort) {
        gameState.needs.comfort = housing.maxComfort;
    }

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

export function handleDeath() {

    // Обновляем статистику
    stats.highestAgeReached = Math.max(stats.highestAgeReached, gameState.ageInYears);
    stats.totalMoneyEarnedAllTime += (gameState.stats?.totalMoneyEarnedThisRun || 0);

    const allCrystals = [...gameState.crystals, ...gameState.crystalsInventory];
    const maxLvl = allCrystals.filter(c => c).reduce((max, c) => Math.max(max, c.level), 1);
    stats.highestCrystalLevel = Math.max(stats.highestCrystalLevel, maxLvl);

    // Сохраняем статистику
    saveStats(stats);

    // 🔑 Помечаем игру как мёртвую
    gameState.isGameOver = true;

    // Удаляем активную игру
    clearActiveGame();
    console.log('💀 [handleDeath] Активное сохранение удалено');
}

// Получатели
export function getGameState() { return gameState; }
export function getLegacy() { return legacy; }
export function getStats() { return stats; }
// © 2024–2026 Андрей Блинов. Все права защищены (All rights reserved).