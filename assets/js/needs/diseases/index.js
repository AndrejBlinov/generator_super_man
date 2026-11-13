// Точка входа модуля болезней

export { DISEASES_CONFIG, DISEASE_CATEGORIES, DISEASE_CHANCE_PER_TICK } from './config.js';
export { 
    trySpawnDisease, 
    processDiseaseTick, 
    treatDisease,
    getDiseaseHealthDecayBonus,
    isDiseaseBlockingTraining,
    getActiveDiseaseInfo
} from './logic.js';
export { 
    renderDiseaseBlock, 
    updateDiseaseUI, 
    handleTreatDisease 
} from './ui.js';