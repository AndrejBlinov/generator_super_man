// Рендер персонажа (HTML структура) — вызывается ОДИН раз при старте
export function renderCharacter(container) {
    // Проверяем, есть ли уже персонаж в контейнере
    if (container.querySelector('#pixelHuman')) {
        return; // Уже отрендерен, не трогаем
    }
    
    container.innerHTML = `
        <div class="pixel-human" id="pixelHuman">
            <div class="pixel-shadow"></div>
            <div class="pixel-head">
                <div class="pixel-hair"></div>
                <div class="pixel-eye pixel-eye-left"></div>
                <div class="pixel-eye pixel-eye-right"></div>
            </div>
            <div class="pixel-neck"></div>
            <div class="pixel-body"></div>
            <div class="pixel-arm pixel-arm-left"></div>
            <div class="pixel-arm pixel-arm-right"></div>
            <div class="pixel-leg pixel-leg-left"></div>
            <div class="pixel-leg pixel-leg-right"></div>
            <div class="health-effects" id="healthEffects"></div>
            <div class="hunger-effects" id="hungerEffects"></div>
        </div>
        <div class="character-caption" id="characterCaption">Герой готов к тренировкам</div>
        <div class="needs-compact" id="needsContainer"></div>
        <div class="disease-container hidden" id="diseaseContainer"></div>
    `;
}

// Обновление анимации (placeholder для canvas)
export function updateCharacterAnimation() {
    // Будет реализовано позже
}

export function syncAnimations() {
    const leftHuman = document.getElementById('pixelHuman');
    const rightHuman = document.getElementById('pixelHumanRight');
    
    if (!leftHuman || !rightHuman) return;
    
    // Копируем классы состояний
    rightHuman.className = leftHuman.className;
}