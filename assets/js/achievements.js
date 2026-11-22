import { gameState, stats } from './state.js';
import { audioManager } from './audio.js';

const ACHIEVEMENTS_KEY = 'evolutionGame_achievements';
export let unlockedAchievements = {};

// 🔑 Конфигурация достижений
// 🔑 Конфигурация достижений (сгруппированы по механикам)
export const ACHIEVEMENTS_CONFIG = [
    // ===== РЕСУРСЫ И КЛИКИ =====
    { id: 'first_click', icon: '🖱️', title: 'Первые шаги', desc: 'Накопите 10 Очков Эволюции', check: () => gameState.totalPointsEarned >= 10 },
    { id: 'click_1k', icon: '⚡', title: 'Разминка', desc: 'Накопите 1 000 ОЭ за жизнь', check: () => gameState.totalPointsEarned >= 1000 },
    { id: 'click_100k', icon: '🔥', title: 'Марафонец', desc: 'Накопите 100 000 ОЭ за жизнь', check: () => gameState.totalPointsEarned >= 100000 },
    { id: 'crit_king', icon: '💥', title: 'Критическая масса', desc: 'Доведите Рентгеновское зрение до 5 уровня', check: () => gameState.upgrades.xrayVision >= 5 },
    { id: 'double_master', icon: '🦅', title: 'Двойной удар', desc: 'Доведите Левитацию до 5 уровня', check: () => gameState.upgrades.levitation >= 5 },

    // ===== ЭКОНОМИКА =====
    { id: 'first_ruble', icon: '💰', title: 'Первая копеечка', desc: 'Накопите 1 000 💰', check: () => gameState.money >= 1000 },
    { id: 'rich', icon: '💎', title: 'Капиталист', desc: 'Накопите 50 000 💰', check: () => gameState.money >= 50000 },
    { id: 'tycoon', icon: '🏦', title: 'Магнат', desc: 'Накопите 500 000 💰', check: () => gameState.money >= 500000 },
    { id: 'auto_rich', icon: '🤖', title: 'Пассивный доход', desc: 'Доведите пассивный доход до 100 ОЭ/день', check: () => gameState.crystals.reduce((s,c)=>s+(c?c.income:0),0) >= 100 },

    // ===== КРИСТАЛЛЫ =====
    { id: 'first_crystal', icon: '🔹', title: 'Кристалломан', desc: 'Создайте первый кристалл', check: () => gameState.crystals.some(c => c !== null) },
    { id: 'crystal_full', icon: '🔷', title: 'Полный комплект', desc: 'Заполните все 5 активных слотов кристаллами', check: () => gameState.crystals.every(c => c !== null) },
    { id: 'crystal_3', icon: '🔶', title: 'Слияние', desc: 'Получите кристалл 3 уровня', check: () => stats.highestCrystalLevel >= 3 },
    { id: 'crystal_5', icon: '🟣', title: 'Редкий камень', desc: 'Получите кристалл 5 уровня', check: () => stats.highestCrystalLevel >= 5 },
    { id: 'crystal_7', icon: '🌟', title: 'Сокровище', desc: 'Получите кристалл 7 уровня', check: () => stats.highestCrystalLevel >= 7 },

    // ===== СПОСОБНОСТИ =====
    { id: 'slow_age', icon: '🐢', title: 'Борьба со временем', desc: 'Доведите Замедление старения до 3 уровня', check: () => gameState.upgrades.slowAging >= 3 },
    { id: 'regen_max', icon: '💚', title: 'Живучий', desc: 'Доведите Регенерацию до максимума (10)', check: () => gameState.upgrades.regeneration >= 10 },
    { id: 'telekinesis', icon: '🧠', title: 'Сила мысли', desc: 'Доведите Телекинез до 5 уровня', check: () => gameState.upgrades.telekinesis >= 5 },
    { id: 'all_max', icon: '👑', title: 'Сверхчеловек', desc: 'Прокачайте ВСЕ способности до максимума', check: () => Object.values(gameState.upgrades).every(l => l >= 10) },

    // ===== ВЫЖИВАНИЕ И ВОЗРАСТ =====
    { id: 'survivor_40', icon: '🌱', title: 'Крепкий орешек', desc: 'Доживите до 40 лет', check: () => gameState.ageInYears >= 40 },
    { id: 'survivor_60', icon: '🌳', title: 'Долгожитель', desc: 'Доживите до 60 лет', check: () => gameState.ageInYears >= 60 },
    { id: 'survivor_80', icon: '🏔️', title: 'Мудрец', desc: 'Доживите до 80 лет', check: () => gameState.ageInYears >= 80 },
    { id: 'century', icon: '🕯️', title: 'Век живи', desc: 'Доживите до 100 лет', check: () => gameState.ageInYears >= 100 },

    // ===== БОЛЕЗНИ =====
    { id: 'tough', icon: '🩹', title: 'Не убиваемый', desc: 'Переживите болезнь без лечения (самоизлечение)', check: () => gameState.flags.includes('self_healed') },
    { id: 'doctor', icon: '💊', title: 'Здоровый образ', desc: 'Вылечите 3 болезни за поколение', check: () => (gameState.diseasesTreated || 0) >= 3 },
    
    // ===== КАРМА =====
    { id: 'saint', icon: '😇', title: 'Святоша', desc: 'Поднимите карму до 80+', check: () => gameState.karma >= 80 },
    { id: 'villain', icon: '😈', title: 'Тёмная сторона', desc: 'Уроните карму до 20-', check: () => gameState.karma <= 20 },

    // ===== СОБЫТИЯ =====
    { id: 'event_1', icon: '🎲', title: 'Первое приключение', desc: 'Переживите первое событие', check: () => gameState.eventsCompleted >= 1 },
    { id: 'event_10', icon: '🃏', title: 'Азартный игрок', desc: 'Переживите 10 событий', check: () => gameState.eventsCompleted >= 10 },
    { id: 'event_30', icon: '🎰', title: 'Ветеран судьбы', desc: 'Переживите 30 событий', check: () => gameState.eventsCompleted >= 30 },
    { id: 'alien', icon: '🛸', title: 'Контакт', desc: 'Встретьте НЛО', check: () => gameState.flags.includes('alien_contact') },
    { id: 'inheritance_win', icon: '🦘', title: 'Наследник', desc: 'Получите наследство от дяди', check: () => gameState.flags.includes('inheritance_won') },

    // ===== ОТНОШЕНИЯ =====
    { id: 'in_love', icon: '❤️', title: 'Сердце занято', desc: 'Начните роман', check: () => gameState.flags.includes('in_relationship') },
    { id: 'married', icon: '💍', title: 'Семьянин', desc: 'Вступите в брак', check: () => gameState.flags.includes('married') },
    { id: 'big_wedding', icon: '🎊', title: 'Свадьба века', desc: 'Сыграйте грандиозную свадьбу', check: () => gameState.flags.includes('grand_wedding') },

    // ===== ПИТОМЦЫ =====
    { id: 'pet_owner', icon: '🐕', title: 'Лучший друг', desc: 'Заведите питомца', check: () => gameState.pet !== null },
    { id: 'pet_rescue', icon: '🏃', title: 'Спаситель', desc: 'Найдите сбежавшего питомца', check: () => gameState.flags.includes('pet_missing_resolved') },

    // ===== ОБУЧЕНИЕ =====
    { id: 'scholar', icon: '🎓', title: 'Вечный студент', desc: 'Завершите курс обучения', check: () => gameState.flags.includes('course_done') },

    // ===== ЖИЛЬЁ =====
    { id: 'homeowner', icon: '🏠', title: 'Домовладелец', desc: 'Купите первое жильё лучше коробки', check: () => gameState.housing !== 'box' },
    { id: 'comfortable', icon: '🛋️', title: 'Уют', desc: 'Доберитесь до Обычного дома', check: () => ['normal','good','mansion'].includes(gameState.housing) },
    { id: 'mansion_owner', icon: '🏰', title: 'Особняк', desc: 'Купите Особняк', check: () => gameState.housing === 'mansion' },

    // ===== РОСКОШЬ =====
    { id: 'watch', icon: '⌚', title: 'Время — деньги', desc: 'Купите люксовые часы', check: () => gameState.luxuryItems.includes('luxury_watch') },
    { id: 'car', icon: '🏎️', title: 'Скорость', desc: 'Купите спорткар', check: () => gameState.luxuryItems.includes('sports_car') },
    { id: 'yacht', icon: '🛥️', title: 'Жизнь в кайф', desc: 'Купите яхту', check: () => gameState.luxuryItems.includes('yacht') },
    { id: 'luxury_set', icon: '💍', title: 'Светская львица', desc: 'Купите ВСЕ предметы роскоши', check: () => gameState.luxuryItems.length >= 5 },

    // ===== НАСЛЕДИЕ (ГЛОБАЛЬНОЕ) =====
    { id: 'generation_1', icon: '🧬', title: 'Перерождение', desc: 'Начните второе поколение', check: () => stats.runsCompleted >= 1 },
    { id: 'generation_5', icon: '🌀', title: 'Вечный круг', desc: 'Проживите 5 поколений', check: () => stats.runsCompleted >= 5 },
    { id: 'generation_10', icon: '♾️', title: 'Род не прервётся', desc: 'Проживите 10 поколений', check: () => stats.runsCompleted >= 10 },
    { id: 'legacy_rich', icon: '💱', title: 'Денежный мешок', desc: 'Доведите бонус курса обмена до +50%', check: () => stats.totalMoneyEarnedAllTime >= 100000 },
];

