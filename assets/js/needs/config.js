// Конфигурация потребностей персонажа

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