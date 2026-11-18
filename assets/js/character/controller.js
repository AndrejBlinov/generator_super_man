import { gameState } from '../state.js';
import { CharacterCanvasRenderer } from './canvasRenderer.js';
import { HOUSING_CONFIG  } from './../config.js';

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

export function updateHousingInfo() {
    const housingNameEl = document.getElementById('housingName');
    const housingMaxComfortEl = document.getElementById('housingMaxComfort');
    const housingBonusEl = document.getElementById('housingBonus');
    const housingIconEl = document.querySelector('.housing-icon');
    
    if (!housingNameEl || !housingMaxComfortEl || !housingBonusEl || !housingIconEl) {
        console.warn('⚠️ [updateHousingInfo] Элементы не найдены');
        return;
    }

    // 🔑 Читаем текущее жильё из gameState
    const currentHousing = HOUSING_CONFIG[gameState.housing] || HOUSING_CONFIG.box;
    
    console.log('🏠 [updateHousingInfo] Текущее жильё:', gameState.housing, currentHousing.name);

    // Иконка
    const housingIcons = {
        box: '📦', shed: '🏚️', dilapidated: '🏠', old: '🏠',
        normal: '🏡', good: '🏡', mansion: '🏰'
    };
    housingIconEl.textContent = housingIcons[gameState.housing] || '📦';
    
    // Название
    housingNameEl.textContent = currentHousing.name;
    
    // Максимальный комфорт
    housingMaxComfortEl.textContent = currentHousing.maxComfort;
    
    // Бонус к доходу
    if (currentHousing.incomeMult > 1.0) {
        const bonusPercent = Math.round((currentHousing.incomeMult - 1) * 100);
        housingBonusEl.textContent = `+${bonusPercent}% к доходу`;
        housingBonusEl.style.color = '#28a745';
    } else {
        housingBonusEl.textContent = 'Без бонусов';
        housingBonusEl.style.color = '#6c757d';
    }
}