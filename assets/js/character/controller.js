import { gameState } from '../state.js';
import { renderCharacter, syncAnimations } from './renderer.js';
import { applyDiseaseEffects, clearDiseaseEffects } from './effects.js';

export function initCharacter() {
    const container = document.getElementById('characterStage');
    if (!container) return;
    
    renderCharacter(container);
    updateCharacterState();
}

export function updateCharacterState() {
    const character = document.getElementById('pixelHuman');
    if (!character) return;
    
    character.className = 'pixel-human';
    
    clearDiseaseEffects(character);
    if (gameState.activeDiseases && gameState.activeDiseases.length > 0) {
        applyDiseaseEffects(character, gameState.activeDiseases);
    }
    
    if (gameState.needs) {
        if (gameState.needs.hunger < 20) {
            character.classList.add('starving');
        } else if (gameState.needs.hunger < 50) {
            character.classList.add('hungry');
        }
    }
    
    // 🔑 Синхронизируем с правым человечком
    syncAnimations();
    
    updateEnvironment();
}

function updateEnvironment() {
    const stage = document.getElementById('animationStage');
    if (!stage) return;
    
    stage.classList.remove('env-luxury', 'env-normal', 'env-poor', 'env-homeless');
    
    const totalIncome = gameState.crystals.reduce((sum, c) => sum + (c?.income || 0), 0);
    
    if (totalIncome >= 50) {
        stage.classList.add('env-luxury');
    } else if (totalIncome >= 20) {
        stage.classList.add('env-normal');
    } else if (totalIncome >= 5) {
        stage.classList.add('env-poor');
    } else {
        stage.classList.add('env-homeless');
    }
}