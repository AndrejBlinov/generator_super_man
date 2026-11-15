import { gameState, legacy, stats, defaultLegacy, resetActiveGame, saveGame } from './state.js';
import { UPGRADES_CONFIG, INHERITANCE_CONFIG } from './config.js';
import { getDefaultNeeds } from './needs/index.js';
import { saveLegacy, saveStats, clearActiveGame } from './storage.js';

// 🔑 Расчет бонусов текущего прохождения
export function calculateInheritanceBonuses() {
    const moneySpent = Math.max(0, (gameState.stats?.totalMoneyEarnedThisRun || 0) - gameState.money);
    const exchangeBonusSteps = Math.floor(moneySpent / INHERITANCE_CONFIG.moneySpentPerBonus);
    const exchangeBonus = exchangeBonusSteps * INHERITANCE_CONFIG.exchangeRateBonusPerStep;

    // 🔑 НОВАЯ ЛОГИКА: собираем кристаллы 5+ уровня с их уровнями наследия
    const allCrystals = [...gameState.crystals, ...gameState.crystalsInventory];
    const inheritanceCrystals = allCrystals
        .filter(c => c && typeof c.level === 'number' && c.level >= INHERITANCE_CONFIG.crystalLevelForBonus)
        .map(c => {
            // Формула: уровень наследия = уровень кристалла - 4
            // Кристалл 5 ур. → 1 ур., 6 ур. → 2 ур., 8 ур. → 4 ур., 9 ур. → 5 ур.
            const newLevel = c.level - 4;
            const income = Math.pow(2, newLevel - 1); // 1, 2, 4, 8, 16...
            return { level: newLevel, income: income };
        });

    const level5AbilitiesCount = Object.entries(gameState.upgrades)
        .filter(([id, level]) => typeof level === 'number' && level >= INHERITANCE_CONFIG.abilityLevelForBonus)
        .length;

    console.log('🧬 [calculateInheritanceBonuses]', {
        moneySpent,
        exchangeBonus,
        inheritanceCrystals,
        level5AbilitiesCount
    });

    return {
        exchangeBonus,
        inheritanceCrystals, // 🔑 Теперь массив объектов, а не просто число
        level5AbilitiesCount,
        moneySpent
    };
}

// 🔑 Применение наследия
export function applyInheritance() {
    console.log('🧬 [applyInheritance] Начало наследования');
    
    const bonuses = calculateInheritanceBonuses();
    const currentDifficulty = gameState.difficulty || 'medium';

    // 1. Обновляем статистику
    stats.highestAgeReached = Math.max(stats.highestAgeReached, gameState.ageInYears);
    stats.totalDeaths += 1;
    stats.runsCompleted += 1;
    
    const allCrystals = [...gameState.crystals, ...gameState.crystalsInventory];
    const maxLvl = allCrystals.filter(c => c).reduce((max, c) => Math.max(max, c.level), 1);
    stats.highestCrystalLevel = Math.max(stats.highestCrystalLevel, maxLvl);

    // 2. Применяем бонусы к наследию
    legacy.exchangeRateBonus += bonuses.exchangeBonus;
    
    // 🔑 Добавляем кристаллы в массив (суммируем с существующими)
    if (!Array.isArray(legacy.startingCrystals)) {
        legacy.startingCrystals = [];
    }
    // Миграция со старого формата: если есть startingCrystalsCount, конвертируем
    if (legacy.startingCrystalsCount > 0) {
        for (let i = 0; i < legacy.startingCrystalsCount; i++) {
            legacy.startingCrystals.push({ level: 1, income: 1 });
        }
        legacy.startingCrystalsCount = 0;
    }
    // Добавляем новые кристаллы
    legacy.startingCrystals = legacy.startingCrystals.concat(bonuses.inheritanceCrystals);
    
    const abilityIds = Object.keys(UPGRADES_CONFIG);
    for (let i = 0; i < bonuses.level5AbilitiesCount; i++) {
        const randomId = abilityIds[Math.floor(Math.random() * abilityIds.length)];
        legacy.startingAbilities.push(randomId);
    }

    console.log('🧬 [applyInheritance] Обновлённое наследие:', legacy);

    // 3. Сохраняем наследие и статистику
    saveLegacy(legacy);
    saveStats(stats);

    // 4. Удаляем старое активное сохранение
    clearActiveGame();

    // 5. Сбрасываем активную игру
    resetActiveGame(currentDifficulty);

    // 6. Применяем стартовые бонусы
    applyStartingBonuses();
    
    // 7. Сохраняем новое состояние с бонусами
    saveGame();
    console.log('🧬 [applyInheritance] Завершено. Новое состояние:', {
        age: gameState.ageInYears,
        crystals: gameState.crystals.filter(c => c),
        inventory: gameState.crystalsInventory.filter(c => c),
        exchangeBonus: legacy.exchangeRateBonus
    });
}

