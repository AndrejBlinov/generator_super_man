// assets/js/events/logic.js
import { gameState } from '../state.js';
import { EVENTS_CONFIG, EVENT_WEIGHTS } from './config.js';
import { showMessage } from '../ui.js'; // Убедись, что путь к ui.js правильный

// 🔑 ГЛАВНАЯ ФУНКЦИЯ: Вызывается из gameLoop раз в день
export function checkAndTriggerDailyEvent() {
    // 1. Если событие уже активно, игра на паузе, ничего не делаем
    if (gameState.activeEvent) return;

    // 2. Проверка кулдауна: не чаще, чем раз в 15 дней
    const currentAbsoluteDay = (gameState.absoluteAgeInYears * 365) + gameState.absoluteCurrentDayInYear;
    if (currentAbsoluteDay - gameState.lastEventDay < 15) return;

    // 3. Проверка отложенных (цепных) событий
    if (gameState.scheduledEvent) {
        if (currentAbsoluteDay >= gameState.scheduledEvent.triggerAtAbsoluteDay) {
            triggerScheduledEvent();
            return; // Приоритет у цепных событий
        }
    }

    // 4. Шанс выпадения случайного события (например, 8% в день, если прошел кулдаун)
    if (Math.random() > 0.08) return;

    // 5. Выбираем событие на основе весов
    const availableEvents = getAvailableEvents();
    if (availableEvents.length === 0) return;

    const totalWeight = availableEvents.reduce((sum, ev) => sum + ev.weight, 0);
    let random = Math.random() * totalWeight;

    let chosenEvent = null;
    for (const ev of availableEvents) {
        random -= ev.weight;
        if (random <= 0) {
            chosenEvent = ev;
            break;
        }
    }

    if (chosenEvent) {
        activateEvent(chosenEvent.id);
    }
}

// 🔑 ПРОВЕРКА УСЛОВИЙ (САФГАРДЫ)
function getAvailableEvents() {
    const available = [];
    const currentAbsoluteDay = (gameState.absoluteAgeInYears * 365) + gameState.absoluteCurrentDayInYear;

    for (const [id, config] of Object.entries(EVENTS_CONFIG)) {
        // Пропускаем события, которые вызываются только по расписанию
        if (config.isScheduled) continue;

        const cond = config.conditions || {};

        // Сафгард 1: Возраст
        if (cond.minAge && gameState.ageInYears < cond.minAge) continue;
        if (cond.maxAge && gameState.ageInYears > cond.maxAge) continue;

        // Сафгард 2: Ресурсы (не бьем нищих)
        if (cond.minMoney && gameState.money < cond.minMoney) continue;

        // Сафгард 3: Блокировка при тяжелых болезнях
        if (cond.blockedByDiseases && Array.isArray(cond.blockedByDiseases)) {
            const hasBlockedDisease = gameState.activeDiseases.some(d =>
                cond.blockedByDiseases.includes(d.id) || d.severity === 'heavy' // Универсальная защита
            );
            if (hasBlockedDisease) continue;
        }

        // Сафгард 4: Флаги (например, не предлагать свадьбу, если уже женат)
        if (cond.requiresFlagAbsent && gameState.flags.includes(cond.requiresFlagAbsent)) continue;
        if (cond.requiresFlagPresent && !gameState.flags.includes(cond.requiresFlagPresent)) continue;

        // Если все проверки пройдены, добавляем с его весом
        const weight = EVENT_WEIGHTS[id] || 10;
        available.push({ id, weight });
    }

    return available;
}

