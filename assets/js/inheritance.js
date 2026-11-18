import { gameState, legacy, stats, defaultGameState, saveGame } from './state.js';
import { UPGRADES_CONFIG, INHERITANCE_CONFIG, HOUSING_CONFIG, DIFFICULTY_CONFIG } from './config.js'; // 🔑 Добавлены HOUSING_CONFIG и DIFFICULTY_CONFIG
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

// 🔑 1. Вызывается при смерти. Сохраняет бонусы в наследие и УДАЛЯЕТ старую игру.
export function finalizeRunAndSaveLegacy() {
    console.log('🧬 [finalizeRunAndSaveLegacy] Обработка наследства после смерти');
    const bonuses = calculateInheritanceBonuses();

    // Обновляем статистику
    stats.highestAgeReached = Math.max(stats.highestAgeReached, gameState.ageInYears);
    stats.totalDeaths += 1;
    stats.runsCompleted += 1;
    
    const allCrystals = [...gameState.crystals, ...gameState.crystalsInventory];
    const maxLvl = allCrystals.filter(c => c).reduce((max, c) => Math.max(max, c.level), 1);
    stats.highestCrystalLevel = Math.max(stats.highestCrystalLevel, maxLvl);

    // Добавляем бонусы в legacy
    legacy.exchangeRateBonus += bonuses.exchangeBonus;
    legacy.inheritedHousing = gameState.housing || 'box'; // 🔑 НОВОЕ: сохраняем текущее жилье в наследие
    
    if (!Array.isArray(legacy.startingCrystals)) legacy.startingCrystals = [];
    if (legacy.startingCrystalsCount > 0) {
        for (let i = 0; i < legacy.startingCrystalsCount; i++) legacy.startingCrystals.push({ level: 1, income: 1 });
        legacy.startingCrystalsCount = 0;
    }
    legacy.startingCrystals = legacy.startingCrystals.concat(bonuses.inheritanceCrystals);
    
    const abilityIds = Object.keys(UPGRADES_CONFIG);
    for (let i = 0; i < bonuses.level5AbilitiesCount; i++) {
        legacy.startingAbilities.push(abilityIds[Math.floor(Math.random() * abilityIds.length)]);
    }

    // Сохраняем только наследие и статистику
    saveLegacy(legacy);
    saveStats(stats);

    // 🔑 КЛЮЧЕВОЕ: Удаляем старое сохранение умершей игры из localStorage
    import('./storage.js').then(storage => {
        storage.clearActiveGame();
        console.log('🧬 Старая игра удалена. В меню будет только "Начать новое поколение"');
    });
}

// 🔑 2. Вызывается из главного меню. Создает чистую новую игру с бонусами.
export function startInheritedGame(difficulty = 'medium') {
    console.log('🧬 [startInheritedGame] Запуск нового поколения на сложности:', difficulty);
    
    const savedGender = gameState.gender || 'male';
    const diffConfig = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
    
    return import('./state.js').then(stateModule => {
        // Полный сброс gameState
        Object.assign(stateModule.gameState, JSON.parse(JSON.stringify(stateModule.defaultGameState)));
        
        // 🔑 Применяем НОВУЮ сложность и стартовые параметры
        stateModule.gameState.difficulty = difficulty;
        stateModule.gameState.money = diffConfig.startMoney || 0;
        stateModule.gameState.isGameOver = false;
        stateModule.gameState.gender = savedGender;
        
        // 🔑 КЛЮЧЕВОЕ: Устанавливаем возраст и иммунитет по сложности
        stateModule.gameState.ageInYears = diffConfig.startAge;
        stateModule.gameState.absoluteAgeInYears = diffConfig.startAge;
        stateModule.gameState.diseaseImmunityTicks = diffConfig.diseaseImmunityDays;
        
        // Применяем стартовые бонусы (жилье, комфорт, кристаллы)
        applyStartingBonuses();
        
        // Сохраняем новое состояние
        stateModule.saveGame();
    });
}

// 🔑 Применение стартовых бонусов (жилье, комфорт, кристаллы + способности)
function applyStartingBonuses() {
    console.log('🧬 [applyStartingBonuses] Применяем стартовые бонусы');

    // 🔑 1. ПРИМЕНЯЕМ УНАСЛЕДОВАННОЕ ЖИЛЬЁ
    const inheritedHousing = legacy.inheritedHousing || 'box';
    if (HOUSING_CONFIG[inheritedHousing]) {
        gameState.housing = inheritedHousing;
        console.log('🏠 Унаследовано жильё:', inheritedHousing);
    } else {
        gameState.housing = 'box';
    }

    // 🔑 2. ОБРЕЗАЕМ КОМФОРТ ПОД ЛИМИТ УНАСЛЕДОВАННОГО ЖИЛЬЯ
    const housingConfig = HOUSING_CONFIG[gameState.housing] || HOUSING_CONFIG.box;
    if (gameState.needs.comfort > housingConfig.maxComfort) {
        gameState.needs.comfort = housingConfig.maxComfort;
        console.log('✂️ Комфорт обрезан до максимума жилья:', housingConfig.maxComfort);
    }

    // 🔑 3. РАЗМЕЩЕНИЕ КРИСТАЛЛОВ
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

    // 🔑 4. СТАРТОВЫЕ СПОСОБНОСТИ
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