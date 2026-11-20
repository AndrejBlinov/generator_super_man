export const COMPLEX_EVENTS = {
    // ==========================================
    // ЦЕПОЧКА 1: ОТНОШЕНИЯ
    // ==========================================
    "meet_stranger": {
        id: "meet_stranger", icon: "☕",
        conditions: { minAge: 18, maxAge: 70, minHousing: "dilapidated", requiresFlagAbsent: "in_relationship", weight: 6 },
        title: "Случайная встреча", description: "Вы случайно сталкиваетесь с приятным незнакомцем. Ваша чашка кофе оказывается на земле.",
        choices: [
            { id: "apologize_and_treat", text: "Извиниться и угостить новым кофе", effects: { moneyScaled: -100, karma: 5, message: "Лед тронулся! Вы обменялись номерами.", setFlag: "met_stranger", scheduleEvent: { eventId: "first_date", delayDays: 5, context: {} } } },
            { id: "ignore", text: "Пробурчать извинения и уйти", effects: { karma: -2, message: "Вы ушли, так и не узнав, как зовут этого человека." } }
        ]
    },
    "first_date": {
        id: "first_date", icon: "🍷",
        conditions: { requiresFlagPresent: "met_stranger", isScheduled: true },
        getDynamicTitle: () => "Первое свидание",
        getDynamicDescription: () => "Прошло несколько дней. Вы договариваетесь о встрече. Атмосфера немного неловкая, но перспективная.",
        choices: [
            { id: "fancy_restaurant", text: "Пойти в дорогой ресторан", effects: { moneyScaled: -1500, karma: 5, message: "Вечер прошел волшебно. Искра пробежала!", setFlag: "first_date_success", scheduleEvent: { eventId: "relationship_start", delayDays: 7, context: {} } } },
            { id: "walk_in_park", text: "Просто погулять в парке", effects: { money: -100, karma: 3, message: "Просто, но душевно. Вы отлично провели время.", setFlag: "first_date_success", scheduleEvent: { eventId: "relationship_start", delayDays: 7, context: {} } } },
            { id: "awkward_silence", text: "Молчать весь вечер и смотреть в телефон", effects: { karma: -5, message: "Свидание провалилось. Номер был удален.", removeFlag: "met_stranger" } }
        ]
    },
    "relationship_start": {
        id: "relationship_start", icon: "❤️",
        conditions: { requiresFlagPresent: "first_date_success", isScheduled: true },
        getDynamicTitle: () => "Начало романа",
        getDynamicDescription: () => "Вы официально начали встречаться! Жизнь заиграла новыми красками.",
        choices: [
            { id: "embrace", text: "Наслаждаться моментом", effects: { moneyScaled: -300, karma: 10, message: "Вы теперь пара! Флаг 'in_relationship' установлен.", setFlag: "in_relationship", scheduleEvent: { eventId: "relationship_crisis", delayDays: 60, context: {} } } }
        ]
    },
    "relationship_crisis": {
        id: "relationship_crisis", icon: "⛈️",
        conditions: { requiresFlagPresent: "in_relationship", isScheduled: true },
        getDynamicTitle: () => "Ссора из-за ерунды",
        getDynamicDescription: () => "Ваша половинка в ярости. Оказывается, вы в третий раз забыли купить зубную пасту.",
        choices: [
            { id: "apologize_profoundly", text: "Искренне извиниться и купить 10 тюбиков", effects: { moneyScaled: -500, karma: 5, message: "Кризис миновал. Отношения стали даже крепче.", setFlag: "crisis_resolved" } },
            { id: "defend", text: "Сказать, что это мелочи и вы устали", effects: { karma: -10, health: -5, message: "Ссора затянулась. Вы спите на диване.", removeFlag: "in_relationship" } }
        ]
    },
    "marriage_proposal": {
        id: "marriage_proposal", icon: "💍",
        conditions: { minAge: 20, maxAge: 65, requiresFlagPresent: "crisis_resolved", requiresFlagAbsent: "married", weight: 5 },
        title: "Время сделать следующий шаг", description: "Отношения крепки как никогда. Вы чувствуете, что пора предложить руку и сердце.",
        choices: [
            { id: "ring_cheap", text: "Купить простое кольцо", effects: { moneyScaled: -1000, karma: 5, message: "Скромно, но с любовью.", setFlag: "engaged", scheduleEvent: { eventId: "wedding_planning", delayDays: 30, context: { ringTier: "cheap" } } } },
            { id: "ring_expensive", text: "Купить роскошное кольцо с бриллиантом", effects: { moneyScaled: -5000, karma: 10, message: "Кольцо сверкает так, что ослепляет соседей!", setFlag: "engaged", scheduleEvent: { eventId: "wedding_planning", delayDays: 30, context: { ringTier: "expensive" } } } }
        ]
    },
    "wedding_planning": {
        id: "wedding_planning", icon: "📋",
        conditions: { requiresFlagPresent: "engaged", isScheduled: true },
        getDynamicTitle: (ctx) => ctx.ringTier === 'expensive' ? "Планирование пышной свадьбы" : "Планирование свадьбы",
        getDynamicDescription: (ctx) => ctx.ringTier === 'expensive' ? "После роскошного кольца ожидания завышены до небес." : "Вы хотите уютную и камерную свадьбу.",
        choices: [
            { id: "wedding_modest", text: "Скромный банкет дома или в кафе", effects: { moneyScaled: -2000, karma: 5, message: "Теплая, уютная свадьба в кругу самых близких.", setFlag: "married", removeFlag: "engaged" } },
            { id: "wedding_grand", text: "Ресторан, тамада и ледяной лебедь", effects: { moneyScaled: -10000, karma: 10, message: "Грандиозная вечеринка! Все соседи завидуют.", setFlag: ["married", "grand_wedding"], removeFlag: "engaged" } }
        ]
    },

    // ==========================================
    // ЦЕПОЧКА 2: ПИТОМЦЫ
    // ==========================================
    "stray_dog": {
        id: "stray_dog", icon: "🐕",
        conditions: { minAge: 18, blockedByDiseases: ["heavy_bleeding", "cancer"], minMoney: 100, weight: 6 },
        variants: {
            good: {
                karmaMin: 40, title: "Верный друг", description: "К вашему порогу прибился чистый, виляющий хвостом пёс.",
                choices: [
                    { id: "adopt", text: "Забрать домой (Требуется комфорт +10)", reqComfort: 10, effects: { comfort: -5, karma: 10, setPet: { type: 'dog', lifespanDays: 1095 }, message: "Вы назвали его Бобиком! Теперь он ест вашу еду." } },
                    { id: "feed_and_shoo", text: "Покормить и попросить уйти", effects: { moneyScaled: -50, karma: 2, message: "Пёс сыт и уходит в закат." } }
                ]
            },
            bad: {
                karmaMax: 39, title: "Озлобленный зверь", description: "Грязная, ощетинившаяся собака преграждает путь и рычит.",
                choices: [
                    { id: "bribe", text: "Бросить ей еду и отойти", effects: { moneyScaled: -150, karma: -2, message: "Вы потеряли деньги, но сохранили ноги." } },
                    { id: "fight", text: "Попытаться прогнать силой", effects: { health: -15, karma: -5, message: "Вы отбились, но собака успела вас укусить." } }
                ]
            }
        }
    },
    "vet_visit": {
        id: "vet_visit", icon: "🩺",
        conditions: { requiresFlagPresent: "has_dog", weight: 8 },
        title: "Визит к ветеринару", description: "Ваш питомец странно чихает и смотрит на вас с упреком.",
        choices: [
            { id: "pay_vet", text: "Отвести к врачу", effects: { moneyScaled: -800, karma: 5, message: "Питомец здоров и снова виляет хвостом." } },
            { id: "ignore_vet", text: "Надеяться, что само пройдет", effects: { karma: -10, message: "Питомец выглядит грустным.", scheduleEvent: { eventId: "pet_escape", delayDays: 10, context: {} } } }
        ]
    },
    "pet_escape": {
        id: "pet_escape", icon: "🏃",
        conditions: { requiresFlagPresent: "has_dog", isScheduled: true },
        getDynamicTitle: () => "Побег!",
        getDynamicDescription: () => "Вы просыпаетесь, а питомца нет. Дверь была приоткрыта.",
        choices: [
            { id: "search", text: "Обклеить район листовками и искать", effects: { moneyScaled: -500, karma: 5, message: "Через пару дней он нашелся! И притащил вам странную находку...", addRandomLowCrystal: true, setFlag: "pet_missing_resolved" } },
            { id: "give_up", text: "Смириться", effects: { karma: -15, health: -5, message: "Вы грустите. Питомец удален.", removeFlag: "has_dog" } }
        ]
    },
    "squirrel_mafia": {
        id: "squirrel_mafia", icon: "🐿️",
        conditions: { requiresFlagPresent: "has_dog", weight: 3 },
        title: "Беличья мафия", description: "Стая белок окружила ваш дом и требует дань.",
        choices: [
            { id: "pay_squirrels", text: "Высыпать орехи", effects: { moneyScaled: -200, karma: 5, message: "Белки довольны. Ваш пёс смотрит на вас с уважением." } },
            { id: "fight_squirrels", text: "Вступить в войну с белками", effects: { health: -20, karma: -10, message: "Вы проиграли. Белки украли ваши носки." } }
        ]
    },

    // ==========================================
    // ЦЕПОЧКА 3: ОБУЧЕНИЕ И РАЗВИТИЕ
    // ==========================================
    "online_course_ad": {
        id: "online_course_ad", icon: "💻",
        conditions: { minAge: 18, maxAge: 65, weight: 6 },
        title: "Реклама курса", description: "Вам таргетируется реклама: 'Стань мастером крипто-дизайна за 3 месяца!'",
        choices: [
            { id: "buy", text: "Купить курс", effects: { moneyScaled: -2000, karma: 2, message: "Вы записались. Придется учиться.", setFlag: "taking_course", scheduleEvent: { eventId: "course_completed", delayDays: 90, context: {} } } },
            { id: "skip", text: "Закрыть вкладку", effects: { karma: 0, message: "Вы сохранили деньги и время." } }
        ]
    },
    "course_completed": {
        id: "course_completed", icon: "🎓",
        conditions: { requiresFlagPresent: "taking_course", isScheduled: true },
        getDynamicTitle: () => "Курс завершен!",
        getDynamicDescription: () => "Вы получили сертификат. Знания уложились в голове.",
        choices: [
            { id: "apply", text: "Применить знания", effects: { message: "Ваши навыки улучшились! Сила клика увеличена навсегда.", setFlag: "course_done" } }
        ]
    },

    // ==========================================
    // ЦЕПОЧКА 4: ПРОБЛЕМЫ С ЖИЛЬЕМ
    // ==========================================
    "roof_leak": {
        id: "roof_leak", icon: "🌧️",
        conditions: { minHousing: "shed", weight: 5 },
        title: "Протечка крыши", description: "После ливня на потолке появилось желтое пятно, которое начинает капать.",
        choices: [
            { id: "fix_now", text: "Вызвать мастера", effects: { moneyScaled: -1200, comfort: 5, message: "Проблема решена профессионально." } },
            { id: "bucket", text: "Поставить тазик", effects: { comfort: -15, message: "Кап-кап-кап... Вы привыкли засыпать под эту симфонию.", setFlag: "has_leak", scheduleEvent: { eventId: "mold_growth", delayDays: 60, context: {} } } }
        ]
    },
    "mold_growth": {
        id: "mold_growth", icon: "🦠",
        conditions: { requiresFlagPresent: "has_leak", isScheduled: true },
        getDynamicTitle: () => "Плесень!",
        getDynamicDescription: () => "Из-за постоянной сырости в углу выросла колония плесени.",
        choices: [
            { id: "emergency_fix", text: "Срочный ремонт и дезинфекция", effects: { moneyScaled: -2500, health: 5, message: "Дорого, но вы спасли свои легкие.", removeFlag: "has_leak" } },
            { id: "ignore_health", text: "Терпеть", effects: { health: -20, comfort: -10, message: "Вы постоянно кашляете. Это плохо кончится." } }
        ]
    },
    "mysterious_inheritance": {
        id: "mysterious_inheritance", icon: "📜",
        conditions: { minAge: 30, weight: 3 },
        title: "Письмо от дальнего родственника", description: "Вам пришло уведомление о наследстве от троюродного дяди из Австралии.",
        choices: [
            { id: "claim", text: "Оформить документы", effects: { moneyScaled: -500, message: "Вы отправили документы. Ждите ответа.", setFlag: "claiming_inheritance", scheduleEvent: { eventId: "inheritance_result", delayDays: 45, context: {} } } },
            { id: "scam", text: "Это точно скам, удалить", effects: { karma: 2, message: "Вы поступили разумно." } }
        ]
    },
    "inheritance_result": {
        id: "inheritance_result", icon: "🦘",
        conditions: { requiresFlagPresent: "claiming_inheritance", isScheduled: true },
        getDynamicTitle: () => "Ответ из Австралии",
        getDynamicDescription: () => "Пришел финальный документ.",
        choices: [
            { id: "win", text: "Забрать наследство", effects: { moneyScaled: 15000, karma: 5, message: "Невероятно! Дядя оставил вам деньги и коллекцию бумерангов.", setFlag: "inheritance_won", removeFlag: "claiming_inheritance" } }
        ]
    }
};