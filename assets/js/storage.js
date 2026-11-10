import { gameState, setGameState, defaultGameState } from './state.js';

const SAVE_KEY = 'evolutionGame';

export function saveGame() {
    gameState.lastSaveTimestamp = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
}

export function loadGame() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            setGameState(loaded);
            return true;
        } catch (e) {
            console.error("Ошибка загрузки сохранения:", e);
            return false;
        }
    }
    return false;
}

export function clearSave() {
    localStorage.removeItem(SAVE_KEY);
}