// 🔑 Загрузка из localStorage
export function loadAchievements() {
    const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (saved) {
        try { unlockedAchievements = JSON.parse(saved); } catch (e) { unlockedAchievements = {}; }
    }
}

// 🔑 Сохранение в localStorage
export function saveAchievements() {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlockedAchievements));
}

// 🔑 Проверка и разблокировка
// 🔑 Проверка и разблокировка (с очередью тостов)
let toastQueue = [];
let toastShowing = false;

export function checkAndUnlockAchievements() {
    ACHIEVEMENTS_CONFIG.forEach(ach => {
        if (!unlockedAchievements[ach.id] && ach.check()) {
            unlockedAchievements[ach.id] = Date.now();
            toastQueue.push(ach);
        }
    });
    if (toastQueue.length > 0) saveAchievements();
    processToastQueue();
}

function processToastQueue() {
    if (toastShowing || toastQueue.length === 0) return;
    toastShowing = true;
    const ach = toastQueue.shift();
    showAchievementToast(ach, () => {
        toastShowing = false;
        processToastQueue(); // показать следующую
    });
}

// 🔑 Показ тост-уведомления снизу (с коллбэком по завершении)
function showAchievementToast(ach, onDone) {
    const toast = document.getElementById('achievementToast');
    if (!toast) { toastShowing = false; return; }

    document.getElementById('toastIcon').textContent = ach.icon;
    document.getElementById('toastTitle').textContent = ach.title;
    document.getElementById('toastDesc').textContent = ach.desc;

    audioManager.playAchievement();

    toast.classList.add('active');
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => { if (onDone) onDone(); }, 400); // ждём окончания анимации выхода
    }, 4000);
}

