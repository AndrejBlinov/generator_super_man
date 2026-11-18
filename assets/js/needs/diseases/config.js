// Конфигурация болезней

export const DISEASE_CATEGORIES = {
    LIGHT: 'light',
    MEDIUM: 'medium',
    HEAVY: 'heavy'
};

export const DISEASES_CONFIG = {
    // ========== ЛЁГКИЕ БОЛЕЗНИ ==========
    cold: {
        id: 'cold', name: "Простуда", description: "Вирусная инфекция", icon: "🤧",
        category: DISEASE_CATEGORIES.LIGHT, treatmentCost: 50, duration: 100, nextStage: 'flu',
        effects: { healthDecayBonus: 0, blockTraining: false }, gender: 'both'
    },
    cut: {
        id: 'cut', name: "Порез", description: "Поверхностная рана", icon: "🩹",
        category: DISEASE_CATEGORIES.LIGHT, treatmentCost: 30, duration: 100, nextStage: 'sepsis',
        effects: { healthDecayBonus: 0, blockTraining: false }, gender: 'both'
    },
    sprain: {
        id: 'sprain', name: "Растяжение", description: "Повреждение связок", icon: "🦶",
        category: DISEASE_CATEGORIES.LIGHT, treatmentCost: 40, duration: 100, nextStage: 'fracture',
        effects: { healthDecayBonus: 0, blockTraining: true }, gender: 'both'
    },
    headache: {
        id: 'headache', name: "Головная боль", description: "Напряжение и усталость", icon: "😣",
        category: DISEASE_CATEGORIES.LIGHT, treatmentCost: 35, duration: 100, nextStage: 'migraine',
        effects: { healthDecayBonus: 0, blockTraining: false }, gender: 'both'
    },
    allergy: {
        id: 'allergy', name: "Аллергия", description: "Реакция на раздражитель", icon: "🤧",
        category: DISEASE_CATEGORIES.LIGHT, treatmentCost: 60, duration: 100, nextStage: 'asthma',
        effects: { healthDecayBonus: 0, blockTraining: false }, gender: 'both'
    },
    stomachache: {
        id: 'stomachache', name: "Расстройство желудка", description: "Лёгкое отравление", icon: "🤢",
        category: DISEASE_CATEGORIES.LIGHT, treatmentCost: 45, duration: 100, nextStage: 'ulcer',
        effects: { healthDecayBonus: 0, blockTraining: false }, gender: 'both'
    },
    stress: {
        id: 'stress', name: "Нервное напряжение", description: "Стресс и тревога", icon: "😰",
        category: DISEASE_CATEGORIES.LIGHT, treatmentCost: 70, duration: 100, nextStage: 'depression',
        effects: { healthDecayBonus: 0, blockTraining: false }, gender: 'both'
    },
    insomnia: {
        id: 'insomnia', name: "Бессонница", description: "Нарушение сна", icon: "😴",
        category: DISEASE_CATEGORIES.LIGHT, treatmentCost: 55, duration: 100, nextStage: 'chronic_fatigue',
        effects: { healthDecayBonus: 0, blockTraining: false }, gender: 'both'
    },
    cough: {
        id: 'cough', name: "Кашель", description: "Раздражение дыхательных путей", icon: "😷",
        category: DISEASE_CATEGORIES.LIGHT, treatmentCost: 40, duration: 100, nextStage: 'bronchitis',
        effects: { healthDecayBonus: 0, blockTraining: false }, gender: 'both'
    },
    heartache: {
        id: 'heartache', name: "Боль в сердце", description: "Функциональные нарушения", icon: "💔",
        category: DISEASE_CATEGORIES.LIGHT, treatmentCost: 80, duration: 100, nextStage: 'arrhythmia',
        effects: { healthDecayBonus: 0, blockTraining: false }, gender: 'both'
    },
    
    // Лёгкие мужские
    male_pattern_baldness: {
        id: 'male_pattern_baldness', name: "Андрогенная алопеция", description: "Облысение по мужскому типу", icon: "👨‍🦲",
        category: DISEASE_CATEGORIES.LIGHT, treatmentCost: 200, duration: 100, nextStage: 'stress',
        effects: { healthDecayBonus: 0, blockTraining: false }, gender: 'male'
    },
    gynecomastia: {
        id: 'gynecomastia', name: "Гинекомастия", description: "Увеличение грудных желёз", icon: "👕",
        category: DISEASE_CATEGORIES.LIGHT, treatmentCost: 300, duration: 100, nextStage: 'stress',
        effects: { healthDecayBonus: 0, blockTraining: false }, gender: 'male'
    },
    // Лёгкие женские
    dysmenorrhea: {
        id: 'dysmenorrhea', name: "Дисменорея", description: "Болезненные менструации", icon: "🩸",
        category: DISEASE_CATEGORIES.LIGHT, treatmentCost: 60, duration: 100, nextStage: 'endometriosis',
        effects: { healthDecayBonus: 0, blockTraining: true }, gender: 'female'
    },
    cervical_erosion: {
        id: 'cervical_erosion', name: "Эрозия шейки матки", description: "Повреждение слизистой", icon: "🔬",
        category: DISEASE_CATEGORIES.LIGHT, treatmentCost: 150, duration: 100, nextStage: 'cervical_cancer',
        effects: { healthDecayBonus: 0, blockTraining: false }, gender: 'female'
    },
    vaginitis: {
        id: 'vaginitis', name: "Вагинит", description: "Воспаление влагалища", icon: "🦠",
        category: DISEASE_CATEGORIES.LIGHT, treatmentCost: 100, duration: 100, nextStage: 'pelvic_inflammatory_disease',
        effects: { healthDecayBonus: 0, blockTraining: true }, gender: 'female'
    },

    // ========== СРЕДНИЕ БОЛЕЗНИ ==========
    flu: {
        id: 'flu', name: "Грипп", description: "Вирусная инфекция с лихорадкой", icon: "🤒",
        category: DISEASE_CATEGORIES.MEDIUM, treatmentCost: 500, duration: 100, nextStage: 'pneumonia',
        effects: { healthDecayBonus: 2, blockTraining: true }, gender: 'both'
    },
    sepsis: {
        id: 'sepsis', name: "Сепсис", description: "Заражение через рану", icon: "🦠",
        category: DISEASE_CATEGORIES.MEDIUM, treatmentCost: 800, duration: 100, nextStage: 'blood_poisoning',
        effects: { healthDecayBonus: 3, blockTraining: true }, gender: 'both'
    },
    fracture: {
        id: 'fracture', name: "Перелом", description: "Повреждение кости", icon: "🦴",
        category: DISEASE_CATEGORIES.MEDIUM, treatmentCost: 1000, duration: 100, nextStage: 'disability',
        effects: { healthDecayBonus: 2, blockTraining: true }, gender: 'both'
    },
    migraine: {
        id: 'migraine', name: "Мигрень", description: "Хроническая головная боль", icon: "🤕",
        category: DISEASE_CATEGORIES.MEDIUM, treatmentCost: 600, duration: 100, nextStage: 'stroke',
        effects: { healthDecayBonus: 2, blockTraining: true }, gender: 'both'
    },
    asthma: {
        id: 'asthma', name: "Астма", description: "Хроническое заболевание лёгких", icon: "🫁",
        category: DISEASE_CATEGORIES.MEDIUM, treatmentCost: 700, duration: 100, nextStage: 'anaphylaxis',
        effects: { healthDecayBonus: 2, blockTraining: true }, gender: 'both'
    },
    ulcer: {
        id: 'ulcer', name: "Язва желудка", description: "Поражение слизистой", icon: "🤮",
        category: DISEASE_CATEGORIES.MEDIUM, treatmentCost: 900, duration: 100, nextStage: 'internal_bleeding',
        effects: { healthDecayBonus: 3, blockTraining: true }, gender: 'both'
    },
    depression: {
        id: 'depression', name: "Депрессия", description: "Клиническое расстройство", icon: "😞",
        category: DISEASE_CATEGORIES.MEDIUM, treatmentCost: 1200, duration: 100, nextStage: 'suicidal',
        effects: { healthDecayBonus: 2, blockTraining: true }, gender: 'both'
    },
    chronic_fatigue: {
        id: 'chronic_fatigue', name: "Хроническая усталость", description: "Синдром истощения", icon: "😫",
        category: DISEASE_CATEGORIES.MEDIUM, treatmentCost: 800, duration: 100, nextStage: 'organ_failure',
        effects: { healthDecayBonus: 2, blockTraining: true }, gender: 'both'
    },
    bronchitis: {
        id: 'bronchitis', name: "Бронхит", description: "Воспаление бронхов", icon: "🫁",
        category: DISEASE_CATEGORIES.MEDIUM, treatmentCost: 750, duration: 100, nextStage: 'tuberculosis',
        effects: { healthDecayBonus: 2, blockTraining: true }, gender: 'both'
    },
    arrhythmia: {
        id: 'arrhythmia', name: "Аритмия", description: "Нарушение сердечного ритма", icon: "💓",
        category: DISEASE_CATEGORIES.MEDIUM, treatmentCost: 1500, duration: 100, nextStage: 'heart_attack',
        effects: { healthDecayBonus: 3, blockTraining: true }, gender: 'both'
    },

    // Средние мужские
    prostatitis: {
        id: 'prostatitis', name: "Простатит", description: "Воспаление предстательной железы", icon: "🚻",
        category: DISEASE_CATEGORIES.MEDIUM, treatmentCost: 600, duration: 100, nextStage: 'bph',
        effects: { healthDecayBonus: 2, blockTraining: true }, gender: 'male'
    },
    varicocele: {
        id: 'varicocele', name: "Варикоцеле", description: "Расширение вен семенного канатика", icon: "🩺",
        category: DISEASE_CATEGORIES.MEDIUM, treatmentCost: 800, duration: 100, nextStage: 'male_infertility',
        effects: { healthDecayBonus: 1, blockTraining: true }, gender: 'male'
    },
    erectile_dysfunction: {
        id: 'erectile_dysfunction', name: "Эректильная дисфункция", description: "Нарушение потенции", icon: "📉",
        category: DISEASE_CATEGORIES.MEDIUM, treatmentCost: 700, duration: 100, nextStage: 'depression',
        effects: { healthDecayBonus: 1, blockTraining: false }, gender: 'male'
    },
    epididymitis: {
        id: 'epididymitis', name: "Эпидидимит", description: "Воспаление придатка яичка", icon: "🔴",
        category: DISEASE_CATEGORIES.MEDIUM, treatmentCost: 500, duration: 100, nextStage: 'male_infertility',
        effects: { healthDecayBonus: 2, blockTraining: true }, gender: 'male'
    },
    // Средние женские
    pcos: {
        id: 'pcos', name: "СПКЯ", description: "Синдром поликистозных яичников", icon: "🥚",
        category: DISEASE_CATEGORIES.MEDIUM, treatmentCost: 700, duration: 100, nextStage: 'female_infertility',
        effects: { healthDecayBonus: 1, blockTraining: false }, gender: 'female'
    },
    mastitis: {
        id: 'mastitis', name: "Мастит", description: "Воспаление молочной железы", icon: "🍼",
        category: DISEASE_CATEGORIES.MEDIUM, treatmentCost: 600, duration: 100, nextStage: 'breast_abscess',
        effects: { healthDecayBonus: 2, blockTraining: true }, gender: 'female'
    },
    fibroids: {
        id: 'fibroids', name: "Миома матки", description: "Доброкачественная опухоль", icon: "🔬",
        category: DISEASE_CATEGORIES.MEDIUM, treatmentCost: 900, duration: 100, nextStage: 'heavy_bleeding',
        effects: { healthDecayBonus: 2, blockTraining: true }, gender: 'female'
    },
    ovarian_cyst: {
        id: 'ovarian_cyst', name: "Киста яичника", description: "Полостное образование", icon: "🟡",
        category: DISEASE_CATEGORIES.MEDIUM, treatmentCost: 850, duration: 100, nextStage: 'ovarian_cancer',
        effects: { healthDecayBonus: 2, blockTraining: true }, gender: 'female'
    },
    pelvic_inflammatory_disease: {
        id: 'pelvic_inflammatory_disease', name: "ВЗОМТ", description: "Воспаление органов малого таза", icon: "🔥",
        category: DISEASE_CATEGORIES.MEDIUM, treatmentCost: 1000, duration: 100, nextStage: 'female_infertility',
        effects: { healthDecayBonus: 3, blockTraining: true }, gender: 'female'
    },

    // ========== ТЯЖЁЛЫЕ БОЛЕЗНИ ==========
    pneumonia: {
        id: 'pneumonia', name: "Пневмония", description: "Воспаление лёгких", icon: "🫁",
        category: DISEASE_CATEGORIES.HEAVY, treatmentCost: 5000, duration: 100, nextStage: null, deathOnExpire: true,
        effects: { healthDecayBonus: 4, blockTraining: true }, gender: 'both'
    },
    blood_poisoning: {
        id: 'blood_poisoning', name: "Заражение крови", description: "Септицемия", icon: "🩸",
        category: DISEASE_CATEGORIES.HEAVY, treatmentCost: 8000, duration: 100, nextStage: null, deathOnExpire: true,
        effects: { healthDecayBonus: 5, blockTraining: true }, gender: 'both'
    },
    disability: {
        id: 'disability', name: "Инвалидность", description: "Потеря трудоспособности", icon: "🦽",
        category: DISEASE_CATEGORIES.HEAVY, treatmentCost: 10000, duration: 100, nextStage: null, deathOnExpire: false,
        effects: { healthDecayBonus: 4, blockTraining: true }, gender: 'both'
    },
    stroke: {
        id: 'stroke', name: "Инсульт", description: "Нарушение мозгового кровообращения", icon: "🧠",
        category: DISEASE_CATEGORIES.HEAVY, treatmentCost: 12000, duration: 100, nextStage: null, deathOnExpire: true,
        effects: { healthDecayBonus: 5, blockTraining: true }, gender: 'both'
    },
    anaphylaxis: {
        id: 'anaphylaxis', name: "Анафилактический шок", description: "Тяжёлая аллергическая реакция", icon: "⚠️",
        category: DISEASE_CATEGORIES.HEAVY, treatmentCost: 7000, duration: 100, nextStage: null, deathOnExpire: true,
        effects: { healthDecayBonus: 6, blockTraining: true }, gender: 'both'
    },
    internal_bleeding: {
        id: 'internal_bleeding', name: "Внутреннее кровотечение", description: "Угроза жизни", icon: "🩸",
        category: DISEASE_CATEGORIES.HEAVY, treatmentCost: 9000, duration: 100, nextStage: null, deathOnExpire: true,
        effects: { healthDecayBonus: 5, blockTraining: true }, gender: 'both'
    },
    suicidal: {
        id: 'suicidal', name: "Суицидальные мысли", description: "Критическое психическое состояние", icon: "💀",
        category: DISEASE_CATEGORIES.HEAVY, treatmentCost: 15000, duration: 100, nextStage: null, deathOnExpire: true,
        effects: { healthDecayBonus: 4, blockTraining: true }, gender: 'both'
    },
    organ_failure: {
        id: 'organ_failure', name: "Органная недостаточность", description: "Отказ органов", icon: "🏥",
        category: DISEASE_CATEGORIES.HEAVY, treatmentCost: 20000, duration: 100, nextStage: null, deathOnExpire: true,
        effects: { healthDecayBonus: 6, blockTraining: true }, gender: 'both'
    },
    tuberculosis: {
        id: 'tuberculosis', name: "Туберкулёз", description: "Хроническая инфекция", icon: "🦠",
        category: DISEASE_CATEGORIES.HEAVY, treatmentCost: 11000, duration: 100, nextStage: null, deathOnExpire: true,
        effects: { healthDecayBonus: 5, blockTraining: true }, gender: 'both'
    },
    heart_attack: {
        id: 'heart_attack', name: "Инфаркт", description: "Омертвление сердечной мышцы", icon: "💔",
        category: DISEASE_CATEGORIES.HEAVY, treatmentCost: 18000, duration: 100, nextStage: null, deathOnExpire: true,
        effects: { healthDecayBonus: 6, blockTraining: true }, gender: 'both'
    },

    // Тяжёлые мужские
    bph: {
        id: 'bph', name: "Аденома простаты", description: "Доброкачественная гиперплазия", icon: "🚻",
        category: DISEASE_CATEGORIES.HEAVY, treatmentCost: 6000, duration: 100, nextStage: 'prostate_cancer',
        effects: { healthDecayBonus: 3, blockTraining: true }, gender: 'male'
    },
    prostate_cancer: {
        id: 'prostate_cancer', name: "Рак простаты", description: "Злокачественная опухоль", icon: "🎗️",
        category: DISEASE_CATEGORIES.HEAVY, treatmentCost: 25000, duration: 100, nextStage: null, deathOnExpire: true,
        effects: { healthDecayBonus: 6, blockTraining: true }, gender: 'male'
    },
    testicular_cancer: {
        id: 'testicular_cancer', name: "Рак яичка", description: "Злокачественная опухоль", icon: "🎗️",
        category: DISEASE_CATEGORIES.HEAVY, treatmentCost: 22000, duration: 100, nextStage: null, deathOnExpire: true,
        effects: { healthDecayBonus: 6, blockTraining: true }, gender: 'male'
    },
    male_infertility: {
        id: 'male_infertility', name: "Мужское бесплодие", description: "Невозможность зачатия", icon: "🧬",
        category: DISEASE_CATEGORIES.HEAVY, treatmentCost: 15000, duration: 100, nextStage: 'depression',
        effects: { healthDecayBonus: 1, blockTraining: false }, gender: 'male'
    },
    peyronie_disease: {
        id: 'peyronie_disease', name: "Болезнь Пейрони", description: "Искривление полового члена", icon: "📐",
        category: DISEASE_CATEGORIES.HEAVY, treatmentCost: 12000, duration: 100, nextStage: 'erectile_dysfunction',
        effects: { healthDecayBonus: 2, blockTraining: true }, gender: 'male'
    },

    // Тяжёлые женские
    endometriosis: {
        id: 'endometriosis', name: "Эндометриоз", description: "Разрастание ткани эндометрия", icon: "🩸",
        category: DISEASE_CATEGORIES.HEAVY, treatmentCost: 8000, duration: 100, nextStage: 'female_infertility',
        effects: { healthDecayBonus: 3, blockTraining: true }, gender: 'female'
    },
    breast_abscess: {
        id: 'breast_abscess', name: "Абсцесс молочной железы", description: "Гнойное воспаление", icon: "🔥",
        category: DISEASE_CATEGORIES.HEAVY, treatmentCost: 7000, duration: 100, nextStage: 'sepsis',
        effects: { healthDecayBonus: 4, blockTraining: true }, gender: 'female'
    },
    cervical_cancer: {
        id: 'cervical_cancer', name: "Рак шейки матки", description: "Злокачественная опухоль", icon: "🎗️",
        category: DISEASE_CATEGORIES.HEAVY, treatmentCost: 25000, duration: 100, nextStage: null, deathOnExpire: true,
        effects: { healthDecayBonus: 6, blockTraining: true }, gender: 'female'
    },
    ovarian_cancer: {
        id: 'ovarian_cancer', name: "Рак яичников", description: "Злокачественная опухоль", icon: "🎗️",
        category: DISEASE_CATEGORIES.HEAVY, treatmentCost: 28000, duration: 100, nextStage: null, deathOnExpire: true,
        effects: { healthDecayBonus: 6, blockTraining: true }, gender: 'female'
    },
    female_infertility: {
        id: 'female_infertility', name: "Женское бесплодие", description: "Невозможность зачатия", icon: "🧬",
        category: DISEASE_CATEGORIES.HEAVY, treatmentCost: 18000, duration: 100, nextStage: 'depression',
        effects: { healthDecayBonus: 1, blockTraining: false }, gender: 'female'
    }
};

