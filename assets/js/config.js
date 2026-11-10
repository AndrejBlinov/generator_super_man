// Таблица замедления старения (10% за уровень)
export const AGING_SLOWDOWN_RATES = [0.90, 0.80, 0.70, 0.60, 0.50, 0.40, 0.30, 0.20, 0.10, 0.05];

// 🔑 Настройки автоматического обмена ОЭ на деньги
export const AUTO_EXCHANGE_CONFIG = {
    steps: [0, 1, 2, 5, 10, 20, 50], // Доступные проценты
    default: 0, // По умолчанию автообмен выключен
    rate: 10 // 1 ОЭ = 10 💰
};


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

// 🔑 НОВАЯ СЕКЦИЯ: Вещи (покупаются за ОЭ, но не имеют уровней)
export const ITEMS_CONFIG = {
    money: {
        name: "Обмен на деньги",
        desc: "1 ОЭ = 10 денег",
        cost: 1, // Стоимость в ОЭ
        reward: 10, // Сколько денег даём
        icon: "💰"
    }
};

// 🔑 НОВАЯ СЕКЦИЯ: Потребности персонажа
export const NEEDS_CONFIG = {
    hunger: {
        name: "Голод",
        icon: "🍔",
        max: 100,
        decayPerDay: 2,
        restoreCost: 10,
        restoreAmount: 10,
        deathOnZero: true,
        states: {
            happy: { min: 80, max: 100, label: "Сытый и довольный" },
            normal: { min: 50, max: 79, label: "Нормально" },
            hungry: { min: 30, max: 49, label: "Голодный" },
            starving: { min: 1, max: 29, label: "Голодает" }
        }
    },
    comfort: {
        name: "Комфорт",
        icon: "🛋️",
        max: 100,
        decayPerDay: 0.5,
        restoreCost: 10,
        restoreAmount: 10,
        deathOnZero: false,
        blockTraining: true,
        states: {
            luxury: { min: 80, max: 100, label: "Роскошный дом", environment: "luxury" },
            normal: { min: 50, max: 79, label: "Обычный дом", environment: "normal" },
            poor: { min: 30, max: 49, label: "Старый дом", environment: "poor" },
            homeless: { min: 0, max: 29, label: "На улице", environment: "homeless" }
        }
    },
    health: {
        name: "Здоровье",
        icon: "❤️",
        max: 100,
        decayPerDay: 1,
        restoreCost: 10,
        restoreAmount: 10,
        deathOnZero: true,
        states: {
            healthy: { min: 60, max: 100, label: "Здоров" },
            sick: { min: 40, max: 59, label: "Болеет", effects: ["blisters", "greenSkin", "vomit"] },
            critical: { min: 10, max: 39, label: "В больнице" },
            coma: { min: 1, max: 9, label: "В коме" }
        }
    }
};

export const CRYSTAL_COST = 100;
export const MAX_ACTIVE_CRYSTALS = 5;
export const MAX_INVENTORY_CRYSTALS = 10;
export const GAME_VERSION = "0.5.0";

// Начальная дата игры (1 января 2026)
export const GAME_START_DATE = {
    year: 2026,
    month: 1,
    day: 1
};