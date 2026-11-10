// Конфигурация игры

export const AGING_SLOWDOWN_RATES = [0.95, 0.90, 0.85, 0.80, 0.70, 0.60, 0.50, 0.40, 0.30, 0.20];

export const UPGRADES_CONFIG = {
    slowAging: {
        name: "Замедление старения",
        desc: "Уменьшает скорость старения",
        baseCost: 100,
        maxLevel: 10,
        effect: (level) => `Скорость старения: ${Math.round(AGING_SLOWDOWN_RATES[level - 1] * 100)}%`
    },
    levitation: {
        name: "Левитация",
        desc: "Тренировки в невесомости",
        baseCost: 500,
        maxLevel: 10,
        effect: (level) => `+${level * 10}% к силе клика`
    },
    xrayVision: {
        name: "Рентгеновское зрение",
        desc: "Видит скрытые возможности",
        baseCost: 1000,
        maxLevel: 10,
        effect: (level) => `+${level * 2}% шанс крита (x5)`
    }
};

export const CRYSTAL_COST = 100;
export const MAX_CRYSTALS = 5;
export const GAME_VERSION = "0.3.0";