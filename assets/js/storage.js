const KEY_ACTIVE = 'evolutionGame_active';
const KEY_LEGACY = 'evolutionGame_legacy';
const KEY_STATS = 'evolutionGame_stats';
const SECRET_KEY = 'SuperManEvolution_2026_Secure_Key_v1';

// --- Вспомогательные функции шифрования ---
function generateChecksum(data) {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 32-bit integer
    }
    return hash.toString(16);
}

function encrypt(text) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    // Современный способ кодирования Unicode в Base64
    return btoa(new TextEncoder().encode(result).reduce((data, byte) => data + String.fromCharCode(byte), ''));
}

function decrypt(base64Text) {
    try {
        const binary = atob(base64Text);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const text = new TextDecoder().decode(bytes);
        
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
        }
        return result;
    } catch (e) {
        return null; // Возвращаем null при ошибке или попытке подделки
    }
}

// --- Активная игра ---
export function saveActiveGame(state) {
    try {
        const { legacy, stats, ...activeState } = state;
        activeState.lastSaveTimestamp = Date.now();
        const jsonStr = JSON.stringify(activeState);
        const checksum = generateChecksum(jsonStr);
        const payload = JSON.stringify({ data: jsonStr, checksum });
        localStorage.setItem(KEY_ACTIVE, encrypt(payload));
    } catch (e) {
        console.error('Ошибка сохранения активной игры:', e);
    }
}

export function loadActiveGame() {
    const saved = localStorage.getItem(KEY_ACTIVE);
    if (!saved) return null;
    try {
        const decrypted = decrypt(saved);
        if (!decrypted) return null;
        const payload = JSON.parse(decrypted);
        
        // Проверка целостности данных
        if (generateChecksum(payload.data) !== payload.checksum) {
            console.warn('⚠️ Обнаружена попытка подделки сохранения! Загрузка отменена.');
            return null;
        }
        return JSON.parse(payload.data);
    } catch (e) {
        console.error('Ошибка загрузки активной игры:', e);
        return null;
    }
}

// --- Наследие и Статистика (аналогично защищаем) ---
export function saveLegacy(legacy) {
    try {
        const jsonStr = JSON.stringify(legacy);
        localStorage.setItem(KEY_LEGACY, encrypt(JSON.stringify({ data: jsonStr, checksum: generateChecksum(jsonStr) })));
    } catch (e) { console.error('Ошибка сохранения наследия:', e); }
}

export function loadLegacy() {
    const saved = localStorage.getItem(KEY_LEGACY);
    if (!saved) return null;
    try {
        const decrypted = decrypt(saved);
        if (!decrypted) return null;
        const payload = JSON.parse(decrypted);
        if (generateChecksum(payload.data) !== payload.checksum) return null;
        return JSON.parse(payload.data);
    } catch (e) { return null; }
}

export function hasLegacy() {
    const savedLegacy = loadLegacy();
    if (!savedLegacy) return false;
    return (savedLegacy.exchangeRateBonus || 0) > 0 || 
           (Array.isArray(savedLegacy.startingCrystals) && savedLegacy.startingCrystals.length > 0) ||
           (savedLegacy.inheritedHousing && savedLegacy.inheritedHousing !== 'box');
}

export function clearLegacy() { localStorage.removeItem(KEY_LEGACY); }

// --- Статистика ---
export function saveStats(stats) {
    try {
        const jsonStr = JSON.stringify(stats);
        localStorage.setItem(KEY_STATS, encrypt(JSON.stringify({ data: jsonStr, checksum: generateChecksum(jsonStr) })));
    } catch (e) { console.error('Ошибка сохранения статистики:', e); }
}

export function loadStats() {
    const saved = localStorage.getItem(KEY_STATS);
    if (!saved) return null;
    try {
        const decrypted = decrypt(saved);
        if (!decrypted) return null;
        const payload = JSON.parse(decrypted);
        if (generateChecksum(payload.data) !== payload.checksum) return null;
        return JSON.parse(payload.data);
    } catch (e) { return null; }
}

export function clearStats() { localStorage.removeItem(KEY_STATS); }
export function clearAll() {
    localStorage.removeItem(KEY_ACTIVE);
    localStorage.removeItem(KEY_LEGACY);
    localStorage.removeItem(KEY_STATS);
}

// Миграция со старого формата (удалит старые незащищенные сейвы и создаст защищенные)
export function migrateFromOldFormat() {
    const oldSave = localStorage.getItem('evolutionGame');
    if (!oldSave) return false;
    try {
        const data = JSON.parse(oldSave);
        if (data.legacy) saveLegacy(data.legacy);
        if (data.stats) saveStats(data.stats);
        if (!data.isGameOver) {
            const { legacy, stats, ...activeState } = data;
            saveActiveGame(activeState);
        }
        localStorage.removeItem('evolutionGame');
        console.log('✅ Миграция на защищенный формат завершена');
        return true;
    } catch (e) {
        console.error('Ошибка миграции:', e);
        return false;
    }
}