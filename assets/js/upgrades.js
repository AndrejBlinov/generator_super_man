import { gameState } from './state.js';
import { UPGRADES_CONFIG, ITEMS_CONFIG, AGING_SLOWDOWN_RATES } from './config.js';
import { showMessage, renderUpgrades } from './ui.js';
import { createCrystal } from './crystals.js';

export function recalculateStats() {
    const slowAgingLevel = gameState.upgrades.slowAging;
    gameState.ageTickRate = slowAgingLevel > 0 
        ? AGING_SLOWDOWN_RATES[slowAgingLevel - 1] 
        : 1.0;

    gameState.doubleClickChance = gameState.upgrades.levitation * 0.05;
    gameState.critChance = gameState.upgrades.xrayVision * 0.05;
    gameState.diseaseResistance = gameState.upgrades.regeneration * 0.10;
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
    
    if (upgradeId === 'crystals') {
        createCrystal();
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

// 🔑 НОВАЯ ФУНКЦИЯ: Покупка вещи
export function buyItem(itemId) {
    const config = ITEMS_CONFIG[itemId];
    
    if (gameState.evolutionPoints < config.cost) {
        showMessage("Недостаточно очков!");
        return false;
    }

    gameState.evolutionPoints -= config.cost;
    
    // Применяем эффект вещи
    if (itemId === 'money') {
        gameState.money += config.reward;
        showMessage(`Получено ${config.reward} 💰!`);
    }
    
    return true;
}