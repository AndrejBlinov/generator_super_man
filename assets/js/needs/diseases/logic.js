// Логика болезней: появление, прогрессирование, лечение

import { gameState } from '../../state.js';
import { DISEASES_CONFIG, DISEASE_CHANCE_PER_TICK, INITIAL_DISEASE } from './config.js';

// Проверка появления новой болезни (если нет активной)
export function trySpawnDisease() {
    if (gameState.activeDisease) return null;
    
    if (Math.random() < DISEASE_CHANCE_PER_TICK) {
        gameState.activeDisease = {
            id: INITIAL_DISEASE,
            ticksRemaining: DISEASES_CONFIG[INITIAL_DISEASE].duration,
            progressed: false
        };
        return gameState.activeDisease;
    }
    
    return null;
}

// Обработка одного тика болезни
export function processDiseaseTick() {
    if (!gameState.activeDisease) {
        return { spawned: trySpawnDisease(), progressed: null, died: false };
    }
    
    const disease = gameState.activeDisease;
    const config = DISEASES_CONFIG[disease.id];
    
    // Уменьшаем таймер
    disease.ticksRemaining--;
    
    // Проверка прогрессирования
    if (disease.ticksRemaining <= 0) {
        return progressDisease(disease, config);
    }
    
    return { spawned: null, progressed: null, died: false };
}

// Прогрессирование болезни
function progressDisease(disease, config) {
    // Тяжёлая болезнь → смерть
    if (config.deathOnExpire) {
        gameState.isGameOver = true;
        return { spawned: null, progressed: null, died: true, reason: config.name };
    }
    
    // Лёгкая/средняя → следующая стадия
    const nextId = config.nextStage;
    if (nextId && DISEASES_CONFIG[nextId]) {
        disease.id = nextId;
        disease.ticksRemaining = DISEASES_CONFIG[nextId].duration;
        disease.progressed = true;
        
        return { 
            spawned: null, 
            progressed: DISEASES_CONFIG[nextId], 
            died: false 
        };
    }
    
    return { spawned: null, progressed: null, died: false };
}

// Лечение болезни (мгновенно убирает активную болезнь)
export function treatDisease() {
    if (!gameState.activeDisease) {
        return { success: false, message: "Нет активной болезни" };
    }
    
    const config = DISEASES_CONFIG[gameState.activeDisease.id];
    
    if (gameState.money < config.treatmentCost) {
        return { 
            success: false, 
            message: `Недостаточно денег! Нужно ${config.treatmentCost} 💰` 
        };
    }
    
    gameState.money -= config.treatmentCost;
    const treatedDisease = { ...gameState.activeDisease };
    gameState.activeDisease = null;
    
    return { 
        success: true, 
        message: `${config.name} вылечена!`,
        treatedDisease
    };
}

// Получить доп. падение здоровья от активной болезни
export function getDiseaseHealthDecayBonus() {
    if (!gameState.activeDisease) return 0;
    
    const config = DISEASES_CONFIG[gameState.activeDisease.id];
    return config.effects.healthDecayBonus;
}

// Проверить, блокирует ли болезнь тренировку
export function isDiseaseBlockingTraining() {
    if (!gameState.activeDisease) return false;
    
    const config = DISEASES_CONFIG[gameState.activeDisease.id];
    return config.effects.blockTraining;
}

// Получить информацию о болезни для UI
export function getActiveDiseaseInfo() {
    if (!gameState.activeDisease) return null;
    
    const config = DISEASES_CONFIG[gameState.activeDisease.id];
    return {
        ...config,
        ticksRemaining: gameState.activeDisease.ticksRemaining,
        canAfford: gameState.money >= config.treatmentCost
    };
}