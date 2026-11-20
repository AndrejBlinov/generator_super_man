// assets/js/tutorial.js
import { gameState } from './state.js';

// 🔑 Конфигурация шагов туториала
export const TUTORIAL_STEPS = [
    {
        id: 1,
        title: "🎯 Добро пожаловать!",
        text: "Давай научимся основам. Это займёт пару минут.",
        target: null, // Нет конкретного элемента
        condition: null, // Сразу переходим дальше
        autoAdvance: true
    },
    {
        id: 2,
        title: "💪 Тренировка",
        text: "Нажимай кнопку <strong>ТРЕНИРОВАТЬСЯ</strong> чтобы получать Очки Эволюции (ОЭ). Это твой основной ресурс.",
        target: "#trainBtn",
        condition: () => gameState.evolutionPoints >= 10,
        autoAdvance: false
    },
    {
        id: 3,
        title: "💎 Первый кристалл",
        text: "Открой панель <strong>Кристаллы</strong> и создай первый кристалл за 100 ОЭ. Он будет давать пассивный доход.",
        target: "[data-panel-target='crystalsPanel']",
        condition: () => gameState.crystals.some(c => c !== null),
        autoAdvance: false
    },
    {
        id: 4,
        title: "🛒 Магазин улучшений",
        text: "Открой <strong>Магазин</strong> и купи <strong>Замедление старения</strong> — это продлит жизнь персонажа.",
        target: "[data-panel-target='shopPanel']",
        condition: () => gameState.upgrades.slowAging > 0,
        autoAdvance: false
    },
    {
        id: 5,
        title: "💱 Автообмен",
        text: "Настрой <strong>автообмен ОЭ → 💰</strong> на 5 ОЭ. Деньги нужны для лечения и потребностей.",
        target: "[data-amount='5']",
        condition: () => gameState.autoExchangeAmount >= 5,
        autoAdvance: false
    },
    {
        id: 6,
        title: "💸 Авто-трата",
        text: "Включи <strong>авто-трату</strong> денег на потребности. Иначе персонаж умрёт от голода.",
        target: "#autoSpendToggle",
        condition: () => gameState.autoSpendEnabled === true,
        autoAdvance: false
    },
    {
        id: 7,
        title: "🍔 Потребности",
        text: "Следи за полосками <strong>Голод, Комфорт, Здоровье</strong> под персонажем. Не дай им упасть до 0!",
        target: "#needsContainer",
        condition: () => gameState.needs.hunger < 80, // Чтобы игрок увидел как они падают
        autoAdvance: false
    },
    {
        id: 8,
        title: "✅ Готово!",
        text: "Ты освоил основы! Теперь можешь играть самостоятельно. Удачи в эволюции!",
        target: null,
        condition: null,
        autoAdvance: true,
        isFinal: true
    }
];

// 🔑 Показать модалку туториала
export function showTutorialModal(step) {
    const modal = document.getElementById('tutorialModal');
    const title = document.getElementById('tutorialTitle');
    const text = document.getElementById('tutorialText');
    const nextBtn = document.getElementById('tutorialNextBtn');
    const skipBtn = document.getElementById('tutorialSkipBtn');
    const arrow = document.getElementById('tutorialArrow');

    if (!modal || !step) return;

    // Заполняем контент
    title.textContent = step.title;
    text.innerHTML = step.text;

    // Кнопки
    if (step.isFinal) {
        nextBtn.textContent = "Начать игру!";
        skipBtn.style.display = 'none';
    } else {
        nextBtn.textContent = step.autoAdvance ? "Понятно" : "Далее";
        skipBtn.style.display = 'block';
    }

    // Показываем модалку
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    // 🔑 Стрелка-указатель
    if (step.target) {
        const targetEl = document.querySelector(step.target);
        if (targetEl) {
            // Скроллим к элементу
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Показываем стрелку
            arrow.classList.add('active');
            positionArrow(targetEl, arrow);
        } else {
            arrow.classList.remove('active');
        }
    } else {
        arrow.classList.remove('active');
    }

    // Обработчики кнопок
    nextBtn.onclick = () => {
        hideTutorialModal();
        if (!step.isFinal) {
            gameState.tutorialStep++;
            saveTutorialProgress();
        } else {
            gameState.tutorialEnabled = false;
            saveTutorialProgress();
        }
    };

    skipBtn.onclick = () => {
        hideTutorialModal();
        gameState.tutorialEnabled = false;
        gameState.tutorialStep = TUTORIAL_STEPS.length;
        saveTutorialProgress();
    };
}

// 🔑 Скрыть модалку
export function hideTutorialModal() {
    const modal = document.getElementById('tutorialModal');
    const arrow = document.getElementById('tutorialArrow');
    
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
    if (arrow) {
        arrow.classList.remove('active');
    }
}

// 🔑 Позиционирование стрелки
function positionArrow(targetEl, arrow) {
    const rect = targetEl.getBoundingClientRect();
    const arrowSize = 40;
    
    // Вычисляем позицию стрелки (справа от элемента)
    let left = rect.right + 10;
    let top = rect.top + (rect.height / 2) - (arrowSize / 2);
    
    // Если элемент у правого края — показываем стрелку слева
    if (left + arrowSize > window.innerWidth) {
        left = rect.left - arrowSize - 10;
    }
    
    arrow.style.left = `${left}px`;
    arrow.style.top = `${top}px`;
}

// 🔑 Проверка условия текущего шага
export function checkTutorialCondition() {
    if (!gameState.tutorialEnabled) return;
    
    const currentStep = TUTORIAL_STEPS.find(s => s.id === gameState.tutorialStep);
    if (!currentStep || !currentStep.condition) return;
    
    // Проверяем условие
    if (currentStep.condition()) {
        // Условие выполнено — переходим к следующему шагу
        gameState.tutorialStep++;
        saveTutorialProgress();
        
        // Показываем следующий шаг через небольшую задержку
        setTimeout(() => {
            const nextStep = TUTORIAL_STEPS.find(s => s.id === gameState.tutorialStep);
            if (nextStep) {
                showTutorialModal(nextStep);
            }
        }, 500);
    }
}

// 🔑 Сохранение прогресса туториала
function saveTutorialProgress() {
    const savedActive = localStorage.getItem('evolutionGame_active');
    if (savedActive) {
        try {
            const state = JSON.parse(savedActive);
            state.tutorialEnabled = gameState.tutorialEnabled;
            state.tutorialStep = gameState.tutorialStep;
            localStorage.setItem('evolutionGame_active', JSON.stringify(state));
        } catch (e) {
            console.error('Ошибка сохранения туториала:', e);
        }
    }
}

// 🔑 Инициализация туториала при загрузке
export function initTutorial() {
    if (gameState.tutorialEnabled && gameState.tutorialStep > 0) {
        const currentStep = TUTORIAL_STEPS.find(s => s.id === gameState.tutorialStep);
        if (currentStep) {
            showTutorialModal(currentStep);
        }
    }
}