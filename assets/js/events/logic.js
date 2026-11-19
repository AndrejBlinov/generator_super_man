// assets/js/events/logic.js
import { gameState } from '../state.js';
import { EVENTS_CONFIG, EVENT_WEIGHTS } from './config.js';

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

    // 4. Шанс выпадения случайного события (например, 3% в день, если прошел кулдаун)
    if (Math.random() > 0.03) return;

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

    // 1. Определяем вариант (good/bad) на основе кармы
    if (config.variants) {
        if (config.variants.bad && gameState.karma <= (config.variants.bad.karmaMax || 39)) {
            variantKey = 'bad';
            displayData = { ...config, ...config.variants.bad };
        } else if (config.variants.good && gameState.karma >= (config.variants.good.karmaMin || 40)) {
            variantKey = 'good';
            displayData = { ...config, ...config.variants.good };
        }
    }

    // 2. Получаем контекст (безопасно, даже если его нет)
    const ctx = (gameState.scheduledEvent && gameState.scheduledEvent.context) ? gameState.scheduledEvent.context : {};

    // 3. Вычисляем заголовок и описание (Приоритет: Динамическая функция > Статическое поле > Фоллбек)
    let finalTitle = "Событие";
    let finalDesc = "Что-то произошло...";

    if (typeof displayData.getDynamicTitle === 'function') {
        finalTitle = displayData.getDynamicTitle(ctx);
    } else if (displayData.title) {
        finalTitle = displayData.title;
    }

    if (typeof displayData.getDynamicDescription === 'function') {
        finalDesc = displayData.getDynamicDescription(ctx);
    } else if (displayData.description) {
        finalDesc = displayData.description;
    }

    gameState.activeEvent = {
        id: eventId,
        variantKey,
        title: finalTitle,
        description: finalDesc,
        icon: displayData.icon || '❓',
        choices: displayData.choices
    };

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

    // 1. Применяем числовые эффекты (с умным масштабированием!)
    if (effects.moneyScaled !== undefined) {
        // Формула масштабирования: база * (1 + деньги/10000). Максимальный множитель x15.
        const multiplier = Math.max(1, Math.min(15, 1 + Math.floor(gameState.money / 10000)));
        const scaledAmount = Math.floor(effects.moneyScaled * multiplier);
        gameState.money += scaledAmount;
    } else if (effects.money) {
        // Обычные статичные суммы (для мелких трат, которые должны оставаться фиксированными)
        gameState.money += effects.money;
    }
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

    if (effects.setFlag === "course_done") {
        gameState.clickPower += 2; // Или другой бонус, например, пассивный доход
        showMessage("🧠 Ваши знания повысили силу клика на +2!");
    }

    // 3. Азартные игры (Gamble)
    if (effects.gamble) {
        const g = effects.gamble;
        if (g.cost > 0 && gameState.money < g.cost) {
            // Если не хватает денег, прерываем выбор и показываем ошибку в модалке
            if (typeof window.showEventResult === 'function') {
                window.showEventResult("❌ Недостаточно денег для этого действия!");
            }
            return;
        }

        gameState.money -= g.cost;
        if (Math.random() < g.winChance) {
            const winAmount = g.winAmount || Math.floor(g.cost * g.winMult);
            gameState.money += winAmount;
            effects._resultMessage = `🎉 ${g.winMsg} (+${winAmount} 💰)`;
        } else {
            effects._resultMessage = `😞 ${g.loseMsg}`;
        }
    }

    // 4. Добавление бесплатного кристалла (для НЛО и т.д.)
    if (effects.addFreeCrystal) {
        import('../crystals.js').then(module => {
            const newCrystal = { id: Date.now(), level: 1, exp: 0 };
            const emptySlot = gameState.crystalsInventory.findIndex(c => c === null);
            if (emptySlot !== -1) {
                gameState.crystalsInventory[emptySlot] = newCrystal;
                effects._crystalMsg = " 💎 Вы получили странный кристалл!";
            } else {
                effects._crystalMsg = " 💎 Инвентарь полон, кристалл потерян.";
            }
        });
    }

    // 5. Управление флагами и питомцами
    if (effects.setFlag && !gameState.flags.includes(effects.setFlag)) {
        gameState.flags.push(effects.setFlag);
    }
    if (effects.removeFlag) {
        gameState.flags = gameState.flags.filter(f => f !== effects.removeFlag);
    }
    if (effects.setPet) {
        gameState.pet = { type: effects.setPet.type, lifespanDays: effects.setPet.lifespanDays, daysLived: 0 };
        if (!gameState.flags.includes("has_dog")) gameState.flags.push("has_dog");
    }

    // 6. Планирование цепного события
    if (effects.scheduleEvent) {
        const currentAbsoluteDay = (gameState.absoluteAgeInYears * 365) + gameState.absoluteCurrentDayInYear;
        gameState.scheduledEvent = {
            eventId: effects.scheduleEvent.eventId,
            triggerAtAbsoluteDay: currentAbsoluteDay + effects.scheduleEvent.delayDays,
            context: effects.scheduleEvent.context || {}
        };
    }

    // 7. Формируем итоговое сообщение
    let finalMessage = effects.message || "Вы сделали свой выбор.";
    if (effects._resultMessage) finalMessage = effects._resultMessage;
    if (effects._crystalMsg) finalMessage += effects._crystalMsg;

    // 8. Обновляем день последнего события
    const currentAbsoluteDay = (gameState.absoluteAgeInYears * 365) + gameState.absoluteCurrentDayInYear;
    gameState.lastEventDay = currentAbsoluteDay;

    // Очищаем активное событие, но НЕ закрываем модалку сразу!
    gameState.activeEvent = null;

    // 9. Показываем экран результата внутри той же модалки
    if (typeof window.showEventResult === 'function') {
        window.showEventResult(finalMessage);
    }

    // Принудительно обновляем UI на фоне
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