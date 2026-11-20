export const SIMPLE_EVENTS = {
    // ==========================================
    // БЫТ И ЖИЛЬЕ
    // ==========================================
    "parking_ticket": {
        id: "parking_ticket", icon: "🚗",
        conditions: { requiresFlagAbsent: "box", weight: 7 },
        title: "Штраф за парковку", description: "Вы вернулись домой и обнаружили под дворником желтый конверт.",
        choices: [
            { id: "pay", text: "Заплатить штраф", effects: { moneyScaled: -800, karma: 2, message: "Вы заплатили. В следующий раз будете внимательнее." } },
            { id: "contest", text: "Попытаться оспорить (Шанс 40%)", effects: { gamble: { cost: 200, winChance: 0.4, winAmount: 800, loseMsg: "Суд отклонил жалобу.", winMsg: "Победа! Штраф аннулирован." } } }
        ]
    },
    "neighbor_cookies": {
        id: "neighbor_cookies", icon: "🍪",
        conditions: { requiresFlagAbsent: "box", weight: 7 },
        title: "Соседская благодарность", description: "Соседка сверху постучала в дверь и протянула тарелку с домашним печеньем.",
        choices: [
            { id: "accept", text: "Взять с благодарностью", effects: { comfort: 5, health: 2, karma: 3, message: "Печенье оказалось божественным." } },
            { id: "decline", text: "Вежливо отказаться", effects: { karma: -2, message: "Соседка выглядела немного расстроенной." } }
        ]
    },
    "pests": {
        id: "pests", icon: "🪳",
        conditions: { requiresFlagAbsent: "box", requiresFlagAbsent: "mansion", weight: 6 },
        title: "Незваные гости", description: "Вы заметили таракана на кухне. Судя по всему, он не один.",
        choices: [
            { id: "poison", text: "Купить отраву", effects: { moneyScaled: -600, comfort: 5, message: "Химическая атака прошла успешно." } },
            { id: "slipper", text: "Охотиться тапком", effects: { health: -5, comfort: -10, karma: -2, message: "Вы устали, а они всё равно бегут." } }
        ]
    },
    "landlord_gift": {
        id: "landlord_gift", icon: "🎩",
        conditions: { requiresFlagAbsent: "box", weight: 4 },
        title: "Щедрый арендодатель", description: "Владелец квартиры решил сделать небольшой ремонт за свой счет.",
        choices: [ { id: "thank", text: "Поблагодарить", effects: { comfort: 10, karma: 3, message: "Бытовая техника работает как часы." } } ]
    },
    "heatwave": {
        id: "heatwave", icon: "☀️",
        conditions: { weight: 6 },
        title: "Аномальная жара", description: "Кондиционеры в городе отключили из-за перегрузки сетей.",
        choices: [
            { id: "buy_water", text: "Закупиться водой и вентилятором", effects: { moneyScaled: -500, comfort: 5, health: 2, message: "Вы создали оазис прохлады." } },
            { id: "suffer", text: "Терпеть и открывать окна", effects: { comfort: -15, health: -5, message: "Ночь была бессонной и липкой." } }
        ]
    },
    "noisy_neighbor": {
        id: "noisy_neighbor", icon: "🔊",
        conditions: { minAge: 18, requiresFlagAbsent: "mansion", weight: 6 },
        title: "Ночной диджей", description: "Сосед за стеной включил техно в 3 часа ночи.",
        choices: [
            { id: "confront", text: "Пойти и поговорить", effects: { health: -5, karma: -2, message: "Вас обматерили и захлопнули дверь." } },
            { id: "join", text: "Присоединиться к вечеринке", effects: { moneyScaled: -200, health: -10, karma: 5, message: "Вы отлично провели ночь, но утром голова раскалывается." } },
            { id: "police", text: "Вызвать полицию", effects: { karma: 0, message: "Полиция приехала, составила протокол." } }
        ]
    },
    "plumbing_disaster": {
        id: "plumbing_disaster", icon: "💦",
        conditions: { minMoney: 500, weight: 5 },
        title: "Потоп!", description: "Труба под раковиной дала течь.",
        choices: [
            { id: "fix_self", text: "Починить самому", effects: { health: -15, moneyScaled: -100, karma: 2, message: "Вы мокрый, но сэкономили." } },
            { id: "call_master", text: "Вызвать сантехника", effects: { moneyScaled: -1500, karma: 0, message: "Мастер взял тройную цену за срочность." } }
        ]
    },

    // ==========================================
    // ФИНАНСЫ И РАБОТА
    // ==========================================
    "found_wallet": {
        id: "found_wallet", icon: "👛",
        conditions: { minAge: 16, weight: 8 },
        title: "Находка", description: "Вы нашли потерянный бумажник на скамейке.",
        choices: [
            { id: "keep", text: "Оставить деньги себе", effects: { moneyScaled: 300, karma: -5, message: "Вам повезло, но совесть немного грызет." } },
            { id: "return", text: "Отнести в полицию", effects: { karma: 10, message: "Вы поступили благородно." } }
        ]
    },
    "overtime_offer": {
        id: "overtime_offer", icon: "💼",
        conditions: { minAge: 18, maxAge: 65, weight: 7 },
        title: "Сверхурочная работа", description: "Начальник просит задержаться на выходные.",
        choices: [
            { id: "agree", text: "Согласиться", effects: { moneyScaled: 1500, health: -10, comfort: -10, message: "Вы заработали деньги, но спина говорит, что вы не молодеете." } },
            { id: "refuse", text: "Отказаться и отдохнуть", effects: { comfort: 10, health: 5, karma: 2, message: "Вы провели выходные на диване. Бесценно." } }
        ]
    },
    "tax_refund": {
        id: "tax_refund", icon: "🏦",
        conditions: { minAge: 18, weight: 5 },
        title: "Налоговый вычет", description: "Пришло уведомление: государство нашло переплату в ваших налогах.",
        choices: [ { id: "claim", text: "Оформить возврат", effects: { moneyScaled: 1200, karma: 2, message: "Приятный бонус к бюджету!" } } ]
    },
    "old_friend_debt": {
        id: "old_friend_debt", icon: "🤝",
        conditions: { minAge: 20, weight: 6 },
        title: "Долг друга", description: "Старый знакомый, который занимал у вас 1000 💰 год назад, внезапно вышел на связь.",
        choices: [
            { id: "demand", text: "Потребовать деньги назад", effects: { moneyScaled: 1000, karma: -3, message: "Он вернул деньги, но дружба закончилась." } },
            { id: "forgive", text: "Сказать 'забудь об этом'", effects: { karma: 10, message: "Вы поступили великодушно." } }
        ]
    },
    "pyramid_scheme": {
        id: "pyramid_scheme", icon: "📈",
        conditions: { minMoney: 1000, weight: 5 },
        title: "Уникальная возможность!", description: "Вам предлагают вложиться в 'Квантовую Крипто-Воду'.",
        choices: [
            { id: "invest", text: "Вложить 2000 💰", effects: { gamble: { cost: 2000, winChance: 0.1, winMult: 2, loseMsg: "Компания оказалась однодневкой.", winMsg: "Схема сработала, вы получили прибыль!" } } },
            { id: "refuse", text: "Вежливо отказать", effects: { karma: 5, message: "Вы сохранили деньги." } }
        ]
    },

    // ==========================================
    // ЗДОРОВЬЕ И ТЕЛО
    // ==========================================
    "flu_season": {
        id: "flu_season", icon: "🤧",
        conditions: { weight: 7 },
        title: "Сезон простуд", description: "Вы просыпаетесь с першением в горле и слабостью.",
        choices: [
            { id: "medicine", text: "Купить лекарства", effects: { moneyScaled: -400, health: 5, message: "Таблетки помогли, вы быстро пришли в себя." } },
            { id: "sleep", text: "Просто отлежаться", effects: { health: -10, message: "Вы пропустили день, валяясь под одеялом." } }
        ]
    },
    "insomnia": {
        id: "insomnia", icon: "🦉",
        conditions: { weight: 7 },
        title: "Бессонница", description: "Вы ворочаетесь с боку на бок уже третий час.",
        choices: [
            { id: "pills", text: "Выпить снотворное", effects: { moneyScaled: -300, health: 5, comfort: 5, message: "Вы наконец-то уснули крепким сном." } },
            { id: "scroll", text: "Листать ленту до утра", effects: { health: -10, comfort: -5, message: "Утро встретили с красными глазами." } }
        ]
    },
    "expired_food": {
        id: "expired_food", icon: "🥛",
        conditions: { weight: 6 },
        title: "Срок годности", description: "Вы налили молоко в хлопья, и оно свернулось.",
        choices: [
            { id: "throw", text: "Вылить и помыть чашку", effects: { comfort: -2, message: "Немного неприятно, но здоровье дороже." } },
            { id: "risk", text: "Рискнуть и выпить", effects: { gamble: { cost: 0, winChance: 0.6, winAmount: 0, loseMsg: "Живот скрутило. Вы теряете здоровье.", winMsg: "Пронесло! Желудок оказался крепким." } } }
        ]
    },
    "gym_bros": {
        id: "gym_bros", icon: "🏋️",
        conditions: { minAge: 16, maxAge: 50, weight: 6 },
        title: "Агрессивный маркетинг", description: "На улице к вам подошел парень и предлагает абонемент в зал со скидкой 90%.",
        choices: [
            { id: "buy", text: "Купить абонемент", effects: { moneyScaled: -2000, health: 5, karma: 2, message: "Вы купили абонемент. Может, это мотивирует вас?" } },
            { id: "run", text: "Сделать вид, что вы глухонемой", effects: { karma: -2, message: "Вы успешно сбежали от фитнес-гуру." } }
        ]
    },
    "miracle_cure": {
        id: "miracle_cure", icon: "🧲",
        conditions: { minAge: 50, weight: 4 },
        title: "Целитель всея Руси", description: "Вам предлагают 'Квантовый био-браслет'.",
        choices: [
            { id: "buy", text: "Купить", effects: { moneyScaled: -5000, health: 5, karma: -5, message: "Эффект плацебо, но кошелек стал легче." } },
            { id: "ignore", text: "Пройти мимо", effects: { karma: 2, message: "Вы не поддаетесь на мошенничество." } }
        ]
    },

    // ==========================================
    // СОЦИУМ И КАРМА
    // ==========================================
    "charity_request": {
        id: "charity_request", icon: "🐾",
        conditions: { minMoney: 200, weight: 8 },
        title: "Помощь приюту", description: "Волонтеры собирают средства на корм для животных.",
        choices: [
            { id: "donate_100", text: "Пожертвовать 100 💰", effects: { money: -100, karma: 8, message: "Спасибо от пушистых хвостиков!" } },
            { id: "donate_500", text: "Щедро пожертвовать 500 💰", effects: { money: -500, karma: 15, message: "Ваше имя внесли в доску почетных спонсоров." } },
            { id: "ignore", text: "Пройти мимо", effects: { karma: -2, message: "У каждого свои проблемы." } }
        ]
    },
    "homeless_person": {
        id: "homeless_person", icon: "🧍",
        conditions: { minMoney: 100, weight: 8 },
        title: "Просьба о помощи", description: "У входа в метро сидит человек и просит мелочи на еду.",
        choices: [
            { id: "give_50", text: "Дать 50 💰", effects: { money: -50, karma: 8, message: "Человек искренне поблагодарил вас." } },
            { id: "give_food", text: "Купить шаурму и отдать", effects: { money: -150, karma: 12, message: "Это гарантированно пойдет на еду." } },
            { id: "ignore", text: "Пройти мимо", effects: { karma: -3, message: "Вы сделали вид, что не заметили." } }
        ]
    },
    "found_phone": {
        id: "found_phone", icon: "📱",
        conditions: { weight: 7 },
        title: "Чужой смартфон", description: "Вы нашли на лавочке разблокированный телефон.",
        choices: [
            { id: "call_mom", text: "Позвонить маме и вернуть", effects: { karma: 15, message: "Владелец был в панике. Вы хороший человек." } },
            { id: "sell", text: "Сдать в ломбард", effects: { moneyScaled: 3000, karma: -15, message: "Легкие деньги. Но совесть будет напоминать об этом." } }
        ]
    },
    "street_performer": {
        id: "street_performer", icon: "🎸",
        conditions: { weight: 6 },
        title: "Уличный музыкант", description: "Человек играет на картонной гитаре.",
        choices: [
            { id: "donate", text: "Дать 50 💰", effects: { money: -50, karma: 5, message: "Музыкант сыграл вам серенаду." } },
            { id: "record", text: "Снять на видео для TikTok", effects: { gamble: { cost: 0, winChance: 0.3, winAmount: 300, loseMsg: "Ноль просмотров.", winMsg: "Видео залетело! Вы получили 300 💰." } } }
        ]
    },

    // ==========================================
    // АБСУРД И МЕЛОЧИ
    // ==========================================
    "unexpected_gift": {
        id: "unexpected_gift", icon: "🎁",
        conditions: { weight: 5 },
        title: "Посылка от бабушки", description: "Курьер привез коробку с домашними соленьями.",
        choices: [ { id: "eat", text: "Съесть соленья", effects: { health: 5, comfort: 5, message: "Вкусно, как в детстве!" } } ]
    },
    "internet_outage": {
        id: "internet_outage", icon: "📶",
        conditions: { weight: 6 },
        title: "Пропал интернет", description: "Провайдер проводит 'плановые работы' уже 5-й час.",
        choices: [
            { id: "read", text: "Почитать книгу", effects: { comfort: 5, health: 2, message: "Неожиданно приятно провести время без экрана." } },
            { id: "rage", text: "Звонить и ругаться с поддержкой", effects: { health: -5, karma: -3, message: "Вас переключали 10 раз и бросили трубку." } }
        ]
    },
    "wrong_delivery": {
        id: "wrong_delivery", icon: "📦",
        conditions: { minHousing: "shed", weight: 5 },
        title: "Чужая доставка", description: "Курьер оставил у вашей двери коробку с надписью 'Хрупкое: Коллекционные фигурки гоблинов'.",
        choices: [
            { id: "open", text: "Открыть и оставить себе", effects: { comfort: 5, karma: -5, message: "Теперь у вас есть армия гоблинов." } },
            { id: "return", text: "Отдать курьеру", effects: { karma: 5, message: "Вы поступили честно." } }
        ]
    },
    "pigeon_attack": {
        id: "pigeon_attack", icon: "🐦",
        conditions: { weight: 6 },
        title: "Птичья мафия", description: "Стая голубей решила, что ваша голова — идеальная посадочная площадка.",
        choices: [
            { id: "clean", text: "Срочно бежать в химчистку", effects: { moneyScaled: -400, comfort: 5, message: "Куртка спасена, но ваше достоинство пострадало." } },
            { id: "shake_fist", text: "Погрозить кулаком и отряхнуться", effects: { health: -2, comfort: -10, karma: -2, message: "Голуби посмотрели на вас с презрением." } }
        ]
    },
    "vending_machine": {
        id: "vending_machine", icon: "🥤",
        conditions: { minMoney: 100, weight: 7 },
        title: "Торговый автомат", description: "Автомат съел вашу монету, но не выдал банку газировки.",
        choices: [
            { id: "kick", text: "Пнуть автомат", effects: { gamble: { cost: 0, winChance: 0.3, winAmount: 100, loseMsg: "Вы только ушибли палец.", winMsg: "О чудо! Из автомата выпали ДВЕ банки и сдача!" } } },
            { id: "leave", text: "Махнуть рукой и уйти", effects: { karma: 2, message: "Вы сохранили палец и нервную систему." } }
        ]
    },
    "midlife_crisis": {
        id: "midlife_crisis", icon: "🏍️",
        conditions: { minAge: 35, maxAge: 55, weight: 4 },
        title: "Экзистенциальный кризис", description: "Вы смотрите в зеркало и думаете: 'Неужели это всё?'.",
        choices: [
            { id: "buy_silly", text: "Купить бесполезную, но крутую вещь", effects: { moneyScaled: -1500, comfort: 15, karma: 2, message: "Теперь у вас есть телескоп. Жизнь обрела новый смысл." } },
            { id: "meditate", text: "Глубоко вдохнуть и принять себя", effects: { health: 5, karma: 5, message: "Вы мудры. Кризис миновал без потерь." } }
        ]
    },
    "lucky_charm": {
        id: "lucky_charm", icon: "🍀",
        conditions: { weight: 5 },
        title: "Подкова на счастье", description: "Вы нашли ржавую подкову на дороге.",
        choices: [
            { id: "keep", text: "Повесить над дверью", effects: { comfort: 5, karma: 3, message: "Теперь она висит у вас. Стало спокойнее." } },
            { id: "ignore", text: "Оставить лежать", effects: { karma: -1, message: "Может, она принесет удачу следующему прохожему." } }
        ]
    },
    "mansion_party": {
        id: "mansion_party", icon: "🥂",
        conditions: { requiresFlagPresent: "mansion", weight: 5 },
        title: "Искушение богатством", description: "В вашем особняке так много места, что вы задумываетесь о вечеринке.",
        choices: [
            { id: "host", text: "Организовать бал", effects: { moneyScaled: -5000, karma: 10, comfort: 10, message: "Весь город обсуждает вашу вечеринку!" } },
            { id: "stay_home", text: "Остаться в тишине", effects: { comfort: 5, message: "Иногда тишина в большом доме — лучшая роскошь." } }
        ]
    },
    "alien_abduction": {
        id: "alien_abduction", icon: "🛸",
        conditions: { minAge: 25, maxAge: 60, weight: 2 },
        title: "Яркий свет в окне", description: "Вы просыпаетесь посреди поля. Рядом лежит странный светящийся камень.",
        choices: [
            { id: "take_stone", text: "Забрать камень", effects: { health: -10, karma: 0, message: "Вы получили странный артефакт!", addFreeCrystal: 1, setFlag: "alien_contact" } },
            { id: "run", text: "Бежать домой", effects: { health: -5, karma: 2, message: "Вы дома. Странные сны вам обеспечены." } }
        ]
    }
};