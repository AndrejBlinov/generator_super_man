import { gameState } from '../state.js';
import { NEEDS_CONFIG } from './config.js';
import { getActiveDiseasesInfo } from './diseases/index.js';

export function getNeedState(needId) {
    const config = NEEDS_CONFIG[needId];
    const value = gameState.needs[needId];
    const percentage = (value / config.max) * 100;
    
    for (const [stateKey, stateConfig] of Object.entries(config.states)) {
        if (percentage >= stateConfig.min && percentage <= stateConfig.max) {
            return { key: stateKey, ...stateConfig, percentage };
        }
    }
    
    return { key: 'unknown', percentage };
}

export function applyCharacterStates() {
    const human = document.getElementById('pixelHuman');
    const stage = document.getElementById('characterStage');
    const caption = document.getElementById('characterCaption');
    const healthEffects = document.getElementById('healthEffects');
    const hungerEffects = document.getElementById('hungerEffects');
    
    if (!human || !stage || !caption) return;
    
    human.className = 'pixel-human';
    stage.classList.remove('env-luxury', 'env-normal', 'env-poor', 'env-homeless');
    
    if (healthEffects) healthEffects.innerHTML = '';
    if (hungerEffects) hungerEffects.innerHTML = '';
    
    let statusMessages = [];
    
    // 🔑 Приоритет: болезни имеют высший приоритет
    const diseases = getActiveDiseasesInfo();
    if (diseases.length > 0) {
        // Применяем визуал самой тяжёлой болезни
        const sortedDiseases = [...diseases].sort((a, b) => {
            const order = { light: 1, medium: 2, heavy: 3 };
            return order[b.category] - order[a.category];
        });
        
        const primaryDisease = sortedDiseases[0];
        human.classList.add(`disease-${primaryDisease.id}`);
        
        // 🔑 Показываем все болезни в статусе
        statusMessages.push(diseases.map(d => `${d.icon} ${d.name}`).join(' + '));
    }
    
    // Комфорт
    const comfortState = getNeedState('comfort');
    if (comfortState.environment) {
        stage.classList.add(`env-${comfortState.environment}`);
    }
    
    if (comfortState.key === 'homeless') {
        statusMessages.push("🌧️ На улице");
    } else if (comfortState.key === 'poor') {
        statusMessages.push("🏚️ В старом доме");
    } else if (comfortState.key === 'normal') {
        statusMessages.push("🏠 В обычном доме");
    } else if (comfortState.key === 'luxury') {
        statusMessages.push("🏰 В замке");
    }
    
    // Голод и здоровье — только если нет болезней
    if (diseases.length === 0) {
        const hungerState = getNeedState('hunger');
        if (hungerState.key === 'hungry') {
            human.classList.add('hungry');
            statusMessages.push("🍔 Голоден");
            if (hungerEffects) hungerEffects.innerHTML = '<div class="hunger-rumble"></div>';
        } else if (hungerState.key === 'starving') {
            human.classList.add('starving', 'lying-down');
            statusMessages.push("💀 Голодает!");
        }
        
        const healthState = getNeedState('health');
        if (healthState.key === 'sick') {
            human.classList.add('sick');
            statusMessages.push("🤒 Болеет");
            const randomEffect = healthState.effects[Math.floor(Math.random() * healthState.effects.length)];
            human.classList.add(`effect-${randomEffect}`);
            if (healthEffects) healthEffects.innerHTML = `<div class="health-effect-${randomEffect}"></div>`;
        } else if (healthState.key === 'critical') {
            human.classList.add('in-hospital', 'lying-down');
            statusMessages.push("🏥 В больнице");
        } else if (healthState.key === 'coma') {
            human.classList.add('in-coma', 'lying-down');
            statusMessages.push("💤 В КОМЕ!");
        }
    }
    
    if (statusMessages.length > 0) {
        caption.textContent = statusMessages.join(' • ');
    } else {
        caption.textContent = "✨ Герой готов к тренировкам";
    }
}