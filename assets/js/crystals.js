import { gameState } from './state.js';
import { CRYSTAL_COST } from './config.js';
import { showMessage } from './ui.js';
import { renderCrystals } from './ui.js';

let selectedCrystalIndex = -1;
let selectedCrystalZone = null; // 'active' или 'inventory'

export function calculatePassiveIncome() {
    // Только активные кристаллы генерируют доход
    return gameState.crystals.reduce((sum, crystal) => {
        return sum + (crystal ? crystal.income : 0);
    }, 0);
}

export function createCrystal() {
    if (gameState.evolutionPoints < CRYSTAL_COST) {
        showMessage("Недостаточно очков!");
        return false;
    }

    // Сначала ищем место в активных слотах
    let emptySlotIndex = gameState.crystals.findIndex(c => c === null);
    let zone = 'active';

    // Если активных слотов нет, ищем в инвентаре
    if (emptySlotIndex === -1) {
        emptySlotIndex = gameState.crystalsInventory.findIndex(c => c === null);
        zone = 'inventory';
    }

    if (emptySlotIndex === -1) {
        showMessage("Нет свободных слотов! Объедините кристаллы.");
        return false;
    }

    gameState.evolutionPoints -= CRYSTAL_COST;
    
    const newCrystal = { level: 1, income: 1 };
    if (zone === 'active') {
        gameState.crystals[emptySlotIndex] = newCrystal;
    } else {
        gameState.crystalsInventory[emptySlotIndex] = newCrystal;
    }

    showMessage("Кристалл создан!");
    renderCrystals();
    return true;
}

export function selectCrystal(zone, index) {
    const crystalsArray = zone === 'active' ? gameState.crystals : gameState.crystalsInventory;
    
    if (crystalsArray[index] === null) {
        // Клик по пустому слоту
        if (selectedCrystalIndex !== -1 && selectedCrystalZone !== zone) {
            // Попытка переместить кристалл из другой зоны
            moveCrystal(selectedCrystalZone, selectedCrystalIndex, zone, index);
        } else {
            // Просто сброс выбора
            selectedCrystalIndex = -1;
            selectedCrystalZone = null;
        }
        renderCrystals();
        return;
    }

    if (selectedCrystalIndex === -1) {
        // Первый выбор
        selectedCrystalIndex = index;
        selectedCrystalZone = zone;
        renderCrystals();
    } else if (selectedCrystalIndex === index && selectedCrystalZone === zone) {
        // Клик по тому же кристаллу - сброс
        selectedCrystalIndex = -1;
        selectedCrystalZone = null;
        renderCrystals();
    } else {
        // Клик по другому кристаллу
        const firstCrystal = getCrystal(selectedCrystalZone, selectedCrystalIndex);
        const secondCrystal = getCrystal(zone, index);

        if (firstCrystal.level === secondCrystal.level) {
            // Попытка слияния
            tryMerge(selectedCrystalZone, selectedCrystalIndex, zone, index);
        } else {
            // Переключение выбора
            selectedCrystalIndex = index;
            selectedCrystalZone = zone;
            renderCrystals();
        }
    }
}

function getCrystal(zone, index) {
    return zone === 'active' ? gameState.crystals[index] : gameState.crystalsInventory[index];
}

function setCrystal(zone, index, value) {
    if (zone === 'active') {
        gameState.crystals[index] = value;
    } else {
        gameState.crystalsInventory[index] = value;
    }
}

function moveCrystal(fromZone, fromIndex, toZone, toIndex) {
    const crystal = getCrystal(fromZone, fromIndex);
    if (!crystal) return;

    // Проверяем, что целевой слот пуст
    if (getCrystal(toZone, toIndex) !== null) {
        showMessage("Целевой слот занят!");
        selectedCrystalIndex = -1;
        selectedCrystalZone = null;
        renderCrystals();
        return;
    }

    // Перемещаем
    setCrystal(toZone, toIndex, crystal);
    setCrystal(fromZone, fromIndex, null);
    
    selectedCrystalIndex = -1;
    selectedCrystalZone = null;
    showMessage("Кристалл перемещен!");
    renderCrystals();
}

function tryMerge(zone1, index1, zone2, index2) {
    const crystal1 = getCrystal(zone1, index1);
    const crystal2 = getCrystal(zone2, index2);

    // Ищем третий кристалл того же уровня среди ВСЕХ 15 слотов
    let thirdZone = null;
    let thirdIndex = -1;

    // Ищем в активных слотах
    for (let i = 0; i < gameState.crystals.length; i++) {
        if (zone1 === 'active' && i === index1) continue;
        if (zone2 === 'active' && i === index2) continue;
        
        if (gameState.crystals[i] !== null && gameState.crystals[i].level === crystal1.level) {
            thirdZone = 'active';
            thirdIndex = i;
            break;
        }
    }

    // Если не нашли, ищем в инвентаре
    if (thirdIndex === -1) {
        for (let i = 0; i < gameState.crystalsInventory.length; i++) {
            if (zone1 === 'inventory' && i === index1) continue;
            if (zone2 === 'inventory' && i === index2) continue;
            
            if (gameState.crystalsInventory[i] !== null && gameState.crystalsInventory[i].level === crystal1.level) {
                thirdZone = 'inventory';
                thirdIndex = i;
                break;
            }
        }
    }

    if (thirdIndex === -1) {
        showMessage("Нужно 3 кристалла одного уровня для слияния!");
        selectedCrystalIndex = -1;
        selectedCrystalZone = null;
        renderCrystals();
        return;
    }

    // Слияние
    const newLevel = crystal1.level + 1;
    const newIncome = Math.pow(3, newLevel - 1);

    // Новый кристалл остается в слоте первого
    setCrystal(zone1, index1, { level: newLevel, income: newIncome });
    
    // Очищаем второй и третий слоты
    setCrystal(zone2, index2, null);
    setCrystal(thirdZone, thirdIndex, null);

    selectedCrystalIndex = -1;
    selectedCrystalZone = null;
    showMessage(`Кристалл улучшен до уровня ${newLevel}!`);
    renderCrystals();
}

export function getSelection() {
    return { index: selectedCrystalIndex, zone: selectedCrystalZone };
}