import { gameState } from '../state.js';
import { renderCharacter, updateCharacterState, initCanvasRenderer } from './renderer.js';
import { applyDiseaseEffects, clearDiseaseEffects } from './effects.js';

export function initCharacter() {
    const container = document.getElementById('characterStage');
    if (!container) return;
    
    renderCharacter(container);
    updateCharacterStateFromGame();
}

export function updateCharacterStateFromGame() {
    const state = {
        environment: getEnvironmentType(),
        health: gameState.needs?.health || 100,
        diseases: gameState.activeDiseases?.map(d => d.id) || [],
        isSick: (gameState.activeDiseases?.length || 0) > 0,
        isCritical: (gameState.needs?.health || 100) < 20
    };
    
    updateCharacterState(state);
}

function getEnvironmentType() {
    const totalIncome = gameState.crystals.reduce((sum, c) => sum + (c?.income || 0), 0);
    
    if (totalIncome >= 50) return 'luxury';
    if (totalIncome >= 20) return 'normal';
    if (totalIncome >= 5) return 'poor';
    return 'homeless';
}