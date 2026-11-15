import { CharacterCanvasRenderer } from './canvasRenderer.js';

let canvasRenderer = null;

export function initCanvasRenderer() {
    const canvas = document.getElementById('characterCanvas');
    if (!canvas) {
        console.warn('⚠️ Canvas не найден');
        return null;
    }
    if (!canvasRenderer) {
        canvasRenderer = new CharacterCanvasRenderer(canvas);
    }
    canvasRenderer.start();
    return canvasRenderer;
}

export function updateCharacterState(state) {
    if (canvasRenderer) {
        canvasRenderer.updateState(state);
    }
}

export function renderCharacter(container) {
    if (container.querySelector('#pixelHuman')) return;
    container.innerHTML = `
        <div class="pixel-human" id="pixelHuman">
            <div class="pixel-shadow"></div>
            <div class="pixel-head"><div class="pixel-hair"></div><div class="pixel-eye pixel-eye-left"></div><div class="pixel-eye pixel-eye-right"></div></div>
            <div class="pixel-neck"></div><div class="pixel-body"></div>
            <div class="pixel-arm pixel-arm-left"></div><div class="pixel-arm pixel-arm-right"></div>
            <div class="pixel-leg pixel-leg-left"></div><div class="pixel-leg pixel-leg-right"></div>
            <div class="health-effects" id="healthEffects"></div>
            <div class="hunger-effects" id="hungerEffects"></div>
        </div>
        <div class="character-caption" id="characterCaption">Герой готов к тренировкам</div>
        <div class="needs-compact" id="needsContainer"></div>
        <div class="disease-container hidden" id="diseaseContainer"></div>
    `;
}