// 🔑 Применение стартовых бонусов (кристаллы + способности)
function applyStartingBonuses() {
    console.log('🧬 [applyStartingBonuses] Применяем стартовые бонусы');
    console.log('🧬 Кристаллы для размещения:', legacy.startingCrystals);

    // Размещаем кристаллы по одному
    const crystalsToPlace = [...(legacy.startingCrystals || [])];
    let placed = 0;
    
    for (const crystal of crystalsToPlace) {
        const emptyActive = gameState.crystals.findIndex(c => c === null);
        const emptyInv = gameState.crystalsInventory.findIndex(c => c === null);
        
        if (emptyActive !== -1) {
            gameState.crystals[emptyActive] = { 
                level: crystal.level, 
                income: crystal.income 
            };
            placed++;
        } else if (emptyInv !== -1) {
            gameState.crystalsInventory[emptyInv] = { 
                level: crystal.level, 
                income: crystal.income 
            };
            placed++;
        } else {
            console.warn('⚠️ Нет свободных слотов для кристалла', crystal);
            break;
        }
    }
    
    console.log(`🧬 Размещено ${placed}/${crystalsToPlace.length} кристаллов`);
    console.log('🧬 Активные слоты:', gameState.crystals);
    console.log('🧬 Инвентарь:', gameState.crystalsInventory);
    
    // Очищаем список после применения
    legacy.startingCrystals = [];

    // Стартовые способности
    legacy.startingAbilities.forEach(abilityId => {
        if (gameState.upgrades[abilityId] !== undefined) {
            gameState.upgrades[abilityId] += 1;
        }
    });
    legacy.startingAbilities = [];
    
    saveLegacy(legacy);
}

// 🔑 Текст превью наследия
export function getInheritancePreviewText() {
    const bonuses = calculateInheritanceBonuses();
    let text = `<p>Вы собираетесь начать новое поколение. Текущий прогресс будет сброшен, но вы получите:</p><ul>`;
    
    if (bonuses.exchangeBonus > 0) {
        text += `<li>💱 <strong>+${bonuses.exchangeBonus}%</strong> к курсу обмена (всего: +${legacy.exchangeRateBonus + bonuses.exchangeBonus}%)</li>`;
    } else {
        text += `<li>💱 Потрачено ${bonuses.moneySpent} 💰 (нужно ${INHERITANCE_CONFIG.moneySpentPerBonus} для бонуса)</li>`;
    }

    // 🔑 Показываем конкретные кристаллы
    if (bonuses.inheritanceCrystals.length > 0) {
        const crystalList = bonuses.inheritanceCrystals
            .map(c => `кристалл ${c.level} ур. (+${c.income} ОЭ/день)`)
            .join(', ');
        text += `<li>💎 <strong>${bonuses.inheritanceCrystals.length}</strong> кристалл(ов): ${crystalList}</li>`;
    } else {
        text += `<li>💎 Нет кристаллов 5+ уровня для наследия</li>`;
    }

    if (bonuses.level5AbilitiesCount > 0) {
        text += `<li>🧬 <strong>${bonuses.level5AbilitiesCount}</strong> случайная(ых) способность(ей) 1-го уровня</li>`;
    }

    if (bonuses.exchangeBonus === 0 && bonuses.inheritanceCrystals.length === 0 && bonuses.level5AbilitiesCount === 0) {
        text += `<li>⚠️ <em>Пока нет бонусов. Накопите больше ресурсов!</em></li>`;
    }

    text += `</ul>`;
    text += `<p><strong>Статистика:</strong> Поколений: ${stats.runsCompleted + 1}, Смертей: ${stats.totalDeaths}</p>`;
    
    return text;
}