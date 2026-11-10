import { gameState } from './state.js';
import { UPGRADES_CONFIG, AGING_SLOWDOWN_RATES } from './config.js';
import { showMessage } from './ui.js';
import { renderUpgrades } from './ui.js';
import { createCrystal } from './crystals.js';

export function recalculateStats() {
    // Скорость старения
    const slowAgingLevel = gameState.upgrades.slowAging;
    gameState.ageTickRate = slowAgingLevel > 0 
        ? AGING_SLOWDOWN_RATES[slowAgingLevel - 1] 
        : 1.0;

    // Шанс двойного клика (левитация)
    gameState.doubleClickChance = gameState.upgrades.levitation * 0.05;

    // Шанс крита (рентген)
    gameState.critChance = gameState.upgrades.xrayVision * 0.05;

    // Сопротивление болезням (регенерация)
    gameState.diseaseResistance = gameState.upgrades.regeneration * 0.10;

    // Шанс доп. тренировки (телекинез)
    gameState.extraTrainingChance = gameState.upgrades.telekinesis * 0.05;
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
    
    // Специальная логика для генерации кристаллов
    if (upgradeId === 'crystals') {
        createCrystal(); // Автоматически создаем кристалл при покупке
    }
    
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