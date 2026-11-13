import { gameState } from '../../state.js';
import { DISEASES_CONFIG, DISEASES_BY_CATEGORY, AGE_BRACKETS, MAX_ACTIVE_DISEASES } from './config.js';

function getAgeBracket() {
    const age = gameState.ageInYears;
    return AGE_BRACKETS.find(b => age >= b.min && age <= b.max) || AGE_BRACKETS[AGE_BRACKETS.length - 1];
}

export function trySpawnDiseases() {
    if (!gameState.activeDiseases) gameState.activeDiseases = [];
    if (gameState.activeDiseases.length >= MAX_ACTIVE_DISEASES) return [];
    
    // 🔑 Проверка иммунитета
    if (gameState.diseaseImmunityTicks > 0) return [];
    
    const chances = getAgeBracket().chances;
    const spawned = [];
    
    for (const category of ['light', 'medium', 'heavy']) {
        if (gameState.activeDiseases.length >= MAX_ACTIVE_DISEASES) break;
        
        if (Math.random() < chances[category]) {
            const available = DISEASES_BY_CATEGORY[category].filter(
                id => !gameState.activeDiseases.some(d => d.id === id)
            );
            
            if (available.length === 0) continue;
            
            const diseaseId = available[Math.floor(Math.random() * available.length)];
            const config = DISEASES_CONFIG[diseaseId];
            
            const newDisease = {
                id: diseaseId,
                ticksRemaining: config.duration,
                progressed: false
            };
            
            gameState.activeDiseases.push(newDisease);
            spawned.push(config);
        }
    }
    
    return spawned;
}


export function processDiseasesTick() {
    if (!gameState.activeDiseases) gameState.activeDiseases = [];
    
    const result = {
        spawned: trySpawnDiseases(),
        progressed: [],
        died: null,
        autoTreated: []
    };
    
    // 🔑 Автоматическое лечение (если включено)
    if (gameState.autoTreatEnabled) {
        result.autoTreated = autoTreatDiseases();
    }
    
    const toRemove = [];
    
    gameState.activeDiseases.forEach((disease, index) => {
        disease.ticksRemaining--;
        
        if (disease.ticksRemaining <= 0) {
            const config = DISEASES_CONFIG[disease.id];
            
            if (config.deathOnExpire) {
                result.died = config.name;
                return;
            }
            
            if (config.nextStage) {
                const nextConfig = DISEASES_CONFIG[config.nextStage];
                
                const alreadyHas = gameState.activeDiseases.some(
                    (d, i) => i !== index && d.id === config.nextStage
                );
                
                if (alreadyHas) {
                    toRemove.push(index);
                } else {
                    disease.id = config.nextStage;
                    disease.ticksRemaining = nextConfig.duration;
                    result.progressed.push(nextConfig);
                }
            }
        }
    });
    
    toRemove.reverse().forEach(i => gameState.activeDiseases.splice(i, 1));
    
    return result;
}

// 🔑 Автоматическое лечение: лечит самую дешёвую болезнь, если есть деньги
function autoTreatDiseases() {
    if (!gameState.activeDiseases || gameState.activeDiseases.length === 0) return [];
    
    const treated = [];
    
    // Сортируем по стоимости лечения (от дешёвой к дорогой)
    const sortedDiseases = [...gameState.activeDiseases].sort((a, b) => {
        const costA = DISEASES_CONFIG[a.id].treatmentCost;
        const costB = DISEASES_CONFIG[b.id].treatmentCost;
        return costA - costB;
    });
    
    // Пытаемся лечить, пока есть деньги
    for (const disease of sortedDiseases) {
        const config = DISEASES_CONFIG[disease.id];
        
        if (gameState.money >= config.treatmentCost) {
            const index = gameState.activeDiseases.findIndex(d => d.id === disease.id);
            if (index !== -1) {
                gameState.money -= config.treatmentCost;
                gameState.activeDiseases.splice(index, 1);
                treated.push(config);
            }
        }
    }
    
    return treated;
}

export function treatDisease(diseaseId) {
    if (!gameState.activeDiseases) {
        return { success: false, message: "Нет активной болезни" };
    }
    
    const index = gameState.activeDiseases.findIndex(d => d.id === diseaseId);
    if (index === -1) {
        return { success: false, message: "Болезнь не найдена" };
    }
    
    const config = DISEASES_CONFIG[diseaseId];
    
    if (gameState.money < config.treatmentCost) {
        return { 
            success: false, 
            message: `Недостаточно денег! Нужно ${config.treatmentCost} 💰` 
        };
    }
    
    gameState.money -= config.treatmentCost;
    gameState.activeDiseases.splice(index, 1);
    
    return { 
        success: true, 
        message: `${config.name} вылечена!`
    };
}

export function getDiseaseHealthDecayBonus() {
    if (!gameState.activeDiseases) return 0;
    return gameState.activeDiseases.reduce((sum, disease) => {
        const config = DISEASES_CONFIG[disease.id];
        return sum + config.effects.healthDecayBonus;
    }, 0);
}

export function isDiseaseBlockingTraining() {
    if (!gameState.activeDiseases) return false;
    return gameState.activeDiseases.some(disease => {
        const config = DISEASES_CONFIG[disease.id];
        return config.effects.blockTraining;
    });
}

export function getActiveDiseasesInfo() {
    if (!gameState.activeDiseases || !Array.isArray(gameState.activeDiseases)) {
        return [];
    }
    
    return gameState.activeDiseases
        .filter(disease => disease && disease.id && DISEASES_CONFIG[disease.id]) // <-- Фильтр "битых" записей
        .map(disease => {
            const config = DISEASES_CONFIG[disease.id];
            return {
                ...config,
                ticksRemaining: disease.ticksRemaining,
                canAfford: gameState.money >= config.treatmentCost
            };
        });
}