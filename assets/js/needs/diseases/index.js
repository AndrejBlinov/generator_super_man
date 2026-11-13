// Точка входа модуля болезней

export { 
    DISEASES_CONFIG, 
    DISEASE_CATEGORIES, 
    DISEASES_BY_CATEGORY, 
    AGE_BRACKETS, 
    MAX_ACTIVE_DISEASES 
} from './config.js';

export { 
    trySpawnDiseases, 
    processDiseasesTick, 
    treatDisease,
    getDiseaseHealthDecayBonus,
    isDiseaseBlockingTraining,
    getActiveDiseasesInfo
} from './logic.js';

export { 
    renderDiseaseBlock, 
    updateDiseaseUI, 
    handleTreatDisease 
} from './ui.js';