// 🔑 АКТИВАЦИЯ СОБЫТИЯ (Подготовка данных для UI)
function activateEvent(eventId) {
    const config = EVENTS_CONFIG[eventId];
    if (!config) return;

    let variantKey = 'default';
    let displayData = config;

    // Логика адаптации под карму
    if (config.variants) {
        if (config.variants.bad && gameState.karma <= (config.variants.bad.karmaMax || 39)) {
            variantKey = 'bad';
            displayData = { ...config, ...config.variants.bad }; // Объединяем, чтобы взять title/description/choices
        } else if (config.variants.good && gameState.karma >= (config.variants.good.karmaMin || 40)) {
            variantKey = 'good';
            displayData = { ...config, ...config.variants.good };
        }
    }

    // Динамические заголовки (для цепных событий)
    let finalTitle = displayData.title;
    let finalDesc = displayData.description;

    // Если это цепное событие и у него есть функции генерации текста
    if (config.isScheduled && gameState.scheduledEvent?.context) {
        const ctx = gameState.scheduledEvent.context;
        if (typeof displayData.getDynamicTitle === 'function') finalTitle = displayData.getDynamicTitle(ctx);
        if (typeof displayData.getDynamicDescription === 'function') finalDesc = displayData.getDynamicDescription(ctx);
    }

    gameState.activeEvent = {
        id: eventId,
        variantKey,
        title: finalTitle,
        description: finalDesc,
        icon: displayData.icon || '❓',
        choices: displayData.choices
    };

    // Обновляем UI, чтобы показать модалку и поставить игру на паузу
    if (typeof window.renderEventModal === 'function') {
        window.renderEventModal();
    }
}

// 🔑 ОБРАБОТКА ВЫБОРА ИГРОКА
export function resolveEventChoice(choiceIndex) {
    if (!gameState.activeEvent) return;

    const choice = gameState.activeEvent.choices[choiceIndex];
    if (!choice) return;

    const effects = choice.effects || {};

    // 1. Применяем числовые эффекты
    if (effects.money) gameState.money += effects.money;
    if (effects.comfort) gameState.needs.comfort = Math.max(0, Math.min(100, gameState.needs.comfort + effects.comfort));
    if (effects.health) gameState.needs.health = Math.max(0, Math.min(100, gameState.needs.health + effects.health));
    if (effects.karma) gameState.karma = Math.max(0, Math.min(100, gameState.karma + effects.karma));

    // 2. Динамические эффекты (% от денег)
    if (effects.moneyPercentLoss) {
        const loss = Math.floor(gameState.money * effects.moneyPercentLoss);
        gameState.money -= loss;
    }
    if (effects.moneyPercentGain) {
        const gain = Math.floor(gameState.money * effects.moneyPercentGain);
        gameState.money += gain;
    }

    // 3. Управление флагами
    if (effects.setFlag && !gameState.flags.includes(effects.setFlag)) {
        gameState.flags.push(effects.setFlag);
    }
    if (effects.removeFlag) {
        gameState.flags = gameState.flags.filter(f => f !== effects.removeFlag);
    }

    // 4. Добавление питомца
    if (effects.setPet) {
        gameState.pet = {
            type: effects.setPet.type,
            lifespanDays: effects.setPet.lifespanDays,
            daysLived: 0
        };
    }

    // 5. Планирование цепного события
    if (effects.scheduleEvent) {
        const currentAbsoluteDay = (gameState.absoluteAgeInYears * 365) + gameState.absoluteCurrentDayInYear;
        gameState.scheduledEvent = {
            eventId: effects.scheduleEvent.eventId,
            triggerAtAbsoluteDay: currentAbsoluteDay + effects.scheduleEvent.delayDays,
            context: effects.scheduleEvent.context || {}
        };
    }

    // 6. Показываем сообщение и очищаем активное событие
    if (effects.message) {
        showMessage(effects.message);
    }

    const currentAbsoluteDay = (gameState.absoluteAgeInYears * 365) + gameState.absoluteCurrentDayInYear;
    gameState.lastEventDay = currentAbsoluteDay;
    gameState.activeEvent = null;

    // Скрываем модалку и возобновляем игру
    if (typeof window.closeEventModal === 'function') {
        window.closeEventModal();
    }

    // Принудительно обновляем UI после изменений
    if (typeof window.updateUI === 'function') {
        window.updateUI();
    }
}

// 🔑 ОБРАБОТКА ЦЕПНЫХ СОБЫТИЙ
function triggerScheduledEvent() {
    const scheduled = gameState.scheduledEvent;
    if (!scheduled) return;

    activateEvent(scheduled.eventId);
    gameState.scheduledEvent = null; // Очищаем, так как событие активировано
}