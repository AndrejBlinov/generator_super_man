import { gameState } from './state.js';
import { UPGRADES_CONFIG, INHERITANCE_CONFIG } from './config.js';
import { getDefaultNeeds } from './needs/index.js';
import { saveGame } from './storage.js';

// Расчет бонусов текущего прохождения
export function calculateInheritanceBonuses() {
    // 1. Бонус курса обмена (считаем потраченные деньги)
    const moneySpent = Math.max(0, gameState.stats.totalMoneyEarnedThisRun - gameState.money);
    const exchangeBonusSteps = Math.floor(moneySpent / INHERITANCE_CONFIG.moneySpentPerBonus);
    const exchangeBonus = exchangeBonusSteps * INHERITANCE_CONFIG.exchangeRateBonusPerStep;

    // 2. Бонус кристаллов (считаем все кристаллы >= 5 уровня во всех слотах)
    const allCrystals = [...gameState.crystals, ...gameState.crystalsInventory];
    const level5Crystals = allCrystals.filter(c => c && c.level >= INHERITANCE_CONFIG.crystalLevelForBonus).length;

    // 3. Бонус способностей (считаем способности >= 5 уровня)
    const level5AbilitiesCount = Object.entries(gameState.upgrades)
        .filter(([id, level]) => level >= INHERITANCE_CONFIG.abilityLevelForBonus).length;

    return {
        exchangeBonus,
        level5Crystals,
        level5AbilitiesCount,
        moneySpent
    };
}

// Применение наследия к новой игре (без перезаписи переменной gameState!)
export function applyInheritance(isAfterDeath = false) {
    const bonuses = calculateInheritanceBonuses();

    // 1. Обновляем статистику перед сбросом
    gameState.stats.highestAgeReached = Math.max(gameState.stats.highestAgeReached, gameState.ageInYears);
    
    const allCrystals = [...gameState.crystals, ...gameState.crystalsInventory];
    const maxLvl = allCrystals.filter(c => c).reduce((max, c) => Math.max(max, c.level), 1);
    gameState.stats.highestCrystalLevel = Math.max(gameState.stats.highestCrystalLevel, maxLvl);

    if (isAfterDeath) {
        gameState.stats.totalDeaths += 1;
    }
    gameState.stats.runsCompleted += 1;

    // 2. Применяем бонусы к объекту legacy
    gameState.legacy.exchangeRateBonus += bonuses.exchangeBonus;
    gameState.legacy.startingCrystalsCount += bonuses.level5Crystals;
    
    const abilityIds = Object.keys(UPGRADES_CONFIG);
    for (let i = 0; i < bonuses.level5AbilitiesCount; i++) {
        const randomId = abilityIds[Math.floor(Math.random() * abilityIds.length)];
        gameState.legacy.startingAbilities.push(randomId);
    }

    // 3. Сбрасываем игровое состояние, изменяя свойства существующего объекта (это безопасно!)
    gameState.evolutionPoints = 0;
    gameState.totalPointsEarned = 0;
    gameState.money = 0;
    gameState.autoExchangeAmount = 0;
    gameState.autoSpendEnabled = true;
    gameState.autoTreatEnabled = false;
    gameState.purchaseMultiplier = 1;
    gameState.needs = getDefaultNeeds();
    gameState.activeDiseases = [];
    gameState.ageInYears = 30;
    gameState.currentDayInYear = 0;
    gameState.absoluteAgeInYears = 30;
    gameState.absoluteCurrentDayInYear = 0;
    gameState.clickPower = 1;
    gameState.ageTickRate = 1.0;
    gameState.doubleClickChance = 0.0;
    gameState.critChance = 0.0;
    gameState.critMultiplier = 2;
    gameState.diseaseResistance = 0.0;
    gameState.extraTrainingChance = 0.0;
    gameState.crystals = [null, null, null, null, null];
    gameState.crystalsInventory = [null, null, null, null, null, null, null, null, null, null];
    gameState.upgrades = { 
        slowAging: 0, crystals: 0, levitation: 0, xrayVision: 0, regeneration: 0, telekinesis: 0 
    };
    gameState.isGameOver = false;

    // 4. Применяем стартовые бонусы к новому состоянию
    applyStartingBonuses();

    // 5. Мгновенно сохраняем новое состояние
    saveGame();
}

function applyStartingBonuses() {
    // 1. Стартовые кристаллы
    for (let i = 0; i < gameState.legacy.startingCrystalsCount; i++) {
        const emptyActive = gameState.crystals.findIndex(c => c === null);
        const emptyInv = gameState.crystalsInventory.findIndex(c => c === null);
        
        if (emptyActive !== -1) {
            gameState.crystals[emptyActive] = { level: 1, income: 1 };
        } else if (emptyInv !== -1) {
            gameState.crystalsInventory[emptyInv] = { level: 1, income: 1 };
        }
    }
    // Очищаем счетчик, чтобы не применять повторно
    gameState.legacy.startingCrystalsCount = 0;

    // 2. Стартовые способности
    gameState.legacy.startingAbilities.forEach(abilityId => {
        if (gameState.upgrades[abilityId] !== undefined) {
            gameState.upgrades[abilityId] += 1;
        }
    });
    // Очищаем массив
    gameState.legacy.startingAbilities = [];
}

// Получение текста для модального окна
export function getInheritancePreviewText() {
    const bonuses = calculateInheritanceBonuses();
    let text = `<p>Вы собираетесь начать новое поколение. Весь текущий прогресс будет сброшен, но вы получите:</p><ul>`;
    
    if (bonuses.exchangeBonus > 0) {
        text += `<li>💱 <strong>+${bonuses.exchangeBonus}%</strong> к курсу обмена ОЭ → 💰 (всего: +${gameState.legacy.exchangeRateBonus + bonuses.exchangeBonus}%)</li>`;
    } else {
        text += `<li>💱 Курс обмена: потрачено ${bonuses.moneySpent} 💰 (нужно ${INHERITANCE_CONFIG.moneySpentPerBonus} для бонуса)</li>`;
    }

    if (bonuses.level5Crystals > 0) {
        text += `<li>💎 <strong>${bonuses.level5Crystals}</strong> кристалл(ов) 1-го уровня на старте</li>`;
    }

    if (bonuses.level5AbilitiesCount > 0) {
        text += `<li>🧬 <strong>${bonuses.level5AbilitiesCount}</strong> случайная(ых) способность(ей) 1-го уровня на старте</li>`;
    }

    if (bonuses.exchangeBonus === 0 && bonuses.level5Crystals === 0 && bonuses.level5AbilitiesCount === 0) {
        text += `<li>⚠️ <em>Пока нет бонусов. Накопите больше ресурсов перед наследием!</em></li>`;
    }

    text += `</ul><p><strong>Статистика:</strong> Поколений: ${gameState.stats.runsCompleted + 1}, Смертей: ${gameState.stats.totalDeaths}</p>`;
    
    return text;
}