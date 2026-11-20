import { gameState, legacy, stats, saveGame, resetActiveGame } from './state.js';
import { UPGRADES_CONFIG, INHERITANCE_CONFIG, HOUSING_CONFIG} from './config.js'; // 🔑 Добавлены HOUSING_CONFIG и DIFFICULTY_CONFIG
import { saveLegacy, saveStats } from './storage.js';

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
// 🔑 1. Вызывается при смерти. Сохраняет бонусы в наследие и УДАЛЯЕТ старую игру.
export function finalizeRunAndSaveLegacy() {
    console.log('🧬 [finalizeRunAndSaveLegacy] Обработка наследства после смерти');
    const bonuses = calculateInheritanceBonuses();

    // 🔑 Статистика (смерти, поколения, рекорды) уже обновлена в handleDeath() — не дублируем!

    // Добавляем бонусы в legacy
    legacy.exchangeRateBonus += bonuses.exchangeBonus;

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

    // 🔑 НОВОЕ: Наследуем дом этого поколения
    legacy.inheritedHousing = gameState.housing || 'box';

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
export function startInheritedGame(difficulty = 'medium', forcedGender = null, tutorialEnabled = false, tutorialStep = 0) {
    console.log('🧬 [startInheritedGame] Запуск нового поколения. Сложность:', difficulty, 'Пол:', forcedGender, 'Туториал:', tutorialEnabled);
    
    const savedGender = forcedGender || gameState.gender || 'male';
    
    // 🔑 ИСПОЛЬЗУЕМ УЖЕ ГОТОВУЮ И БЕЗОПАСНУЮ ФУНКЦИЮ СБРОСА ИЗ state.js
    resetActiveGame(difficulty, savedGender, tutorialEnabled, tutorialStep);
    
    console.log('✅ [startInheritedGame] Состояние после сброса:', {
        age: gameState.ageInYears,
        immunity: gameState.diseaseImmunityTicks,
        difficulty: gameState.difficulty,
        gender: gameState.gender,
        tutorialEnabled: gameState.tutorialEnabled,
        tutorialStep: gameState.tutorialStep
    });

    // Применяем стартовые бонусы (жилье, комфорт, кристаллы, способности)
    applyStartingBonuses();

    // Сохраняем новое состояние
    saveGame();
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
// 🔑 Текст превью наследия (ОБЯЗАТЕЛЬНО НУЖЕН ДЛЯ UI)
// 🔑 Показывает ФАКТИЧЕСКОЕ накопленное наследие в виде карточек
export function getInheritancePreviewText() {
    const crystals = Array.isArray(legacy.startingCrystals) ? legacy.startingCrystals : [];
    const abilities = Array.isArray(legacy.startingAbilities) ? legacy.startingAbilities : [];
    const housingId = legacy.inheritedHousing || 'box';
    const housing = HOUSING_CONFIG[housingId] || HOUSING_CONFIG.box;
    const hasExchange = (legacy.exchangeRateBonus || 0) > 0;
    const hasHousing = housingId !== 'box';

    const cards = [];

    if (hasExchange) {
        cards.push({ icon: '💱', label: 'Курс обмена', value: `+${legacy.exchangeRateBonus}%` });
    }
    if (crystals.length > 0) {
        const list = crystals.map(c => `${c.level} ур.`).join(', ');
        cards.push({ icon: '💎', label: 'Кристаллы', value: `${crystals.length} шт. (${list})` });
    }
    if (abilities.length > 0) {
        cards.push({ icon: '🧬', label: 'Способности', value: `${abilities.length} шт.` });
    }
    if (hasHousing) {
        cards.push({ icon: '🏠', label: 'Дом', value: housing.name });
    }

    if (cards.length === 0) {
        return `<div class="legacy-empty">⚠️ Пока нет бонусов. Прогресс этого поколения сохранится в следующем!</div>`;
    }

    return `<div class="legacy-cards">` + cards.map(c => `
        <div class="legacy-card">
            <span class="legacy-card-icon">${c.icon}</span>
            <div class="legacy-card-text">
                <span class="legacy-card-label">${c.label}</span>
                <span class="legacy-card-value">${c.value}</span>
            </div>
        </div>`).join('') + `</div>`;
}