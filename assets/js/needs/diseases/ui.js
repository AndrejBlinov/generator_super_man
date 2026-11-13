// UI блока болезни

import { getActiveDiseaseInfo, treatDisease } from './logic.js';

// Рендер блока болезни (вызывается при изменении состояния)
export function renderDiseaseBlock() {
    const container = document.getElementById('diseaseContainer');
    if (!container) return;
    
    const diseaseInfo = getActiveDiseaseInfo();
    
    if (!diseaseInfo) {
        container.classList.add('hidden');
        container.innerHTML = '';
        return;
    }
    
    container.classList.remove('hidden');
    
    const percentage = (diseaseInfo.ticksRemaining / diseaseInfo.duration) * 100;
    const urgencyClass = percentage <= 25 ? 'critical' : percentage <= 50 ? 'warning' : '';
    
    container.innerHTML = `
        <div class="disease-header">
            <span class="disease-icon">${diseaseInfo.icon}</span>
            <div class="disease-info">
                <div class="disease-name">${diseaseInfo.name}</div>
                <div class="disease-desc">${diseaseInfo.description}</div>
            </div>
        </div>
        <div class="disease-timer">
            <div class="disease-timer-bar">
                <div class="disease-timer-fill ${urgencyClass}" style="width: ${percentage}%"></div>
            </div>
            <span class="disease-timer-text">Осталось: ${diseaseInfo.ticksRemaining} сек</span>
        </div>
        <button class="disease-treat-btn ${!diseaseInfo.canAfford ? 'disabled' : ''}" id="treatDiseaseBtn">
            💊 Вылечить (${diseaseInfo.treatmentCost} 💰)
        </button>
    `;
}

// Обновление таймера болезни (без полной перерисовки)
export function updateDiseaseUI() {
    const container = document.getElementById('diseaseContainer');
    if (!container) return;
    
    const diseaseInfo = getActiveDiseaseInfo();
    
    if (!diseaseInfo) {
        if (!container.classList.contains('hidden')) {
            renderDiseaseBlock();
        }
        return;
    }
    
    // Если блок скрыт — рендерим заново
    if (container.classList.contains('hidden')) {
        renderDiseaseBlock();
        return;
    }
    
    const percentage = (diseaseInfo.ticksRemaining / diseaseInfo.duration) * 100;
    const urgencyClass = percentage <= 25 ? 'critical' : percentage <= 50 ? 'warning' : '';
    
    const timerFill = container.querySelector('.disease-timer-fill');
    const timerText = container.querySelector('.disease-timer-text');
    const treatBtn = document.getElementById('treatDiseaseBtn');
    
    if (timerFill) {
        timerFill.style.width = `${percentage}%`;
        timerFill.className = `disease-timer-fill ${urgencyClass}`;
    }
    
    if (timerText) {
        timerText.textContent = `Осталось: ${diseaseInfo.ticksRemaining} сек`;
    }
    
    if (treatBtn) {
        treatBtn.classList.toggle('disabled', !diseaseInfo.canAfford);
    }
}

// Обработчик лечения (вызывается из main.js)
export function handleTreatDisease() {
    return treatDisease();
}