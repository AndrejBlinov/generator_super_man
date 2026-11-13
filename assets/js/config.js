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

export const ITEMS_CONFIG = {
    money: {
        name: "Обмен на деньги",
        desc: "1 ОЭ = 10 денег",
        cost: 1,
        reward: 10,
        icon: "💰"
    }
};

// 🔑 Настройки автоматического обмена ОЭ на деньги
export const AUTO_EXCHANGE_CONFIG = {
    amounts: [0, 1, 2, 5, 10, 20, 50],
    default: 0,
    rate: 10
};

export const CRYSTAL_COST = 100;
export const MAX_ACTIVE_CRYSTALS = 5;
export const MAX_INVENTORY_CRYSTALS = 10;
export const GAME_VERSION = "0.9.0";

export const GAME_START_DATE = {
    year: 2026,
    month: 1,
    day: 1
};