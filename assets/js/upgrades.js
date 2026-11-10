// Логика магазина улучшений

import { gameState } from './state.js';
import { UPGRADES_CONFIG, AGING_SLOWDOWN_RATES } from './config.js';
import { showMessage } from './ui.js';
import { renderUpgrades } from './ui.js';

export function recalculateStats() {
    // Сила клика (базовая + бонус от левитации)
    const levitationBonus = gameState.upgrades.levitation * 0.10;
    gameState.clickPower = 1 * (1 + levitationBonus);

    // Скорость старения
    const slowAgingLevel = gameState.upgrades.slowAging;
    gameState.ageTickRate = slowAgingLevel > 0 
        ? AGING_SLOWDOWN_RATES[slowAgingLevel - 1] 
        : 1.0;

    // Шанс крита
    gameState.critChance = gameState.upgrades.xrayVision * 0.02;
}

export function buyUpgrade(upgradeId) {
    const config = UPGRADES_CONFIG[upgradeId];
    const currentLevel = gameState.upgrades[upgradeId];

    if (currentLevel >= config.maxLevel) {
        showMessage("Максимальный уровень!");
        return false;
    }

    const cost = calculateUpgradeCost(upgradeId);

    if (gameState.evolutionPoints < cost) {
        showMessage("Недостаточно очков!");
        return false;
    }

    gameState.evolutionPoints -= cost;
    gameState.upgrades[upgradeId]++;
    recalculateStats();
    renderUpgrades();
    showMessage(`${config.name} улучшено!`);
    return true;
}

export function calculateUpgradeCost(upgradeId) {
    const config = UPGRADES_CONFIG[upgradeId];
    const currentLevel = gameState.upgrades[upgradeId];
    return Math.round(config.baseCost * Math.pow(2, currentLevel));
}