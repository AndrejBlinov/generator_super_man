import { gameState } from '../state.js';
import { renderCharacter, initCanvasRenderer, updateCharacterState } from './renderer.js';
import { applyDiseaseEffects, clearDiseaseEffects } from './effects.js';
import { HOUSING_CONFIG } from '../config.js';

export function initCharacter() {
    const container = document.getElementById('characterStage');
    if (container) renderCharacter(container);
    initCanvasRenderer();
    updateCharacterStateFromGame();
}

export function updateCharacterStateFromGame() {
    // CSS-человечек (для мобилки)
    const character = document.getElementById('pixelHuman');
    if (character) {
        character.className = 'pixel-human';
        clearDiseaseEffects(character);
        if (gameState.activeDiseases?.length > 0) applyDiseaseEffects(character, gameState.activeDiseases);
        if (gameState.needs?.hunger < 20) character.classList.add('starving');
        else if (gameState.needs?.hunger < 50) character.classList.add('hungry');
    }

    // Canvas-человечек (для десктопа)
    const comfort = gameState.needs?.comfort || 50;
    let env = 'homeless';
    if (comfort >= 80) env = 'luxury';
    else if (comfort >= 50) env = 'normal';
    else if (comfort >= 25) env = 'poor';

    updateCharacterState({
        environment: env,
        health: gameState.needs?.health || 100,
        hunger: gameState.needs?.hunger || 100,
        comfort: comfort,
        diseases: (gameState.activeDiseases || []).map(d => d.id),
        isSick: (gameState.activeDiseases || []).length > 0,
        isCritical: (gameState.needs?.health || 100) < 20,
        ageInYears: gameState.ageInYears || 30
    });
    updateHousingInfo();
}

function updateHousingInfo() {
    const housingNameEl = document.getElementById('housingName');
    const housingMaxComfortEl = document.getElementById('housingMaxComfort');
    const housingBonusEl = document.getElementById('housingBonus');
    const housingIconEl = document.querySelector('.housing-icon');
    
    if (!housingNameEl || !housingMaxComfortEl || !housingBonusEl || !housingIconEl) return;

    const currentHousing = HOUSING_CONFIG[gameState.housing] || HOUSING_CONFIG.box;
    
    const housingIcons = {
        box: '📦', shed: '🏚️', dilapidated: '🏠', old: '🏠',
        normal: '🏡', good: '🏡', mansion: '🏰'
    };
    housingIconEl.textContent = housingIcons[gameState.housing] || '📦';
    housingNameEl.textContent = currentHousing.name;
    housingMaxComfortEl.textContent = currentHousing.maxComfort;
    
    if (currentHousing.incomeMult > 1.0) {
        const bonusPercent = Math.round((currentHousing.incomeMult - 1) * 100);
        housingBonusEl.textContent = `+${bonusPercent}% к доходу`;
        housingBonusEl.style.color = '#28a745';
    } else {
        housingBonusEl.textContent = 'Без бонусов';
        housingBonusEl.style.color = '#6c757d';
    }
}