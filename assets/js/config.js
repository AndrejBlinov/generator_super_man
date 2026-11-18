// Таблица замедления старения (10% за уровень)
export const AGING_SLOWDOWN_RATES = [0.90, 0.80, 0.70, 0.60, 0.50, 0.40, 0.30, 0.20, 0.10, 0.05];

export const UPGRADES_CONFIG = {
    slowAging: {
        name: "Замедление старения",
        desc: "Уменьшает скорость старения на 10% за уровень",
        baseCost: 100,
        maxLevel: 10,
        effect: (level) => `Скорость старения: ${Math.round(AGING_SLOWDOWN_RATES[level - 1] * 100)}% от нормы`,
        finalBuff: (maxLevel) => `Финальный бафф (ур. ${maxLevel}): Старение замедлено на 95%`
    },
    levitation: {
        name: "Левитация",
        desc: "5% шанс двойного клика за уровень",
        baseCost: 500,
        maxLevel: 10,
        effect: (level) => `Шанс двойного клика: ${level * 5}%`,
        finalBuff: (maxLevel) => `Финальный бафф (ур. ${maxLevel}): 50% шанс двойного клика`
    },
    xrayVision: {
        name: "Рентгеновское зрение",
        desc: "5% шанс критического клика (x2) за уровень",
        baseCost: 1000,
        maxLevel: 10,
        effect: (level) => `Шанс крита: ${level * 5}% (множитель x2)`,
        finalBuff: (maxLevel) => `Финальный бафф (ур. ${maxLevel}): 50% шанс крита (x2)`
    },
    regeneration: {
        name: "Регенерация",
        desc: "10% шанс противостоять болезни за уровень",
        baseCost: 2000,
        maxLevel: 10,
        effect: (level) => `Сопротивление болезням: ${level * 10}%`,
        finalBuff: (maxLevel) => `Финальный бафф (ур. ${maxLevel}): 100% иммунитет к болезням`
    },
    telekinesis: {
        name: "Телекинез",
        desc: "5% шанс дополнительной тренировки (+1 ОЭ/день) за уровень",
        baseCost: 1500,
        maxLevel: 10,
        effect: (level) => `Шанс доп. тренировки: ${level * 5}%`,
        finalBuff: (maxLevel) => `Финальный бафф (ур. ${maxLevel}): 50% шанс доп. тренировки каждый день`
    }
};

export const HOUSING_CONFIG = {
    box: {
        id: 'box',
        name: 'Картонная коробка',
        cost: 0,
        maxComfort: 20,
        decayMult: 1.5,   // Комфорт падает в 1.5 раза быстрее
        incomeMult: 1.0   // Бонус к доходу 0%
    },
    shed: {
        id: 'shed',
        name: 'Сарай на окраине',
        cost: 1000,
        maxComfort: 30,
        decayMult: 1.3,
        incomeMult: 1.05  // +5% к доходу
    },
    dilapidated: {
        id: 'dilapidated',
        name: 'Полуразвалившийся дом',
        cost: 3000,
        maxComfort: 40,
        decayMult: 1.1,
        incomeMult: 1.1   // +10% к доходу
    },
    old: {
        id: 'old',
        name: 'Старый дом',
        cost: 5000,
        maxComfort: 50,
        decayMult: 1.0,   // Нормальная скорость падения
        incomeMult: 1.2   // +20% к доходу
    },
    normal: {
        id: 'normal',
        name: 'Обычный дом',
        cost: 7000,
        maxComfort: 70,
        decayMult: 0.8,   // Падает на 20% медленнее
        incomeMult: 1.3   // +30% к доходу
    },
    good: {
        id: 'good',
        name: 'Хороший дом',
        cost: 10000,
        maxComfort: 90,
        decayMult: 0.6,   // Падает на 40% медленнее
        incomeMult: 1.5   // +50% к доходу
    },
    mansion: {
        id: 'mansion',
        name: 'Особняк',
        cost: 15000,
        maxComfort: 100,
        decayMult: 0.4,   // Падает на 60% медленнее
        incomeMult: 2.0   // +100% к доходу
    }
};

export const ITEMS_CONFIG = {
    money_exchange: {
        icon: '💰',
        name: 'Обмен на деньги',
        desc: '1 ОЭ = 10 денег', // Это перезапишется в UI
        cost: 1,
        reward: 10 // Это тоже перезапишется
    }
};

// 🔑 Настройки автоматического обмена ОЭ на деньги
export const AUTO_EXCHANGE_CONFIG = {
    amounts: [0, 1, 2, 5, 10, 20, 50],
    default: 0,
    rate: 10
};

export const INHERITANCE_CONFIG = {
    moneySpentPerBonus: 5000,      // 10 000 💰 = +5% к курсу
    exchangeRateBonusPerStep: 5,    // +5% за каждый шаг
    crystalLevelForBonus: 5,        // Минимальный уровень кристалла для наследия
    abilityLevelForBonus: 5         // Минимальный уровень способности для наследия
};

export const BASE_EXCHANGE_RATE = 10;

export const CRYSTAL_COST = 100;
export const MAX_ACTIVE_CRYSTALS = 5;
export const MAX_INVENTORY_CRYSTALS = 10;
export const GAME_VERSION = "1.0.1"; // Обновляем версию

export const GAME_START_DATE = {
    year: 2026,
    month: 1,
    day: 1
};

export const DIFFICULTY_CONFIG = {
    easy: {
        id: 'easy',
        name: "Просто",
        icon: "🌱",
        startAge: 20,
        diseaseImmunityDays: 180, // 6 месяцев = 180 дней
        description: "Начинаете с 20 лет. Первые полгода защищены от болезней.",
        color: "#48bb78"
    },
    medium: {
        id: 'medium',
        name: "Средне",
        icon: "⚖️",
        startAge: 30,
        diseaseImmunityDays: 30, // 1 месяц = 30 дней
        description: "Начинаете с 30 лет. Первый месяц защищены от болезней.",
        color: "#ed8936"
    },
    hard: {
        id: 'hard',
        name: "Сложно",
        icon: "💀",
        startAge: 40,
        diseaseImmunityDays: 0, // Нет защиты
        description: "Начинаете с 40 лет. Болезни атакуют с самого начала.",
        color: "#e53e3e"
    }
};
// © 2024–2026 Андрей Блинов. Все права защищены (All rights reserved).