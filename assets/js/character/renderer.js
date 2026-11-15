import { CharacterCanvasRenderer } from './canvasRenderer.js';

let canvasRenderer = null;

// Инициализация Canvas-рендерера
export function initCanvasRenderer() {
    if (!canvasRenderer) {
        canvasRenderer = new CharacterCanvasRenderer('characterCanvas');
    }
    return canvasRenderer;
}

// Обновление состояния персонажа
export function updateCharacterState(state) {
    if (canvasRenderer) {
        canvasRenderer.updateState(state);
    }
}

// Рендер HTML-структуры (для мобильного fallback)
export function renderCharacter(container) {
    if (container.querySelector('#pixelHuman')) {
        return;
    }
    
    container.innerHTML = `
        <canvas id="characterCanvas" width="400" height="300"></canvas>
        <div class="character-caption" id="characterCaption">Герой готов к тренировкам</div>
        <div class="needs-compact" id="needsContainer"></div>
        <div class="disease-container hidden" id="diseaseContainer"></div>
    `;
    
    initCanvasRenderer();
}