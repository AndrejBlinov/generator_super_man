import { gameState } from '../state.js';
import { CharacterCanvasRenderer } from './canvasRenderer.js';

let mainCanvasRenderer = null;

export function initCharacter() {
    const canvas = document.getElementById('characterCanvasMain');
    if (canvas && !mainCanvasRenderer) {
        mainCanvasRenderer = new CharacterCanvasRenderer(canvas);
        mainCanvasRenderer.start();
    }
    updateCharacterStateFromGame();
}

export function updateCharacterStateFromGame() {
    if (!mainCanvasRenderer) {
        console.warn('⚠️ [controller] Canvas-рендерер не инициализирован');
        return;
    }

    const comfort = gameState.needs?.comfort || 50;
    
    // 🔑 КЛЮЧЕВОЕ: передаём ПОЛ и все остальные данные
    const newState = {
        housing: gameState.housing || 'box',
        gender: gameState.gender || 'male',  // 🔑 ВОТ ЭТО!
        health: gameState.needs?.health || 100,
        hunger: gameState.needs?.hunger || 100,
        comfort: comfort,
        diseases: (gameState.activeDiseases || []).map(d => d.id),
        isCritical: (gameState.needs?.health || 100) < 20
    };
    
    console.log('🎮 [controller] Передаём в рендерер:', newState);
    mainCanvasRenderer.updateState(newState);

    if (typeof updateHousingInfo === 'function') {
        updateHousingInfo();
    }
}