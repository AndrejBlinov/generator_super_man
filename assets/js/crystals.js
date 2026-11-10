import { gameState } from './state.js';
import { CRYSTAL_COST } from './config.js';
import { showMessage } from './ui.js';
import { renderCrystals } from './ui.js';

let selectedCrystalIndex = -1;
let selectedCrystalZone = null;

export function calculatePassiveIncome() {
    return gameState.crystals.reduce((sum, crystal) => {
        return sum + (crystal ? crystal.income : 0);
    }, 0);
}

export function createCrystal() {
    if (gameState.evolutionPoints < CRYSTAL_COST) {
        showMessage("Недостаточно очков!");
        return false;
    }

    let emptySlotIndex = gameState.crystals.findIndex(c => c === null);
    let zone = 'active';

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

// 🔑 Массовое создание кристаллов
export function createCrystalBulk(count) {
    let created = 0;
    
    for (let i = 0; i < count; i++) {
        if (gameState.evolutionPoints < CRYSTAL_COST) break;
        
        let emptySlotIndex = gameState.crystals.findIndex(c => c === null);
        let zone = 'active';
        
        if (emptySlotIndex === -1) {
            emptySlotIndex = gameState.crystalsInventory.findIndex(c => c === null);
            zone = 'inventory';
        }
        
        if (emptySlotIndex === -1) break;
        
        gameState.evolutionPoints -= CRYSTAL_COST;
        const newCrystal = { level: 1, income: 1 };
        
        if (zone === 'active') {
            gameState.crystals[emptySlotIndex] = newCrystal;
        } else {
            gameState.crystalsInventory[emptySlotIndex] = newCrystal;
        }
        
        created++;
    }
    
    if (created > 0) {
        showMessage(`Создано ${created} кристалл(ов)!`);
        renderCrystals();
        return true;
    } else {
        showMessage("Недостаточно очков или нет свободных слотов!");
        return false;
    }
}

// 🔑 Максимальное количество кристаллов, которое можно создать
export function getMaxAffordableCrystals() {
    const affordableByMoney = Math.floor(gameState.evolutionPoints / CRYSTAL_COST);
    const emptyActiveSlots = gameState.crystals.filter(c => c === null).length;
    const emptyInventorySlots = gameState.crystalsInventory.filter(c => c === null).length;
    const totalEmptySlots = emptyActiveSlots + emptyInventorySlots;
    return Math.min(affordableByMoney, totalEmptySlots);
}

export function selectCrystal(zone, index) {
    const crystalsArray = zone === 'active' ? gameState.crystals : gameState.crystalsInventory;
    
    if (crystalsArray[index] === null) {
        if (selectedCrystalIndex !== -1 && selectedCrystalZone !== zone) {
            moveCrystal(selectedCrystalZone, selectedCrystalIndex, zone, index);
        } else {
            selectedCrystalIndex = -1;
            selectedCrystalZone = null;
        }
        renderCrystals();
        return;
    }

    if (selectedCrystalIndex === -1) {
        selectedCrystalIndex = index;
        selectedCrystalZone = zone;
        renderCrystals();
    } else if (selectedCrystalIndex === index && selectedCrystalZone === zone) {
        selectedCrystalIndex = -1;
        selectedCrystalZone = null;
        renderCrystals();
    } else {
        const firstCrystal = getCrystal(selectedCrystalZone, selectedCrystalIndex);
        const secondCrystal = getCrystal(zone, index);

        if (firstCrystal.level === secondCrystal.level) {
            tryMerge(selectedCrystalZone, selectedCrystalIndex, zone, index);
        } else {
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

    if (getCrystal(toZone, toIndex) !== null) {
        showMessage("Целевой слот занят!");
        selectedCrystalIndex = -1;
        selectedCrystalZone = null;
        renderCrystals();
        return;
    }

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

    let thirdZone = null;
    let thirdIndex = -1;

    for (let i = 0; i < gameState.crystals.length; i++) {
        if (zone1 === 'active' && i === index1) continue;
        if (zone2 === 'active' && i === index2) continue;
        
        if (gameState.crystals[i] !== null && gameState.crystals[i].level === crystal1.level) {
            thirdZone = 'active';
            thirdIndex = i;
            break;
        }
    }

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

    const newLevel = crystal1.level + 1;
    const newIncome = Math.pow(2, newLevel - 1);

    setCrystal(zone1, index1, { level: newLevel, income: newIncome });
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