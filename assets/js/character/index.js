// Экспортируем всё, что связано с персонажем
export { initCharacter, updateCharacterStateFromGame } from './controller.js';
export { renderCharacter, updateCharacterState, initCanvasRenderer } from './renderer.js';
export { applyDiseaseEffects, clearDiseaseEffects } from './effects.js';