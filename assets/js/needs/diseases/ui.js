// UI блока болезней (поддержка нескольких одновременных болезней)

import { getActiveDiseasesInfo, treatDisease } from './logic.js';

// 🔑 Рендер всех активных болезней
export function renderDiseaseBlock() {
    const container = document.getElementById('diseaseContainer');
    if (!container) return;
    
    const diseases = getActiveDiseasesInfo();
    
    if (diseases.length === 0) {
        container.classList.add('hidden');
        container.innerHTML = '';
        return;
    }
    
    container.classList.remove('hidden');
    
    container.innerHTML = diseases.map(disease => {
        const percentage = (disease.ticksRemaining / disease.duration) * 100;
        const urgencyClass = percentage <= 25 ? 'critical' : percentage <= 50 ? 'warning' : '';
        
        return `
            <div class="disease-item" data-disease-id="${disease.id}">
                <div class="disease-header">
                    <span class="disease-icon">${disease.icon}</span>
                    <div class="disease-info">
                        <div class="disease-name">${disease.name}</div>
                        <div class="disease-desc">${disease.description}</div>
                    </div>
                </div>
                <div class="disease-timer">
                    <div class="disease-timer-bar">
                        <div class="disease-timer-fill ${urgencyClass}" style="width: ${percentage}%"></div>
                    </div>
                    <span class="disease-timer-text">Осталось: ${disease.ticksRemaining} сек</span>
                </div>
                <button class="disease-treat-btn ${!disease.canAfford ? 'disabled' : ''}" data-treat="${disease.id}">
                    💊 Вылечить (${disease.treatmentCost} 💰)
                </button>
            </div>
        `;
    }).join('');
}

// 🔑 Обновление UI болезней (без полной перерисовки)
export function updateDiseaseUI() {
    const container = document.getElementById('diseaseContainer');
    if (!container) return;
    
    const diseases = getActiveDiseasesInfo();
    
    // 1. Если болезней нет, но блок виден — скрываем его
    if (diseases.length === 0) {
        if (!container.classList.contains('hidden')) {
            container.classList.add('hidden');
            container.innerHTML = '';
        }
        return;
    }
    
    // 2. Если блок был скрыт или количество болезней изменилось — полная перерисовка
    const currentCount = container.querySelectorAll('.disease-item').length;
    if (container.classList.contains('hidden') || currentCount !== diseases.length) {
        container.classList.remove('hidden');
        renderDiseaseBlock(); // Полная перерисовка безопаснее при изменении структуры
        return;
    }
    
    // 3. Точечное обновление (только если список болезней не менялся, просто тикает время)
    diseases.forEach(disease => {
        const item = container.querySelector(`[data-disease-id="${disease.id}"]`);
        if (!item) return;
        
        const percentage = (disease.ticksRemaining / disease.duration) * 100;
        const urgencyClass = percentage <= 25 ? 'critical' : percentage <= 50 ? 'warning' : '';
        
        const timerFill = item.querySelector('.disease-timer-fill');
        const timerText = item.querySelector('.disease-timer-text');
        const treatBtn = item.querySelector('.disease-treat-btn');
        
        if (timerFill) {
            timerFill.style.width = `${percentage}%`;
            timerFill.className = `disease-timer-fill ${urgencyClass}`;
        }
        
        if (timerText) {
            timerText.textContent = `Осталось: ${disease.ticksRemaining} сек`;
        }
        
        if (treatBtn) {
            // 🔑 Жесткая привязка состояния кнопки к текущим деньгам
            const canAffordNow = gameState.money >= disease.treatmentCost;
            treatBtn.disabled = !canAffordNow;
            treatBtn.classList.toggle('disabled', !canAffordNow);
        }
    });
}

// 🔑 Обработчик лечения (вызывается из main.js)
export function handleTreatDisease(diseaseId) {
    return treatDisease(diseaseId);
}
// © 2024–2026 Андрей Блинов. Все права защищены (All rights reserved).