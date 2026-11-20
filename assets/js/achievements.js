import { gameState } from './state.js';

const ACHIEVEMENTS_KEY = 'evolutionGame_achievements';
export let unlockedAchievements = {};

// 🔑 Конфигурация достижений
export const ACHIEVEMENTS_CONFIG = [
    { id: 'first_click', icon: '🖱️', title: 'Первые шаги', desc: 'Накопите 10 Очков Эволюции', check: () => gameState.totalPointsEarned >= 10 },
    { id: 'first_crystal', icon: '💎', title: 'Кристалломан', desc: 'Создайте свой первый кристалл', check: () => gameState.crystals.some(c => c !== null) },
    { id: 'homeowner', icon: '🏠', title: 'Домовладелец', desc: 'Купите первое жилье лучше коробки', check: () => gameState.housing !== 'box' },
    { id: 'married', icon: '💍', title: 'Семьянин', desc: 'Вступите в законный брак', check: () => gameState.flags.includes('married') },
    { id: 'pet_owner', icon: '🐕', title: 'Лучший друг', desc: 'Заведите домашнего питомца', check: () => gameState.pet !== null },
    { id: 'rich', icon: '💰', title: 'Капиталист', desc: 'Накопите 50 000 💰', check: () => gameState.money >= 50000 },
    { id: 'survivor', icon: '👴', title: 'Долгожитель', desc: 'Доживите до 60 лет', check: () => gameState.ageInYears >= 60 },
    { id: 'scholar', icon: '🎓', title: 'Вечный студент', desc: 'Завершите курс обучения', check: () => gameState.flags.includes('course_done') }
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
export function checkAndUnlockAchievements() {
    let newUnlock = null;
    
    ACHIEVEMENTS_CONFIG.forEach(ach => {
        if (!unlockedAchievements[ach.id] && ach.check()) {
            unlockedAchievements[ach.id] = Date.now(); // Сохраняем дату получения
            saveAchievements();
            newUnlock = ach;
        }
    });

    if (newUnlock) {
        showAchievementToast(newUnlock);
    }
}

// 🔑 Показ тост-уведомления снизу
function showAchievementToast(ach) {
    const toast = document.getElementById('achievementToast');
    if (!toast) return;

    document.getElementById('toastIcon').textContent = ach.icon;
    document.getElementById('toastTitle').textContent = ach.title;
    document.getElementById('toastDesc').textContent = ach.desc;

    toast.classList.add('active');
    
    // Скрыть через 4 секунды
    setTimeout(() => {
        toast.classList.remove('active');
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