// 🔑 Рендер модального окна ачивок
export function renderAchievementsModal() {
    const obtainedContainer = document.getElementById('achievementsObtained');
    const unobtainedContainer = document.getElementById('achievementsUnobtained');
    
    if (!obtainedContainer || !unobtainedContainer) return;

    obtainedContainer.innerHTML = '';
    unobtainedContainer.innerHTML = '';

    const obtainedList = [];
    const unobtainedList = [];

    ACHIEVEMENTS_CONFIG.forEach(ach => {
        if (unlockedAchievements[ach.id]) {
            const date = new Date(unlockedAchievements[ach.id]).toLocaleDateString('ru-RU');
            obtainedList.push({ ...ach, date });
        } else {
            unobtainedList.push(ach);
        }
    });

    // Сортируем полученные по дате (новые сверху)
    obtainedList.sort((a, b) => b.date.localeCompare(a.date));

    if (obtainedList.length === 0) {
        obtainedContainer.innerHTML = '<p style="color:#888; text-align:center; padding:20px;">Пока нет полученных достижений</p>';
    } else {
        obtainedList.forEach(ach => {
            obtainedContainer.innerHTML += `
                <div class="ach-item obtained">
                    <div class="ach-icon">${ach.icon}</div>
                    <div class="ach-info">
                        <div class="ach-title">${ach.title}</div>
                        <div class="ach-desc">${ach.desc}</div>
                        <div class="ach-date">Получено: ${ach.date}</div>
                    </div>
                </div>
            `;
        });
    }

    if (unobtainedList.length === 0) {
        unobtainedContainer.innerHTML = '<p style="color:#888; text-align:center; padding:20px;">🎉 Вы получили все достижения!</p>';
    } else {
        unobtainedList.forEach(ach => {
            unobtainedContainer.innerHTML += `
                <div class="ach-item unobtained">
                    <div class="ach-icon">🔒</div>
                    <div class="ach-info">
                        <div class="ach-title">???</div>
                        <div class="ach-desc">${ach.desc}</div>
                    </div>
                </div>
            `;
        });
    }
}