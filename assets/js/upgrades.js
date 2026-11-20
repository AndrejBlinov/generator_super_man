import { gameState, legacy, getCurrentExchangeRate } from './state.js';
import { UPGRADES_CONFIG, ITEMS_CONFIG, AGING_SLOWDOWN_RATES } from './config.js';
import { showMessage } from './ui.js';
import { renderUpgrades } from './ui.js';
import { createCrystalBulk } from './crystals.js';

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

// 🔑 Расчёт стоимости массовой покупки способности (геометрическая прогрессия)
export function calculateBulkCost(upgradeId, count) {
    const config = UPGRADES_CONFIG[upgradeId];
    const currentLevel = gameState.upgrades[upgradeId];
    const remainingToMax = config.maxLevel - currentLevel;
    const actualCount = Math.min(count, remainingToMax);
    
    if (actualCount <= 0) return 0;
    
    // Сумма: baseCost * 2^currentLevel + baseCost * 2^(currentLevel+1) + ... 
    // = baseCost * 2^currentLevel * (2^actualCount - 1)
    const totalCost = config.baseCost * Math.pow(2, currentLevel) * (Math.pow(2, actualCount) - 1);
    return Math.round(totalCost);
}

// 🔑 Максимальное количество уровней, которое можно купить
export function getMaxAffordableCount(upgradeId) {
    const config = UPGRADES_CONFIG[upgradeId];
    const currentLevel = gameState.upgrades[upgradeId];
    const remainingToMax = config.maxLevel - currentLevel;
    
    if (remainingToMax <= 0) return 0;
    
    const points = gameState.evolutionPoints;
    const baseCostAtCurrent = config.baseCost * Math.pow(2, currentLevel);
    
    // baseCostAtCurrent * (2^count - 1) <= points
    const maxCount = Math.floor(Math.log2(points / baseCostAtCurrent + 1));
    
    return Math.min(maxCount, remainingToMax);
}

// 🔑 Массовая покупка способности
export function buyUpgradeBulk(upgradeId, count) {
    const config = UPGRADES_CONFIG[upgradeId];
    const currentLevel = gameState.upgrades[upgradeId];
    const remainingToMax = config.maxLevel - currentLevel;
    const actualCount = Math.min(count, remainingToMax);
    
    if (actualCount <= 0) {
        showMessage("Достигнут максимальный уровень!");
        return false;
    }
    
    const cost = calculateBulkCost(upgradeId, actualCount);
    
    if (gameState.evolutionPoints < cost) {
        showMessage("Недостаточно очков!");
        return false;
    }
    
    gameState.evolutionPoints -= cost;
    gameState.upgrades[upgradeId] += actualCount;
    
    if (upgradeId === 'crystals') {
        createCrystalBulk(actualCount);
    }
    
    recalculateStats();
    renderUpgrades();
    showMessage(`${config.name} улучшено на ${actualCount} ур.!`);
    return true;
}

export function calculateUpgradeCost(upgradeId) {
    const config = UPGRADES_CONFIG[upgradeId];
    const currentLevel = gameState.upgrades[upgradeId];
    return Math.round(config.baseCost * Math.pow(2, currentLevel));
}

// 🔑 Массовая покупка вещи

export function buyItemBulk(itemId, count) {
    const config = ITEMS_CONFIG[itemId];
    if (!config) return false;
    
    const totalCost = config.cost * count;
    
    // Для предметов роскоши проверяем деньги, для остального — ОЭ
    if (config.karmaBonus || config.comfortBonus || config.healthBonus) {
        if (gameState.money < totalCost) {
            showMessage("❌ Недостаточно денег!");
            return false;
        }
    } else {
        if (gameState.evolutionPoints < totalCost) {
            showMessage("❌ Недостаточно очков!");
            return false;
        }
    }
    
    // Списываем ресурсы
    if (config.karmaBonus || config.comfortBonus || config.healthBonus) {
        gameState.money -= totalCost;
    } else {
        gameState.evolutionPoints -= totalCost;
    }
    
    const currentRate = getCurrentExchangeRate();
    const amountToExchange = count;
    const totalReward = Math.floor(currentRate * amountToExchange);

    // Обмен на деньги
    if (itemId === 'money_exchange' || config.name === 'Обмен на деньги') {
        gameState.money += totalReward;
        if (!gameState.stats) gameState.stats = { totalMoneyEarnedThisRun: 0 };
        gameState.stats.totalMoneyEarnedThisRun += totalReward;
        showMessage(`💰 Получено ${totalReward} денег за ${count} ОЭ`);
    }
    // 🔑 НОВОЕ: Предметы роскоши
    else if (config.karmaBonus || config.comfortBonus || config.healthBonus) {
        // Проверяем, не куплен ли уже этот предмет
        if (gameState.luxuryItems.includes(itemId)) {
            showMessage("⚠️ Этот предмет уже куплен!");
            gameState.money += totalCost; // Возвращаем деньги
            return false;
        }
        
        // Добавляем предмет
        gameState.luxuryItems.push(itemId);
        
        // Применяем бонусы
        if (config.karmaBonus) {
            gameState.karma = Math.min(100, gameState.karma + config.karmaBonus);
        }
        if (config.comfortBonus) {
            gameState.needs.comfort = Math.min(100, gameState.needs.comfort + config.comfortBonus);
        }
        if (config.healthBonus) {
            // Увеличиваем максимальное здоровье (храним в отдельном поле)
            if (!gameState.maxHealthBonus) gameState.maxHealthBonus = 0;
            gameState.maxHealthBonus += config.healthBonus;
        }
        
        showMessage(`✨ Куплено: ${config.name}!`);
    }
    
    return true;
}

// 🔑 Максимальное количество вещей, которое можно купить
export function getMaxAffordableItemCount(itemId) {
    const config = ITEMS_CONFIG[itemId];
    
    // Для предметов роскоши — только 1 штука и проверяем деньги
    if (config.karmaBonus || config.comfortBonus || config.healthBonus) {
        if (gameState.luxuryItems.includes(itemId)) {
            return 0; // Уже куплен
        }
        return Math.floor(gameState.money / config.cost);
    }
    
    // Для остального — проверяем ОЭ
    return Math.floor(gameState.evolutionPoints / config.cost);
}
// © 2024–2026 Андрей Блинов. Все права защищены (All rights reserved).