// assets/js/events/config.js

export const EVENTS_CONFIG = {
    // ==========================================
    // ЦЕПОЧКА 1: ОТНОШЕНИЯ (Реализм + Комедия)
    // ==========================================
    "meet_stranger": {
        id: "meet_stranger",
        icon: "☕",
        conditions: { minAge: 18, maxAge: 70, requiresFlagAbsent: "in_relationship", weight: 10 },
        title: "Случайная встреча",
        description: "В парке/кафе вы случайно сталкиваетесь с приятным незнакомцем. Ваша чашка кофе оказывается на земле, но взгляд говорит о многом.",
        choices: [
            {
                id: "apologize_and_treat",
                text: "Извиниться и угостить новым кофе (−100 💰)",
                effects: { 
                    money: -100, karma: 5, 
                    message: "Лед тронулся! Вы обменялись номерами.",
                    setFlag: "met_stranger",
                    scheduleEvent: { eventId: "first_date", delayDays: 5, context: {} }
                }
            },
            {
                id: "ignore",
                text: "Пробурчать извинения и уйти",
                effects: { karma: -2, message: "Вы ушли, так и не узнав, как зовут этого человека." }
            }
        ]
    },

    "first_date": {
        id: "first_date",
        icon: "🍷",
        title: "Первое свидание",
        conditions: { requiresFlagPresent: "met_stranger", isScheduled: true },
        getDynamicTitle: () => "Первое свидание",
        getDynamicDescription: () => "Прошло несколько дней. Вы договариваетесь о встрече. Атмосфера немного неловкая, но перспективная.",
        choices: [
            {
                id: "fancy_restaurant",
                text: "Пойти в дорогой ресторан (−1500 💰)",
                effects: { 
                    money: -1500, karma: 5, 
                    message: "Вечер прошел волшебно. Искра пробежала!",
                    setFlag: "first_date_success",
                    scheduleEvent: { eventId: "relationship_start", delayDays: 7, context: {} }
                }
            },
            {
                id: "walk_in_park",
                text: "Просто погулять в парке (−100 💰 на мороженое)",
                effects: { 
                    money: -100, karma: 3, 
                    message: "Просто, но душевно. Вы отлично провели время.",
                    setFlag: "first_date_success",
                    scheduleEvent: { eventId: "relationship_start", delayDays: 7, context: {} }
                }
            },
            {
                id: "awkward_silence",
                text: "Молчать весь вечер и смотреть в телефон",
                effects: { 
                    karma: -5, message: "Свидание провалилось. Номер был удален.",
                    removeFlag: "met_stranger"
                }
            }
        ]
    },

    "relationship_start": {
        id: "relationship_start",
        icon: "❤️",
        title: "Начало романа",
        conditions: { requiresFlagPresent: "first_date_success", isScheduled: true },
        getDynamicTitle: () => "Начало романа",
        getDynamicDescription: () => "Вы официально начали встречаться! Жизнь заиграла новыми красками, но и расходы немного выросли.",
        choices: [
            {
                id: "embrace",
                text: "Наслаждаться моментом (−300 💰/мес на совместный досуг)",
                effects: { 
                    money: -300, karma: 10, 
                    message: "Вы теперь пара! Флаг 'in_relationship' установлен.",
                    setFlag: "in_relationship",
                    scheduleEvent: { eventId: "relationship_crisis", delayDays: 60, context: {} }
                }
            }
        ]
    },

    "relationship_crisis": {
        id: "relationship_crisis",
        icon: "⛈️",
        conditions: { requiresFlagPresent: "in_relationship", isScheduled: true },
        getDynamicTitle: () => "Ссора из-за ерунды",
        getDynamicDescription: () => "Ваша половинка в ярости. Оказывается, вы в третий раз забыли купить 'ту самую' зубную пасту с ментолом.",
        choices: [
            {
                id: "apologize_profoundly",
                text: "Искренне извиниться и купить 10 тюбиков пасты (−500 💰)",
                effects: { 
                    money: -500, karma: 5, 
                    message: "Кризис миновал. Отношения стали даже крепче.",
                    setFlag: "crisis_resolved"
                }
            },
            {
                id: "defend",
                text: "Сказать, что это мелочи и вы устали",
                effects: { 
                    karma: -10, health: -5, 
                    message: "Ссора затянулась. Вы спите на диване.",
                    removeFlag: "in_relationship",
                    removeFlag: "crisis_resolved" // Разрыв
                }
            }
        ]
    },

    "marriage_proposal": {
        id: "marriage_proposal",
        icon: "💍",
        conditions: { minAge: 20, maxAge: 65, requiresFlagPresent: "crisis_resolved", requiresFlagAbsent: "engaged", weight: 5 },
        title: "Время сделать следующий шаг",
        description: "Отношения крепки как никогда. Вы чувствуете, что пора предложить руку и сердце.",
        choices: [
            {
                id: "ring_cheap",
                text: "Купить простое, но милое кольцо (−1000 💰)",
                effects: { 
                    money: -1000, karma: 5, message: "Скромно, но с любовью.",
                    setFlag: "engaged",
                    scheduleEvent: { eventId: "wedding_planning", delayDays: 30, context: { ringTier: "cheap" } }
                }
            },
            {
                id: "ring_expensive",
                text: "Купить роскошное кольцо с бриллиантом (−5000 💰)",
                effects: { 
                    money: -5000, karma: 10, message: "Кольцо сверкает так, что ослепляет соседей!",
                    setFlag: "engaged",
                    scheduleEvent: { eventId: "wedding_planning", delayDays: 30, context: { ringTier: "expensive" } }
                }
            }
        ]
    },

    "wedding_planning": {
        id: "wedding_planning",
        icon: "📋",
        conditions: { requiresFlagPresent: "engaged", isScheduled: true },
        getDynamicTitle: (ctx) => ctx.ringTier === 'expensive' ? "Планирование пышной свадьбы" : "Планирование свадьбы",
        getDynamicDescription: (ctx) => ctx.ringTier === 'expensive' ? "После роскошного кольца ожидания от свадьбы завышены до небес." : "Вы хотите уютную и камерную свадьбу.",
        choices: [
            {
                id: "wedding_modest",
                text: "Скромный банкет дома или в кафе (−2000 💰)",
                effects: { 
                    money: -2000, karma: 5, message: "Теплая, уютная свадьба в кругу самых близких.",
                    setFlag: "married", removeFlag: "engaged"
                }
            },
            {
                id: "wedding_grand",
                text: "Ресторан, тамада и ледяной лебедь (−10000 💰)",
                effects: { 
                    money: -10000, karma: 10, message: "Грандиозная вечеринка! Все соседи завидуют.",
                    setFlag: "married", removeFlag: "engaged"
                }
            }
        ]
    },

    // ==========================================
    // ЦЕПОЧКА 2: ПИТОМЦЫ (Реализм + Абсурд)
    // ==========================================
    "stray_dog": {
        id: "stray_dog",
        icon: "🐕",
        conditions: { minAge: 18, blockedByDiseases: ["heavy_bleeding", "cancer"], minMoney: 100, weight: 12 },
        variants: {
            good: {
                karmaMin: 40,
                title: "Верный друг",
                description: "К вашему порогу прибился чистый, виляющий хвостом пёс. Он смотрит на вас с надеждой.",
                choices: [
                    {
                        id: "adopt", text: "Забрать домой (Требуется комфорт +10)", reqComfort: 10,
                        effects: { comfort: -5, karma: 10, setPet: { type: 'dog', lifespanDays: 1095 }, message: "Вы назвали его Бобиком! Теперь он ест вашу еду." }
                    },
                    {
                        id: "feed_and_shoo", text: "Покормить и попросить уйти",
                        effects: { money: -50, karma: 2, message: "Пёс сыт и уходит в закат." }
                    }
                ]
            },
            bad: {
                karmaMax: 39,
                title: "Озлобленный зверь",
                description: "Грязная, ощетинившаяся собака преграждает путь и рычит.",
                choices: [
                    {
                        id: "bribe", text: "Бросить ей еду и отойти",
                        effects: { money: -150, karma: -2, message: "Вы потеряли деньги, но сохранили ноги." }
                    },
                    {
                        id: "fight", text: "Попытаться прогнать силой",
                        effects: { health: -15, karma: -5, message: "Вы отбились, но собака успела вас укусить." }
                    }
                ]
            }
        }
    },

    "vet_visit": {
        id: "vet_visit",
        icon: "🩺",
        conditions: { requiresFlagPresent: "has_dog", weight: 8 }, // Флаг ставится в logic.js при создании питомца
        title: "Визит к ветеринару",
        description: "Ваш питомец странно чихает и смотрит на вас с упреком. Пора сделать прививки.",
        choices: [
            {
                id: "pay_vet", text: "Отвести к врачу (−800 💰)",
                effects: { money: -800, karma: 5, message: "Питомец здоров и снова виляет хвостом." }
            },
            {
                id: "ignore_vet", text: "Надеяться, что само пройдет",
                effects: { karma: -10, message: "Питомец выглядит грустным. Вы чувствуете укол совести.", scheduleEvent: { eventId: "pet_escape", delayDays: 10, context: {} } }
            }
        ]
    },

    "pet_escape": {
        id: "pet_escape",
        icon: "🏃",
        conditions: { requiresFlagPresent: "has_dog", isScheduled: true },
        getDynamicTitle: () => "Побег!",
        getDynamicDescription: () => "Вы просыпаетесь, а питомца нет. Дверь была приоткрыта.",
        choices: [
            {
                id: "search", text: "Обклеить район листовками и искать (−500 💰)",
                effects: { 
                    money: -500, karma: 5, 
                    message: "Через пару дней он нашелся! И притащил вам странную находку...",
                    // Комедийный бонус: шанс найти кристалл
                    addRandomLowCrystal: true, 
                    setFlag: "pet_missing_resolved"
                }
            },
            {
                id: "give_up", text: "Смириться",
                effects: { karma: -15, health: -5, message: "Вы грустите. Питомец удален.", removeFlag: "has_dog" }
            }
        ]
    },

    // ==========================================
    // ЦЕПОЧКА 3: ЖИЛЬЕ И СОСЕДИ (Бытовой реализм)
    // ==========================================
    "noisy_neighbor": {
        id: "noisy_neighbor",
        icon: "🔊",
        conditions: { minAge: 18, requiresFlagAbsent: "mansion", weight: 15 }, // В особняке соседи не шумят
        title: "Ночной диджей",
        description: "Сосед за стеной включил техно в 3 часа ночи. Стены дрожат.",
        choices: [
            {
                id: "confront", text: "Пойти и поговорить (Риск конфликта)",
                effects: { health: -5, karma: -2, message: "Вас обматерили и захлопнули дверь. Но стало чуть тише." }
            },
            {
                id: "join", text: "Присоединиться к вечеринке",
                effects: { money: -200, health: -10, karma: 5, message: "Вы отлично провели ночь, но утром голова раскалывается." }
            },
            {
                id: "police", text: "Вызвать полицию",
                effects: { karma: 0, message: "Полиция приехала, составила протокол. Сосед затих, но затаил обиду." }
            }
        ]
    },

    "plumbing_disaster": {
        id: "plumbing_disaster",
        icon: "💦",
        conditions: { minMoney: 500, weight: 10 },
        title: "Потоп!",
        description: "Труба под раковиной дала течь. Вода хлещет на пол.",
        choices: [
            {
                id: "fix_self", text: "Починить самому (Требуется здоровье)",
                effects: { health: -15, money: -100, karma: 2, message: "Вы мокрый, грязный, но сэкономили деньги." }
            },
            {
                id: "call_master", text: "Вызвать сантехника (−1500 💰)",
                effects: { money: -1500, karma: 0, message: "Мастер приехал, все починил и взял тройную цену за срочность." }
            }
        ]
    },

    "mysterious_package": {
        id: "mysterious_package",
        icon: "📦",
        conditions: { weight: 7 },
        title: "Чужая посылка",
        description: "Курьер оставил у двери коробку с надписью 'Не вскрывать до 2030 года'.",
        choices: [
            {
                id: "open", text: "Вскрыть из любопытства",
                effects: { 
                    karma: -5, 
                    message: "Там оказалась коллекция резиновых уток предыдущего жильца. Бесполезно, но забавно." 
                }
            },
            {
                id: "return", text: "Отнести на почту",
                effects: { karma: 5, message: "Вы поступили как честный гражданин." }
            }
        ]
    },

    // ==========================================
    // ОДИНОЧНЫЕ СОБЫТИЯ: ФИНАНСЫ И АБСУРД
    // ==========================================
    "pyramid_scheme": {
        id: "pyramid_scheme",
        icon: "📈",
        conditions: { minMoney: 1000, weight: 8 },
        title: "Уникальная возможность!",
        description: "Старый знакомый предлагает вложиться в 'Квантовую Крипто-Воду'. Обещает 1000% прибыли!",
        choices: [
            {
                id: "invest", text: "Вложить 2000 💰 (Шанс 10% удвоить, 90% потерять)",
                effects: { 
                    // Логика шанса обрабатывается в logic.js, здесь просто флаг для обработчика
                    gamble: { cost: 2000, winChance: 0.1, winMult: 2, loseMsg: "Компания оказалась однодневкой. Вы потеряли деньги.", winMsg: "Невероятно! Схема сработала, вы получили прибыль!" }
                }
            },
            {
                id: "refuse", text: "Вежливо отказать",
                effects: { karma: 5, message: "Вы сохранили деньги и нервную систему." }
            }
        ]
    },

    "lottery_ticket": {
        id: "lottery_ticket",
        icon: "🎫",
        conditions: { weight: 12 },
        title: "Находка на улице",
        description: "Вы наступаете на лотерейный билет. Он уже оплачен!",
        choices: [
            {
                id: "scratch", text: "Стереть защитный слой",
                effects: { 
                    gamble: { cost: 0, winChance: 0.15, winAmount: 5000, loseMsg: "Увы, пустой билет.", winMsg: "ДЖЕКПОТ! Вы выиграли 5000 💰!" }
                }
            },
            {
                id: "trash", text: "Выбросить в урну",
                effects: { karma: 2, message: "Не стоит искать халяву." }
            }
        ]
    },

    "street_performer": {
        id: "street_performer",
        icon: "🎸",
        conditions: { weight: 15 },
        title: "Уличный музыкант",
        description: "Человек играет на картонной гитаре и поет о тяжелом бытии.",
        choices: [
            {
                id: "donate", text: "Дать 50 💰",
                effects: { money: -50, karma: 5, message: "Музыкант сыграл вам персональную серенаду." }
            },
            {
                id: "record", text: "Снять на видео для TikTok",
                effects: { 
                    gamble: { cost: 0, winChance: 0.3, winAmount: 300, loseMsg: "Ноль просмотров.", winMsg: "Видео залетело в рекомендации! Вы получили 300 💰 от платформы." }
                }
            }
        ]
    },

    "miracle_cure": {
        id: "miracle_cure",
        icon: "🧲",
        conditions: { minAge: 50, weight: 6 },
        title: "Целитель всея Руси",
        description: "В переходе вам предлагают 'Квантовый био-браслет', излечивающий от всего за 5000 💰.",
        choices: [
            {
                id: "buy", text: "Купить (−5000 💰)",
                effects: { money: -5000, health: 5, karma: -5, message: "Вы чувствуете себя немного лучше (эффект плацебо), но кошелек стал легче." }
            },
            {
                id: "ignore", text: "Пройти мимо",
                effects: { karma: 2, message: "Вы не поддаетесь на мошенничество." }
            }
        ]
    },

    "alien_abduction": {
        id: "alien_abduction",
        icon: "🛸",
        conditions: { minAge: 25, maxAge: 60, weight: 2 }, // Очень редкое
        title: "Яркий свет в окне",
        description: "Вы просыпаетесь посреди поля. В памяти пробел в 24 часа. Рядом лежит странный светящийся камень.",
        choices: [
            {
                id: "take_stone", text: "Забрать камень",
                effects: { 
                    health: -10, karma: 0, 
                    message: "Вы получили странный артефакт (это кристалл 1 уровня!). Но спина ужасно болит.",
                    addFreeCrystal: 1
                }
            },
            {
                id: "run", text: "Бежать домой без оглядки",
                effects: { health: -5, karma: 2, message: "Вы дома. Странные сны вам обеспечены." }
            }
        ]
    },

    "squirrel_mafia": {
        id: "squirrel_mafia",
        icon: "🐿️",
        conditions: { requiresFlagPresent: "has_dog", weight: 5 },
        title: "Беличья мафия",
        description: "Стая белок окружила ваш дом. Их вожак смотрит на вас и требует дань едой.",
        choices: [
            {
                id: "pay_squirrels", text: "Высыпать орехи (−200 💰 на еду)",
                effects: { money: -200, karma: 5, message: "Белки довольны. Ваш пёс смотрит на вас с уважением." }
            },
            {
                id: "fight_squirrels", text: "Вступить в войну с белками",
                effects: { health: -20, karma: -10, message: "Вы проиграли. Белки украли ваши носки." }
            }
        ]
    }
};

// Веса событий для рандома
export const EVENT_WEIGHTS = {
    "meet_stranger": 10, "first_date": 0, "relationship_start": 0, "relationship_crisis": 0,
    "marriage_proposal": 5, "wedding_planning": 0,
    "stray_dog": 12, "vet_visit": 8, "pet_escape": 0,
    "noisy_neighbor": 15, "plumbing_disaster": 10, "mysterious_package": 7,
    "pyramid_scheme": 8, "lottery_ticket": 12, "street_performer": 15,
    "miracle_cure": 6, "alien_abduction": 2, "squirrel_mafia": 5
};
// Вес 0 означает, что событие вызывается только принудительно через scheduleEvent (цепочка)