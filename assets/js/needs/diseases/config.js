// Конфигурация болезней

export const DISEASE_CATEGORIES = {
    LIGHT: 'light',
    MEDIUM: 'medium',
    HEAVY: 'heavy'
};

export const DISEASES_CONFIG = {
    // ========== ЛЁГКИЕ БОЛЕЗНИ ==========
    cold: {
        id: 'cold',
        name: "Простуда",
        description: "Вирусная инфекция",
        icon: "🤧",
        category: DISEASE_CATEGORIES.LIGHT,
        treatmentCost: 50,
        duration: 100,
        nextStage: 'flu',
        effects: { healthDecayBonus: 0, blockTraining: false }
    },
    cut: {
        id: 'cut',
        name: "Порез",
        description: "Поверхностная рана",
        icon: "🩹",
        category: DISEASE_CATEGORIES.LIGHT,
        treatmentCost: 30,
        duration: 100,
        nextStage: 'sepsis',
        effects: { healthDecayBonus: 0, blockTraining: false }
    },
    bruise: {
        id: 'bruise',
        name: "Ушиб",
        description: "Повреждение тканей",
        icon: "💢",
        category: DISEASE_CATEGORIES.LIGHT,
        treatmentCost: 40,
        duration: 100,
        nextStage: 'fracture',
        effects: { healthDecayBonus: 0, blockTraining: false }
    },
    headache: {
        id: 'headache',
        name: "Головная боль",
        description: "Напряжение и усталость",
        icon: "😣",
        category: DISEASE_CATEGORIES.LIGHT,
        treatmentCost: 35,
        duration: 100,
        nextStage: 'migraine',
        effects: { healthDecayBonus: 0, blockTraining: false }
    },
    allergy: {
        id: 'allergy',
        name: "Аллергия",
        description: "Реакция на раздражитель",
        icon: "🤧",
        category: DISEASE_CATEGORIES.LIGHT,
        treatmentCost: 60,
        duration: 100,
        nextStage: 'asthma',
        effects: { healthDecayBonus: 0, blockTraining: false }
    },
    stomachache: {
        id: 'stomachache',
        name: "Расстройство желудка",
        description: "Лёгкое отравление",
        icon: "🤢",
        category: DISEASE_CATEGORIES.LIGHT,
        treatmentCost: 45,
        duration: 100,
        nextStage: 'ulcer',
        effects: { healthDecayBonus: 0, blockTraining: false }
    },
    stress: {
        id: 'stress',
        name: "Нервное напряжение",
        description: "Стресс и тревога",
        icon: "😰",
        category: DISEASE_CATEGORIES.LIGHT,
        treatmentCost: 70,
        duration: 100,
        nextStage: 'depression',
        effects: { healthDecayBonus: 0, blockTraining: false }
    },
    insomnia: {
        id: 'insomnia',
        name: "Бессонница",
        description: "Нарушение сна",
        icon: "😴",
        category: DISEASE_CATEGORIES.LIGHT,
        treatmentCost: 55,
        duration: 100,
        nextStage: 'fatigue',
        effects: { healthDecayBonus: 0, blockTraining: false }
    },
    cough: {
        id: 'cough',
        name: "Кашель",
        description: "Раздражение дыхательных путей",
        icon: "😷",
        category: DISEASE_CATEGORIES.LIGHT,
        treatmentCost: 40,
        duration: 100,
        nextStage: 'bronchitis',
        effects: { healthDecayBonus: 0, blockTraining: false }
    },
    heartache: {
        id: 'heartache',
        name: "Боль в сердце",
        description: "Функциональные нарушения",
        icon: "💔",
        category: DISEASE_CATEGORIES.LIGHT,
        treatmentCost: 80,
        duration: 100,
        nextStage: 'arrhythmia',
        effects: { healthDecayBonus: 0, blockTraining: false }
    },

    // ========== СРЕДНИЕ БОЛЕЗНИ ==========
    flu: {
        id: 'flu',
        name: "Грипп",
        description: "Вирусная инфекция с лихорадкой",
        icon: "🤒",
        category: DISEASE_CATEGORIES.MEDIUM,
        treatmentCost: 500,
        duration: 100,
        nextStage: 'pneumonia',
        effects: { healthDecayBonus: 2, blockTraining: true }
    },
    sepsis: {
        id: 'sepsis',
        name: "Сепсис",
        description: "Заражение через рану",
        icon: "🦠",
        category: DISEASE_CATEGORIES.MEDIUM,
        treatmentCost: 800,
        duration: 100,
        nextStage: 'bloodpoisoning',
        effects: { healthDecayBonus: 3, blockTraining: true }
    },
    fracture: {
        id: 'fracture',
        name: "Перелом",
        description: "Повреждение кости",
        icon: "🦴",
        category: DISEASE_CATEGORIES.MEDIUM,
        treatmentCost: 1000,
        duration: 100,
        nextStage: 'disability',
        effects: { healthDecayBonus: 2, blockTraining: true }
    },
    migraine: {
        id: 'migraine',
        name: "Мигрень",
        description: "Хроническая головная боль",
        icon: "🤕",
        category: DISEASE_CATEGORIES.MEDIUM,
        treatmentCost: 600,
        duration: 100,
        nextStage: 'stroke',
        effects: { healthDecayBonus: 2, blockTraining: true }
    },
    asthma: {
        id: 'asthma',
        name: "Астма",
        description: "Хроническое заболевание лёгких",
        icon: "🫁",
        category: DISEASE_CATEGORIES.MEDIUM,
        treatmentCost: 700,
        duration: 100,
        nextStage: 'anaphylaxis',
        effects: { healthDecayBonus: 2, blockTraining: true }
    },
    ulcer: {
        id: 'ulcer',
        name: "Язва желудка",
        description: "Поражение слизистой",
        icon: "🤮",
        category: DISEASE_CATEGORIES.MEDIUM,
        treatmentCost: 900,
        duration: 100,
        nextStage: 'internalbleeding',
        effects: { healthDecayBonus: 3, blockTraining: true }
    },
    depression: {
        id: 'depression',
        name: "Депрессия",
        description: "Клиническое расстройство",
        icon: "😞",
        category: DISEASE_CATEGORIES.MEDIUM,
        treatmentCost: 1200,
        duration: 100,
        nextStage: 'suicidal',
        effects: { healthDecayBonus: 2, blockTraining: true }
    },
    fatigue: {
        id: 'fatigue',
        name: "Хроническая усталость",
        description: "Синдром истощения",
        icon: "😫",
        category: DISEASE_CATEGORIES.MEDIUM,
        treatmentCost: 800,
        duration: 100,
        nextStage: 'organfailure',
        effects: { healthDecayBonus: 2, blockTraining: true }
    },
    bronchitis: {
        id: 'bronchitis',
        name: "Бронхит",
        description: "Воспаление бронхов",
        icon: "🫁",
        category: DISEASE_CATEGORIES.MEDIUM,
        treatmentCost: 750,
        duration: 100,
        nextStage: 'tuberculosis',
        effects: { healthDecayBonus: 2, blockTraining: true }
    },
    arrhythmia: {
        id: 'arrhythmia',
        name: "Аритмия",
        description: "Нарушение сердечного ритма",
        icon: "💓",
        category: DISEASE_CATEGORIES.MEDIUM,
        treatmentCost: 1500,
        duration: 100,
        nextStage: 'heartattack',
        effects: { healthDecayBonus: 3, blockTraining: true }
    },

    // ========== ТЯЖЁЛЫЕ БОЛЕЗНИ ==========
    pneumonia: {
        id: 'pneumonia',
        name: "Пневмония",
        description: "Воспаление лёгких",
        icon: "🫁",
        category: DISEASE_CATEGORIES.HEAVY,
        treatmentCost: 5000,
        duration: 100,
        nextStage: null,
        deathOnExpire: true,
        effects: { healthDecayBonus: 4, blockTraining: true }
    },
    bloodpoisoning: {
        id: 'bloodpoisoning',
        name: "Заражение крови",
        description: "Септицемия",
        icon: "🩸",
        category: DISEASE_CATEGORIES.HEAVY,
        treatmentCost: 8000,
        duration: 100,
        nextStage: null,
        deathOnExpire: true,
        effects: { healthDecayBonus: 5, blockTraining: true }
    },
    disability: {
        id: 'disability',
        name: "Инвалидность",
        description: "Потеря трудоспособности",
        icon: "🦽",
        category: DISEASE_CATEGORIES.HEAVY,
        treatmentCost: 10000,
        duration: 100,
        nextStage: null,
        deathOnExpire: true,
        effects: { healthDecayBonus: 4, blockTraining: true }
    },
    stroke: {
        id: 'stroke',
        name: "Инсульт",
        description: "Нарушение мозгового кровообращения",
        icon: "🧠",
        category: DISEASE_CATEGORIES.HEAVY,
        treatmentCost: 12000,
        duration: 100,
        nextStage: null,
        deathOnExpire: true,
        effects: { healthDecayBonus: 5, blockTraining: true }
    },
    anaphylaxis: {
        id: 'anaphylaxis',
        name: "Анафилактический шок",
        description: "Тяжёлая аллергическая реакция",
        icon: "⚠️",
        category: DISEASE_CATEGORIES.HEAVY,
        treatmentCost: 7000,
        duration: 100,
        nextStage: null,
        deathOnExpire: true,
        effects: { healthDecayBonus: 6, blockTraining: true }
    },
    internalbleeding: {
        id: 'internalbleeding',
        name: "Внутреннее кровотечение",
        description: "Угроза жизни",
        icon: "🩸",
        category: DISEASE_CATEGORIES.HEAVY,
        treatmentCost: 9000,
        duration: 100,
        nextStage: null,
        deathOnExpire: true,
        effects: { healthDecayBonus: 5, blockTraining: true }
    },
    suicidal: {
        id: 'suicidal',
        name: "Суицидальные мысли",
        description: "Критическое психическое состояние",
        icon: "💀",
        category: DISEASE_CATEGORIES.HEAVY,
        treatmentCost: 15000,
        duration: 100,
        nextStage: null,
        deathOnExpire: true,
        effects: { healthDecayBonus: 4, blockTraining: true }
    },
    organfailure: {
        id: 'organfailure',
        name: "Органная недостаточность",
        description: "Отказ органов",
        icon: "🏥",
        category: DISEASE_CATEGORIES.HEAVY,
        treatmentCost: 20000,
        duration: 100,
        nextStage: null,
        deathOnExpire: true,
        effects: { healthDecayBonus: 6, blockTraining: true }
    },
    tuberculosis: {
        id: 'tuberculosis',
        name: "Туберкулёз",
        description: "Хроническая инфекция",
        icon: "🦠",
        category: DISEASE_CATEGORIES.HEAVY,
        treatmentCost: 11000,
        duration: 100,
        nextStage: null,
        deathOnExpire: true,
        effects: { healthDecayBonus: 5, blockTraining: true }
    },
    heartattack: {
        id: 'heartattack',
        name: "Инфаркт",
        description: "Омертвление сердечной мышцы",
        icon: "💔",
        category: DISEASE_CATEGORIES.HEAVY,
        treatmentCost: 18000,
        duration: 100,
        nextStage: null,
        deathOnExpire: true,
        effects: { healthDecayBonus: 6, blockTraining: true }
    }
};

// 🔑 Группировка болезней по категориям
export const DISEASES_BY_CATEGORY = {
    light: ['cold', 'cut', 'bruise', 'headache', 'allergy', 'stomachache', 'stress', 'insomnia', 'cough', 'heartache'],
    medium: ['flu', 'sepsis', 'fracture', 'migraine', 'asthma', 'ulcer', 'depression', 'fatigue', 'bronchitis', 'arrhythmia'],
    heavy: ['pneumonia', 'bloodpoisoning', 'disability', 'stroke', 'anaphylaxis', 'internalbleeding', 'suicidal', 'organfailure', 'tuberculosis', 'heartattack']
};

// Шансы появления болезней в зависимости от возраста
export const AGE_BRACKETS = [
    { min: 0, max: 30, chances: { light: 0.05, medium: 0.03, heavy: 0.02 } },
    { min: 31, max: 50, chances: { light: 0.05, medium: 0.05, heavy: 0.03 } },
    { min: 51, max: 70, chances: { light: 0.05, medium: 0.08, heavy: 0.10 } },
    { min: 71, max: 200, chances: { light: 0.10, medium: 0.12, heavy: 0.15 } }
];

export const MAX_ACTIVE_DISEASES = 2;