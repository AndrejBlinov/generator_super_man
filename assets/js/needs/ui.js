// UI-функции для потребностей: рендер и обновление

import { gameState } from '../state.js';
import { NEEDS_CONFIG } from './config.js';

// Рендер иконок потребностей
export function renderNeeds() {
    const container = document.getElementById('needsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.keys(NEEDS_CONFIG).forEach(needId => {
        const config = NEEDS_CONFIG[needId];
        const currentValue = Math.round(gameState.needs[needId]);
        const percentage = (currentValue / config.max) * 100;
        
        const needElement = document.createElement('div');
        needElement.className = 'need-compact-item';
        
        let statusClass = '';
        if (percentage <= 20) statusClass = 'critical';
        else if (percentage <= 50) statusClass = 'warning';
        
        needElement.innerHTML = `
            <div class="need-icon-wrapper ${statusClass}">
                <span class="need-icon">${config.icon}</span>
                <span class="need-value-compact">${currentValue}</span>
            </div>
            <button class="need-restore-btn-compact" data-need="${needId}" ${gameState.money < config.restoreCost ? 'disabled' : ''}>
                +${config.restoreAmount} (${config.restoreCost}💰)
            </button>
        `;
        
        container.appendChild(needElement);
    });
}

// Обновление прогресс-баров потребностей (без перерисовки DOM)
export function updateNeedsBars() {
    Object.keys(NEEDS_CONFIG).forEach(needId => {
        const config = NEEDS_CONFIG[needId];
        const currentValue = Math.round(gameState.needs[needId]);
        const percentage = (currentValue / config.max) * 100;
        
        const needItem = document.querySelector(`[data-need="${needId}"]`)?.closest('.need-compact-item');
        
        if (needItem) {
            const valueDisplay = needItem.querySelector('.need-value-compact');
            const iconWrapper = needItem.querySelector('.need-icon-wrapper');
            
            if (valueDisplay) {
                valueDisplay.textContent = currentValue;
            }
            
            if (iconWrapper) {
                iconWrapper.classList.remove('critical', 'warning');
                if (percentage <= 20) iconWrapper.classList.add('critical');
                else if (percentage <= 50) iconWrapper.classList.add('warning');
            }
        }
    });
}

// Обновление доступности кнопок восстановления
export function updateNeedRestoreButtons() {
    document.querySelectorAll('.need-restore-btn-compact').forEach((btn) => {
        const needId = btn.dataset.need;
        if (!needId) return;
        
        const config = NEEDS_CONFIG[needId];
        btn.disabled = gameState.money < config.restoreCost;
    });
}

// Ручное восстановление потребности (вызывается из main.js)
export function restoreNeedManual(needId) {
    const config = NEEDS_CONFIG[needId];
    
    if (gameState.money < config.restoreCost) {
        return { success: false, message: "Недостаточно денег!" };
    }
    
    gameState.money -= config.restoreCost;
    gameState.needs[needId] = Math.min(config.max, gameState.needs[needId] + config.restoreAmount);
    
    return { 
        success: true, 
        message: `${config.name} восстановлено!` 
    };
}