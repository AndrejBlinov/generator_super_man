import { gameState, legacy, stats, defaultLegacy, resetActiveGame, saveGame } from './state.js';
import { UPGRADES_CONFIG, INHERITANCE_CONFIG } from './config.js';
import { getDefaultNeeds } from './needs/index.js';
import { saveLegacy, saveStats, clearActiveGame } from './storage.js';

// Расчет бонусов текущего прохождения
export function calculateInheritanceBonuses() {
    const moneySpent = Math.max(0, (gameState.stats?.totalMoneyEarnedThisRun || 0) - gameState.money);
    const exchangeBonusSteps = Math.floor(moneySpent / INHERITANCE_CONFIG.moneySpentPerBonus);
    const exchangeBonus = exchangeBonusSteps * INHERITANCE_CONFIG.exchangeRateBonusPerStep;

    const allCrystals = [...gameState.crystals, ...gameState.crystalsInventory];
    const level5Crystals = allCrystals.filter(c => c && c.level >= INHERITANCE_CONFIG.crystalLevelForBonus).length;

    const level5AbilitiesCount = Object.entries(gameState.upgrades)
        .filter(([id, level]) => level >= INHERITANCE_CONFIG.abilityLevelForBonus).length;

    return {
        exchangeBonus,
        level5Crystals,
        level5AbilitiesCount,
        moneySpent
    };
}

// Применение наследия (вызывается при нажатии "Наследовать")
export function applyInheritance() {
    console.log('🧬 [applyInheritance] Начало наследования');
    console.log('🧬 [applyInheritance] Текущая сложность:', gameState.difficulty);
    
    const bonuses = calculateInheritanceBonuses();
    const currentDifficulty = gameState.difficulty || 'medium';

    // Обновляем статистику
    stats.highestAgeReached = Math.max(stats.highestAgeReached, gameState.ageInYears);
    stats.totalDeaths += 1;
    stats.runsCompleted += 1;
    
    const allCrystals = [...gameState.crystals, ...gameState.crystalsInventory];
    const maxLvl = allCrystals.filter(c => c).reduce((max, c) => Math.max(max, c.level), 1);
    stats.highestCrystalLevel = Math.max(stats.highestCrystalLevel, maxLvl);

    // Применяем бонусы к наследию
    legacy.exchangeRateBonus += bonuses.exchangeBonus;
    legacy.startingCrystalsCount += bonuses.level5Crystals;
    
    const abilityIds = Object.keys(UPGRADES_CONFIG);
    for (let i = 0; i < bonuses.level5AbilitiesCount; i++) {
        const randomId = abilityIds[Math.floor(Math.random() * abilityIds.length)];
        legacy.startingAbilities.push(randomId);
    }

    // 🔑 Сохраняем наследие и статистику ОТДЕЛЬНО
    saveLegacy(legacy);
    saveStats(stats);

    // 🔑 🔑 🔑 КРИТИЧЕСКИ ВАЖНО: удаляем старое активное сохранение
    clearActiveGame();
    console.log('🧬 [applyInheritance] Старое активное сохранение удалено');

    // 🔑 Сбрасываем активную игру с той же сложностью
    resetActiveGame(currentDifficulty);
    console.log('🧬 [applyInheritance] gameState сброшен. Новая сложность:', gameState.difficulty, 'Возраст:', gameState.ageInYears);

    // Применяем стартовые бонусы
    applyStartingBonuses();
    
    // 🔑 🔑 🔑 КРИТИЧЕСКИ ВАЖНО: сохраняем новое состояние в localStorage
    saveGame();
    console.log('🧬 [applyInheritance] Новое состояние сохранено в localStorage');
}

function applyStartingBonuses() {
    // Стартовые кристаллы
    for (let i = 0; i < legacy.startingCrystalsCount; i++) {
        const emptyActive = gameState.crystals.findIndex(c => c === null);
        const emptyInv = gameState.crystalsInventory.findIndex(c => c === null);
        
        if (emptyActive !== -1) {
            gameState.crystals[emptyActive] = { level: 1, income: 1 };
        } else if (emptyInv !== -1) {
            gameState.crystalsInventory[emptyInv] = { level: 1, income: 1 };
        }
    }
    legacy.startingCrystalsCount = 0;

    // Стартовые способности
    legacy.startingAbilities.forEach(abilityId => {
        if (gameState.upgrades[abilityId] !== undefined) {
            gameState.upgrades[abilityId] += 1;
        }
    });
    legacy.startingAbilities = [];
    
    saveLegacy(legacy);
}

// Получение текста для модального окна
export function getInheritancePreviewText() {
    const bonuses = calculateInheritanceBonuses();
    let text = `<p>Вы собираетесь начать новое поколение. Текущий прогресс будет сброшен, но вы получите:</p><ul>`;
    
    if (bonuses.exchangeBonus > 0) {
        text += `<li>💱 <strong>+${bonuses.exchangeBonus}%</strong> к курсу обмена (всего: +${legacy.exchangeRateBonus + bonuses.exchangeBonus}%)</li>`;
    } else {
        text += `<li>💱 Потрачено ${bonuses.moneySpent} 💰 (нужно ${INHERITANCE_CONFIG.moneySpentPerBonus} для бонуса)</li>`;
    }

    if (bonuses.level5Crystals > 0) {
        text += `<li>💎 <strong>${bonuses.level5Crystals}</strong> кристалл(ов) 1-го уровня на старте</li>`;
    }

    if (bonuses.level5AbilitiesCount > 0) {
        text += `<li>🧬 <strong>${bonuses.level5AbilitiesCount}</strong> случайная(ых) способность(ей) 1-го уровня</li>`;
    }

    if (bonuses.exchangeBonus === 0 && bonuses.level5Crystals === 0 && bonuses.level5AbilitiesCount === 0) {
        text += `<li>⚠️ <em>Пока нет бонусов. Накопите больше ресурсов!</em></li>`;
    }

    text += `</ul>`;
    text += `<p><strong>Статистика:</strong> Поколений: ${stats.runsCompleted + 1}, Смертей: ${stats.totalDeaths}</p>`;
    
    return text;
}