// 🔑 Группировка болезней по категориям (обновлена с новыми ID)
export const DISEASES_BY_CATEGORY = {
    light: [
        'cold', 'cut', 'sprain', 'headache', 'allergy', 'stomachache', 'stress', 'insomnia', 'cough', 'heartache',
        'male_pattern_baldness', 'gynecomastia', 'dysmenorrhea', 'cervical_erosion', 'vaginitis'
    ],
    medium: [
        'flu', 'sepsis', 'fracture', 'migraine', 'asthma', 'ulcer', 'depression', 'chronic_fatigue', 'bronchitis', 'arrhythmia',
        'prostatitis', 'varicocele', 'erectile_dysfunction', 'epididymitis',
        'pcos', 'mastitis', 'fibroids', 'ovarian_cyst', 'pelvic_inflammatory_disease'
    ],
    heavy: [
        'pneumonia', 'blood_poisoning', 'disability', 'stroke', 'anaphylaxis', 'internal_bleeding', 'suicidal', 'organ_failure', 'tuberculosis', 'heart_attack',
        'bph', 'prostate_cancer', 'testicular_cancer', 'male_infertility', 'peyronie_disease',
        'endometriosis', 'breast_abscess', 'cervical_cancer', 'ovarian_cancer', 'female_infertility'
    ]
};

// Шансы появления болезней в зависимости от возраста
export const AGE_BRACKETS = [
    { min: 0, max: 30, chances: { light: 0.04, medium: 0.02, heavy: 0.01 } },
    { min: 31, max: 50, chances: { light: 0.05, medium: 0.03, heavy: 0.02 } },
    { min: 51, max: 70, chances: { light: 0.05, medium: 0.06, heavy: 0.08 } },
    { min: 71, max: 200, chances: { light: 0.10, medium: 0.12, heavy: 0.15 } }
];

export const MAX_ACTIVE_DISEASES = 2;

// 🔑 Вспомогательная функция для получения случайной болезни с учётом пола
export function getRandomDisease(gender = 'both', category = null) {
    let pool = Object.values(DISEASES_CONFIG);
    
    // Фильтр по полу
    pool = pool.filter(d => d.gender === 'both' || d.gender === gender);
    
    // Фильтр по категории (если указана)
    if (category) {
        pool = pool.filter(d => d.category === category);
    }
    
    if (pool.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
}

// 🔑 Вспомогательная функция для получения болезни по ID
export function getDiseaseById(id) {
    return DISEASES_CONFIG[id] || null;
}
// © 2024–2026 Андрей Блинов. Все права защищены (All rights reserved).