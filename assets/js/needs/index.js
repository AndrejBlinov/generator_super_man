export { NEEDS_CONFIG } from './config.js';
export { 
    decayNeed, 
    restoreNeed, 
    applyAutoSpend, 
    checkNeedDeath, 
    processNeedsTick,
    canTrain,
    getTrainingBlockReason,
    getDefaultNeeds
} from './logic.js';
export { 
    renderNeeds, 
    updateNeedsBars, 
    updateNeedRestoreButtons,
    restoreNeedManual
} from './ui.js';
export { 
    getNeedState, 
    applyCharacterStates 
} from './visualStates.js';

// 🔑 Болезни
export * from './diseases/index.js';