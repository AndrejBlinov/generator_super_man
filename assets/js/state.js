// Управление состоянием игры

import { GAME_VERSION } from './config.js';

export const defaultGameState = {
    evolutionPoints: 0,
    totalPointsEarned: 0,
    ageInYears: 30,
    daysInYear: 365,
    currentDayInYear: 0,
    maxAgeInYears: 100,
    lastSaveTimestamp: Date.now(),
    clickPower: 1,
    ageTickRate: 1.0,
    critChance: 0.0,
    critMultiplier: 5,
    crystals: [null, null, null, null, null],
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
    gameState = { ...gameState, ...newState };
}

export function getGameState() {
    return gameState;
}

export function resetGameState() {
    gameState = { ...defaultGameState, lastSaveTimestamp: Date.now() };
}