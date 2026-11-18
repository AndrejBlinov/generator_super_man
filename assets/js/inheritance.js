import { gameState, legacy, stats, defaultGameState, saveGame } from './state.js';
import { UPGRADES_CONFIG, INHERITANCE_CONFIG } from './config.js';
import { saveLegacy, saveStats, clearActiveGame } from './storage.js';

// 🔑 Расчет бонусов текущего прохождения
export function calculateInheritanceBonuses() {
    const moneySpent = Math.max(0, (gameState.stats?.totalMoneyEarnedThisRun || 0) - gameState.money);
    const exchangeBonusSteps = Math.floor(moneySpent / INHERITANCE_CONFIG.moneySpentPerBonus);
    const exchangeBonus = exchangeBonusSteps * INHERITANCE_CONFIG.exchangeRateBonusPerStep;

    const allCrystals = [...gameState.crystals, ...gameState.crystalsInventory];
    const inheritanceCrystals = allCrystals
        .filter(c => c && typeof c.level === 'number' && c.level >= INHERITANCE_CONFIG.crystalLevelForBonus)
        .map(c => {
            const newLevel = c.level - 4;
            const income = Math.pow(2, newLevel - 1);
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

    return { exchangeBonus, inheritanceCrystals, level5AbilitiesCount, moneySpent };
}

// 🔑 Применение наследия (ПОЛНЫЙ СБРОС + БОНУСЫ)
export function applyInheritance() {
    console.log('🧬 [applyInheritance] Начало наследования');
    
    const bonuses = calculateInheritanceBonuses();
    const currentDifficulty = gameState.difficulty || 'medium';

    // 1. Обновляем глобальную статистику
    stats.highestAgeReached = Math.max(stats.highestAgeReached, gameState.ageInYears);
    stats.totalDeaths += 1;
    stats.runsCompleted += 1;
    
    const allCrystals = [...gameState.crystals, ...gameState.crystalsInventory];
    const maxLvl = allCrystals.filter(c => c).reduce((max, c) => Math.max(max, c.level), 1);
    stats.highestCrystalLevel = Math.max(stats.highestCrystalLevel, maxLvl);

    // 2. Применяем бонусы к объекту наследия
    legacy.exchangeRateBonus += bonuses.exchangeBonus;
    
    if (!Array.isArray(legacy.startingCrystals)) {
        legacy.startingCrystals = [];
    }
    if (legacy.startingCrystalsCount > 0) {
        for (let i = 0; i < legacy.startingCrystalsCount; i++) {
            legacy.startingCrystals.push({ level: 1, income: 1 });
        }
        legacy.startingCrystalsCount = 0;
    }
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

    // 4. 🔑 ЖЁСТКОЕ УДАЛЕНИЕ старого сохранения из localStorage
    clearActiveGame();
    console.log('🧬 [applyInheritance] Старое активное сохранение удалено из хранилища');

    // 5. 🔑 ПОЛНЫЙ СБРОС gameState в памяти (Глубокая копия, чтобы не осталось старых ссылок на массивы!)
    Object.assign(gameState, JSON.parse(JSON.stringify(defaultGameState)));
    gameState.difficulty = currentDifficulty;
    gameState.isGameOver = false;
    
    console.log('🧬 [applyInheritance] gameState полностью сброшен до дефолтного');

    // 6. Применяем стартовые бонусы к ЧИСТОМУ gameState
    applyStartingBonuses();

    // 7. Сохраняем НОВОЕ, чистое состояние с бонусами
    saveGame();
    console.log('🧬 [applyInheritance] Новое состояние сохранено и готово к запуску');
}

// 🔑 Применение стартовых бонусов
function applyStartingBonuses() {
    console.log('🧬 [applyStartingBonuses] Применяем стартовые бонусы');
    console.log('🧬 Кристаллы для размещения:', legacy.startingCrystals);

    const crystalsToPlace = [...(legacy.startingCrystals || [])];
    let placed = 0;
    
    for (const crystal of crystalsToPlace) {
        const emptyActive = gameState.crystals.findIndex(c => c === null);
        const emptyInv = gameState.crystalsInventory.findIndex(c => c === null);
        
        if (emptyActive !== -1) {
            gameState.crystals[emptyActive] = { level: crystal.level, income: crystal.income };
            placed++;
        } else if (emptyInv !== -1) {
            gameState.crystalsInventory[emptyInv] = { level: crystal.level, income: crystal.income };
            placed++;
        } else {
            console.warn('⚠️ Нет свободных слотов для кристалла', crystal);
            break;
        }
    }
    
    console.log(`🧬 Размещено ${placed}/${crystalsToPlace.length} кристаллов`);
    
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

// 🔑 Текст превью наследия (ОБЯЗАТЕЛЬНО НУЖЕН ДЛЯ UI)
export function getInheritancePreviewText() {
    const bonuses = calculateInheritanceBonuses();
    let text = `<p>Вы собираетесь начать новое поколение. Текущий прогресс будет сброшен, но вы получите:</p><ul>`;
    
    if (bonuses.exchangeBonus > 0) {
        text += `<li>💱 <strong>+${bonuses.exchangeBonus}%</strong> к курсу обмена (всего: +${legacy.exchangeRateBonus + bonuses.exchangeBonus}%)</li>`;
    } else {
        text += `<li>💱 Потрачено ${bonuses.moneySpent} 💰 (нужно ${INHERITANCE_CONFIG.moneySpentPerBonus} для бонуса)</li>`;
    }

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