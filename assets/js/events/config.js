export const EVENTS_CONFIG = {
    // ==========================================
    // 1. СОБЫТИЕ С АДАПТАЦИЕЙ ПОД КАРМУ
    // ==========================================
    "stray_dog": {
        id: "stray_dog",
        icon: "🐕",
        // Условие срабатывания
        conditions: {
            minAge: 18,
            maxAge: 95,
            // Не срабатывает, если у игрока тяжелая болезнь или меньше 100 денег (сафгард)
            blockedByDiseases: ["heavy_bleeding", "cancer", "organ_failure"], 
            minMoney: 100 
        },
        // Динамические варианты в зависимости от кармы
        variants: {
            good: {
                karmaMin: 40,
                title: "Верный друг",
                description: "К вашему порогу прибился чистый, виляющий хвостом пёс. Он смотрит на вас с надеждой и доверием.",
                choices: [
                    {
                        id: "adopt",
                        text: "Забрать домой (Требуется комфорт +10)",
                        reqComfort: 10,
                        effects: { 
                            comfort: -10, 
                            karma: 5, 
                            message: "Вы назвали его Бобиком. Он спит на ковре и греет вам ноги." 
                        }
                    },
                    {
                        id: "feed_and_shoo",
                        text: "Покормить и вежливо попросить уйти",
                        effects: { 
                            money: -50, 
                            karma: 2, 
                            message: "Пёс сыт и уходит в закат, махнув хвостом на прощание." 
                        }
                    }
                ]
            },
            bad: {
                karmaMax: 39,
                title: "Озлобленный зверь",
                description: "К вашему порогу прибилась грязная, ощетинившаяся собака. Она скалится и рычит, преграждая путь.",
                choices: [
                    {
                        id: "bribe",
                        text: "Бросить ей еду и медленно отойти",
                        effects: { 
                            money: -150, 
                            karma: -2, 
                            message: "Вы потеряли деньги на корм, но сохранили свои ноги целыми." 
                        }
                    },
                    {
                        id: "fight",
                        text: "Попытаться прогнать силой (Риск травмы!)",
                        effects: { 
                            health: -15, 
                            karma: -5, 
                            message: "Вы отбились, но собака успела вас укусить. Придется обработать рану." 
                        }
                    }
                ]
            }
        }
    },

    // ==========================================
    // 2. СОБЫТИЕ С МАСШТАБИРУЕМЫМИ ШТРАФАМИ (Поздняя игра)
    // ==========================================
    "tax_audit": {
        id: "tax_audit",
        icon: "📜",
        conditions: {
            minAge: 25,
            minMoney: 2000, // Срабатывает только если есть что терять
            weight: 8 // Относительно редкое событие
        },
        title: "Неожиданная налоговая проверка",
        description: "К вам пришли с проверкой. Обнаружены неучтенные доходы от продажи кристаллов. Нужно решить вопрос.",
        choices: [
            {
                id: "pay_fine",
                text: "Заплатить официальный штраф (15% от текущих денег)",
                effects: { 
                    // Функция вместо числа означает динамический расчет в logic.js
                    moneyPercentLoss: 0.15, 
                    karma: 3,
                    message: "Вы заплатили по счетам. Чиновники ушли, оставив вам квитанцию." 
                }
            },
            {
                id: "bribe_official",
                text: "Дать взятку (Фиксированно 1000 💰, но риск провала)",
                effects: { 
                    money: -1000, 
                    karma: -10,
                    message: "Чиновник взял конверт и молча ушел. Но осадочек остался." 
                }
            },
            {
                id: "refuse",
                text: "Отказаться платить (Штраф 30% + стресс)",
                effects: { 
                    moneyPercentLoss: 0.30, 
                    health: -10,
                    karma: -5,
                    message: "Вам выставили максимальный счет и изрядно потрепали нервы." 
                }
            }
        ]
    },

    // ==========================================
    // 3. СОБЫТИЕ-ЦЕПОЧКА (Свадьба / Отношения)
    // ==========================================
    "marriage_proposal": {
        id: "marriage_proposal",
        icon: "💍",
        conditions: {
            minAge: 20,
            maxAge: 60,
            weight: 5,
            // Срабатывает только раз за игру, если не было этого флага
            requiresFlagAbsent: "married" 
        },
        title: "Неожиданное предложение",
        description: "Ваша вторая половинка смотрит на вас с надеждой и достает маленькую коробочку. Пора принимать решение.",
        choices: [
            {
                id: "ring_cheap",
                text: "Купить простое кольцо (−500 💰)",
                effects: { 
                    money: -500, 
                    karma: 2,
                    message: "Вы сделали скромное, но искреннее предложение.",
                    // 🔑 ЗАПУСК ЦЕПОЧКИ:
                    setFlag: "engaged",
                    scheduleEvent: {
                        eventId: "wedding_planning",
                        delayDays: 30,
                        context: { ringTier: "cheap" }
                    }
                }
            },
            {
                id: "ring_expensive",
                text: "Купить роскошное кольцо (−3000 💰)",
                effects: { 
                    money: -3000, 
                    karma: 5,
                    message: "Кольцо сверкает так, что больно смотреть. Ваша половинка в восторге!",
                    setFlag: "engaged",
                    scheduleEvent: {
                        eventId: "wedding_planning",
                        delayDays: 30,
                        context: { ringTier: "expensive" }
                    }
                }
            },
            {
                id: "refuse",
                text: "Отказаться",
                effects: { 
                    karma: -15, 
                    health: -5,
                    message: "Вы объяснили, что не готовы. Отношения дали трещину.",
                    setFlag: "relationship_ended"
                }
            }
        ]
    },

    // Продолжение цепочки (будет вызвано через 30 дней)
    "wedding_planning": {
        id: "wedding_planning",
        icon: "🥂",
        // Это событие не имеет условий рандома, оно вызывается принудительно по таймеру
        isScheduled: true, 
        getDynamicTitle: (context) => context.ringTier === 'expensive' ? "Планирование пышной свадьбы" : "Планирование скромной свадьбы",
        getDynamicDescription: (context) => context.ringTier === 'expensive' 
            ? "После роскошного кольца ожидания от свадьбы завышены до небес. Какой будет банкет?" 
            : "Вы выбрали скромное кольцо, значит и свадьба будет камерной. Какой будет банкет?",
        choices: [
            {
                id: "wedding_modest",
                text: "Скромный банкет дома (−1000 💰)",
                effects: { 
                    money: -1000, 
                    karma: 2,
                    message: "Теплая, уютная свадьба в кругу самых близких. Вы установили флаг 'married'.",
                    setFlag: "married",
                    removeFlag: "engaged"
                }
            },
            {
                id: "wedding_grand",
                text: "Ресторан и тамада (−5000 💰)",
                effects: { 
                    money: -5000, 
                    karma: 5,
                    message: "Грандиозная вечеринка! Все соседи завидуют. Вы установили флаг 'married'.",
                    setFlag: "married",
                    removeFlag: "engaged"
                }
            }
        ]
    }
};

// Веса событий для рандома (чем выше число, тем чаще падает)
export const EVENT_WEIGHTS = {
    "stray_dog": 15,
    "tax_audit": 8,
    "marriage_proposal": 5
};