// Разделённая система сохранений
// - active: активная игра (удаляется при смерти)
// - legacy: наследие (сохраняется навсегда)
// - stats: общая статистика (накапливается между прохождениями)

const KEY_ACTIVE = 'evolutionGame_active';
const KEY_LEGACY = 'evolutionGame_legacy';
const KEY_STATS = 'evolutionGame_stats';

// ==========================================
// АКТИВНАЯ ИГРА
// ==========================================
export function saveActiveGame(state) {
    try {
        // Сохраняем всё, КРОМЕ legacy и stats (они живут отдельно)
        const { legacy, stats, ...activeState } = state;
        activeState.lastSaveTimestamp = Date.now();
        localStorage.setItem(KEY_ACTIVE, JSON.stringify(activeState));
    } catch (e) {
        console.error('Ошибка сохранения активной игры:', e);
    }
}

export function loadActiveGame() {
    const saved = localStorage.getItem(KEY_ACTIVE);
    if (!saved) return null;
    try {
        return JSON.parse(saved);
    } catch (e) {
        console.error('Ошибка загрузки активной игры:', e);
        return null;
    }
}

export function hasActiveGame() {
    return localStorage.getItem(KEY_ACTIVE) !== null;
}

export function clearActiveGame() {
    localStorage.removeItem(KEY_ACTIVE);
}

// ==========================================
// НАСЛЕДИЕ
// ==========================================
export function saveLegacy(legacy) {
    try {
        localStorage.setItem(KEY_LEGACY, JSON.stringify(legacy));
    } catch (e) {
        console.error('Ошибка сохранения наследия:', e);
    }
}

export function loadLegacy() {
    const saved = localStorage.getItem(KEY_LEGACY);
    if (!saved) return null;
    try {
        return JSON.parse(saved);
    } catch (e) {
        console.error('Ошибка загрузки наследия:', e);
        return null;
    }
}

export function hasLegacy() {
    const legacy = loadLegacy();
    if (!legacy) return false;
    return legacy.exchangeRateBonus > 0 ||
           legacy.startingCrystalsCount > 0 ||
           (legacy.startingAbilities && legacy.startingAbilities.length > 0);
}

export function clearLegacy() {
    localStorage.removeItem(KEY_LEGACY);
}

// ==========================================
// СТАТИСТИКА
// ==========================================
export function saveStats(stats) {
    try {
        localStorage.setItem(KEY_STATS, JSON.stringify(stats));
    } catch (e) {
        console.error('Ошибка сохранения статистики:', e);
    }
}

export function loadStats() {
    const saved = localStorage.getItem(KEY_STATS);
    if (!saved) return null;
    try {
        return JSON.parse(saved);
    } catch (e) {
        console.error('Ошибка загрузки статистики:', e);
        return null;
    }
}

export function clearStats() {
    localStorage.removeItem(KEY_STATS);
}

// ==========================================
// ОБЩИЕ ФУНКЦИИ
// ==========================================
export function clearAll() {
    localStorage.removeItem(KEY_ACTIVE);
    localStorage.removeItem(KEY_LEGACY);
    localStorage.removeItem(KEY_STATS);
}

// Миграция со старого формата (один ключ на всё)
export function migrateFromOldFormat() {
    const oldSave = localStorage.getItem('evolutionGame');
    if (!oldSave) return false;
    
    try {
        const data = JSON.parse(oldSave);
        
        // Сохраняем legacy, если он есть
        if (data.legacy) {
            saveLegacy(data.legacy);
        }
        
        // Сохраняем stats, если они есть
        if (data.stats) {
            saveStats(data.stats);
        }
        
        // Сохраняем active, если игра не закончена
        if (!data.isGameOver) {
            const { legacy, stats, ...activeState } = data;
            saveActiveGame(activeState);
        }
        
        // Удаляем старый ключ
        localStorage.removeItem('evolutionGame');
        console.log('✅ Миграция со старого формата завершена');
        return true;
    } catch (e) {
        console.error('Ошибка миграции:', e);
        return false;
    }
}