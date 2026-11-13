// Конфигурация болезней

export const DISEASE_CATEGORIES = {
    LIGHT: 'light',       // Лёгкая
    MEDIUM: 'medium',     // Средняя
    HEAVY: 'heavy'        // Тяжёлая
};

export const DISEASES_CONFIG = {
    trauma: {
        id: 'trauma',
        name: "Травма",
        description: "Ссадина или порез",
        icon: "🩹",
        category: DISEASE_CATEGORIES.LIGHT,
        treatmentCost: 20,        // 💰 стоимость лечения
        duration: 100,            // тиков до прогрессирования
        nextStage: 'flu',         // во что перерастает
        effects: {
            healthDecayBonus: 0,  // доп. падение здоровья за тик
            blockTraining: false
        }
    },
    flu: {
        id: 'flu',
        name: "Грипп",
        description: "Средняя болезнь",
        icon: "🤒",
        category: DISEASE_CATEGORIES.MEDIUM,
        treatmentCost: 100,
        duration: 100,
        nextStage: 'stroke',
        effects: {
            healthDecayBonus: 2,  // здоровье падает на 2 быстрее
            blockTraining: true   // нельзя тренироваться
        }
    },
    stroke: {
        id: 'stroke',
        name: "Инсульт",
        description: "Тяжёлое состояние",
        icon: "🚑",
        category: DISEASE_CATEGORIES.HEAVY,
        treatmentCost: 500,
        duration: 100,
        nextStage: null,          // после 100 тиков — смерть
        deathOnExpire: true,
        effects: {
            healthDecayBonus: 4,  // здоровье падает на 4 быстрее
            blockTraining: true
        }
    }
};

// Шанс появления болезни за тик (если нет активной)
export const DISEASE_CHANCE_PER_TICK = 0.03; // 3%

// Начальная болезнь (с чего начинается цепочка)
export const INITIAL_DISEASE = 'trauma';