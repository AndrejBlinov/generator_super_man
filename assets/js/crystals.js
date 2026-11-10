// Логика кристаллов

import { gameState } from './state.js';
import { CRYSTAL_COST, MAX_CRYSTALS } from './config.js';
import { showMessage } from './ui.js';
import { renderCrystals } from './ui.js';

let selectedCrystalIndex = -1;

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

    const emptySlotIndex = gameState.crystals.findIndex(c => c === null);
    if (emptySlotIndex === -1) {
        showMessage("Освободите слот, объединив кристаллы!");
        return false;
    }

    gameState.evolutionPoints -= CRYSTAL_COST;
    gameState.crystals[emptySlotIndex] = {
        level: 1,
        income: 1
    };

    showMessage("Кристалл создан!");
    renderCrystals();
    return true;
}

export function selectCrystal(index) {
    if (gameState.crystals[index] === null) {
        selectedCrystalIndex = -1;
        renderCrystals();
        return;
    }

    if (selectedCrystalIndex === -1) {
        selectedCrystalIndex = index;
        renderCrystals();
    } else if (selectedCrystalIndex === index) {
        selectedCrystalIndex = -1;
        renderCrystals();
    } else {
        const firstCrystal = gameState.crystals[selectedCrystalIndex];
        const secondCrystal = gameState.crystals[index];

        if (firstCrystal.level === secondCrystal.level) {
            tryMerge(selectedCrystalIndex, index);
        } else {
            selectedCrystalIndex = index;
            renderCrystals();
        }
    }
}

function tryMerge(index1, index2) {
    const crystal1 = gameState.crystals[index1];
    const crystal2 = gameState.crystals[index2];

    const thirdIndex = gameState.crystals.findIndex((c, i) => 
        i !== index1 && i !== index2 && c !== null && c.level === crystal1.level
    );

    if (thirdIndex === -1) {
        showMessage("Нужно 3 кристалла одного уровня для слияния!");
        selectedCrystalIndex = -1;
        renderCrystals();
        return;
    }

    const newLevel = crystal1.level + 1;
    const newIncome = Math.pow(3, newLevel - 1);

    gameState.crystals[index1] = {
        level: newLevel,
        income: newIncome
    };
    gameState.crystals[index2] = null;
    gameState.crystals[thirdIndex] = null;

    selectedCrystalIndex = -1;
    showMessage(`Кристалл улучшен до уровня ${newLevel}!`);
    renderCrystals();
}

export function getSelectedCrystalIndex() {
    return selectedCrystalIndex;
}