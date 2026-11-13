import { gameState, resetGameState } from './state.js';
import { loadGame, saveGame, clearSave } from './storage.js';
import { startGameLoop, stopGameLoop } from './gameLoop.js';
import { recalculateStats, buyUpgradeBulk, buyItemBulk } from './upgrades.js';
import { renderUI, updateUI, showCritPopup, showMessage, renderCrystals, renderUpgrades, showInheritanceModal } from './ui.js';
import { createCrystalBulk, selectCrystal, getMaxAffordableCrystals } from './crystals.js';
import { initPanels, setOnPanelOpenCallback, openPanel } from './panels.js';
import { canTrain, getTrainingBlockReason, restoreNeedManual, renderNeeds, handleTreatDisease, renderDiseaseBlock } from './needs/index.js';
import { applyInheritance } from './inheritance.js';

// ==========================================
// 1. ЛОГИКА ИГРОВОГО ДВИЖКА
// ==========================================
function startGameEngine() {
    recalculateStats();
    renderUI();
    startGameLoop();
}

function stopGameEngine() {
    stopGameLoop();
}

// ==========================================
// 2. ЛОГИКА ГЛАВНОГО МЕНЮ
// ==========================================
function showMainMenu() {
    const menu = document.getElementById('mainMenu');
    const app = document.getElementById('gameApp');
    const btnContainer = document.getElementById('menuButtons');
    
    menu.style.display = 'flex';
    app.style.display = 'none';
    stopGameEngine();
    btnContainer.innerHTML = '';
    
    // Загружаем сохранение, чтобы проверить состояние
    const hasSave = loadGame();
    const isAlive = !gameState.isGameOver;
    const hasLegacy = gameState.legacy && (
        gameState.legacy.exchangeRateBonus > 0 || 
        gameState.legacy.startingCrystalsCount > 0 || 
        (gameState.legacy.startingAbilities && gameState.legacy.startingAbilities.length > 0)
    );

    // 1. Кнопка "Продолжить" (только если есть сохранение и персонаж жив)
    if (hasSave && isAlive) {
        const btn = document.createElement('button');
        btn.className = 'menu-btn';
        btn.textContent = '▶️ Продолжить игру';
        btn.onclick = () => {
            menu.style.display = 'none';
            app.style.display = 'block';
            startGameEngine();
        };
        btnContainer.appendChild(btn);
    }

    // 2. Кнопка "С бонусами наследия" (если есть накопленные бонусы)
    if (hasLegacy) {
        const btn = document.createElement('button');
        btn.className = 'menu-btn secondary';
        btn.textContent = '🧬 Начать новую игру с бонусами наследия';
        btn.onclick = () => {
            applyInheritance(false);
            menu.style.display = 'none';
            app.style.display = 'block';
            startGameEngine();
        };
        btnContainer.appendChild(btn);
    }

    // 3. Кнопка "Новая игра" (ВСЕГДА доступна)
    const newGameBtn = document.createElement('button');
    newGameBtn.className = 'menu-btn danger';
    newGameBtn.textContent = hasSave ? '🔄 Новая игра (сбросить текущий прогресс)' : '🔄 Новая игра';
    newGameBtn.onclick = () => {
        const warning = hasSave 
            ? "⚠️ ВНИМАНИЕ: Это удалит текущее сохранение, болезни, кристаллы и деньги. Весь непрогрессировавший в наследие прогресс будет потерян. Продолжить?"
            : "Начать совершенно новую игру?";
            
        if (confirm(warning)) {
            clearSave();
            resetGameState(false);
            menu.style.display = 'none';
            app.style.display = 'block';
            startGameEngine();
        }
    };
    btnContainer.appendChild(newGameBtn);
}

// ==========================================
// 3. ПРИВЯЗКА СОБЫТИЙ (выполняется 1 раз)
// ==========================================
function bindEvents() {
    document.getElementById('trainBtn').addEventListener('click', (event) => {
        if (gameState.isGameOver) return;
        if (!canTrain()) {
            showMessage(getTrainingBlockReason());
            return;
        }

        const hero = document.getElementById('pixelHuman');
        if (hero) {
            hero.classList.remove('is-training');
            void hero.offsetWidth;
            hero.classList.add('is-training');
            setTimeout(() => hero.classList.remove('is-training'), 350);
        }

        let earned = gameState.clickPower;
        let isDoubleClick = false;
        let isCrit = false;

        if (Math.random() < gameState.doubleClickChance) {
            earned *= 2;
            isDoubleClick = true;
        }
        if (Math.random() < gameState.critChance) {
            earned *= gameState.critMultiplier;
            isCrit = true;
        }

        if (isCrit || isDoubleClick) {
            let popupText = isDoubleClick && isCrit ? `ДВОЙНОЙ + КРИТ! +${Math.round(earned)}` :
                            isDoubleClick ? `ДВОЙНОЙ! +${Math.round(earned)}` : `КРИТ! +${Math.round(earned)}`;
            showCritPopup(event, earned, popupText);
        }

        gameState.evolutionPoints += earned;
        gameState.totalPointsEarned += earned;
        updateUI();
    });

    document.getElementById('createCrystalBtn').addEventListener('click', () => {
        const maxAffordable = getMaxAffordableCrystals();
        const actualCount = gameState.purchaseMultiplier === 'max' 
            ? maxAffordable 
            : Math.min(parseInt(gameState.purchaseMultiplier), maxAffordable);
        
        if (actualCount > 0 && createCrystalBulk(actualCount)) {
            renderCrystals();
            updateUI();
        }
    });

    document.getElementById('activeCrystalsGrid').addEventListener('click', (e) => {
        const slot = e.target.closest('.crystal-slot');
        if (!slot) return;
        selectCrystal('active', parseInt(slot.dataset.index));
        renderCrystals();
        updateUI();
    });

    document.getElementById('inventoryCrystalsGrid').addEventListener('click', (e) => {
        const slot = e.target.closest('.crystal-slot');
        if (!slot) return;
        selectCrystal('inventory', parseInt(slot.dataset.index));
        renderCrystals();
        updateUI();
    });

    document.getElementById('upgradesContainer').addEventListener('click', (e) => {
        const multBtn = e.target.closest('.multiplier-btn');
        if (multBtn) {
            gameState.purchaseMultiplier = multBtn.dataset.multiplier === 'max' ? 'max' : parseInt(multBtn.dataset.multiplier);
            renderUpgrades();
            updateUI();
            return;
        }

        const upgBtn = e.target.closest('.upgrade-btn[data-upgrade]');
        if (upgBtn && !upgBtn.disabled) {
            if (buyUpgradeBulk(upgBtn.dataset.upgrade, parseInt(upgBtn.dataset.count) || 1)) {
                renderUpgrades();
                updateUI();
            }
            return;
        }

        const itemBtn = e.target.closest('.item-btn[data-item]');
        if (itemBtn && !itemBtn.disabled) {
            if (buyItemBulk(itemBtn.dataset.item, parseInt(itemBtn.dataset.count) || 1)) {
                renderUpgrades();
                updateUI();
            }
            return;
        }
    });

    document.getElementById('needsContainer').addEventListener('click', (e) => {
        const btn = e.target.closest('.need-restore-btn-compact');
        if (!btn || btn.disabled) return;
        const result = restoreNeedManual(btn.dataset.need);
        if (result.success) {
            showMessage(result.message);
            renderNeeds();
            updateUI();
        } else {
            showMessage(result.message);
        }
    });

    document.getElementById('diseaseContainer').addEventListener('click', (e) => {
        const btn = e.target.closest('.disease-treat-btn');
        if (!btn || btn.classList.contains('disabled')) return;
        const result = handleTreatDisease(btn.dataset.treat);
        showMessage(result.message);
        renderDiseaseBlock();
        updateUI();
    });

    document.getElementById('autoSpendToggle').addEventListener('click', () => {
        gameState.autoSpendEnabled = !gameState.autoSpendEnabled;
        showMessage(`Авто-трата денег: ${gameState.autoSpendEnabled ? 'включена' : 'выключена'}`);
        updateUI();
    });

    document.getElementById('autoTreatToggle').addEventListener('click', () => {
        gameState.autoTreatEnabled = !gameState.autoTreatEnabled;
        showMessage(`Авто-лечение болезней: ${gameState.autoTreatEnabled ? 'включено' : 'выключено'}`);
        updateUI();
    });

    document.getElementById('autoExchangeButtons').addEventListener('click', (e) => {
        const btn = e.target.closest('.exchange-btn');
        if (!btn) return;
        gameState.autoExchangeAmount = parseInt(btn.dataset.amount);
        showMessage(`Автообмен: ${gameState.autoExchangeAmount === 0 ? "выключен" : `${gameState.autoExchangeAmount} ОЭ/тик`}`);
        updateUI();
    });

    document.getElementById('saveBtn').addEventListener('click', () => {
        saveGame();
        showMessage("Игра сохранена!");
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        if (confirm("Вы уверены? Весь прогресс будет потерян, а дата сброшена к 2026-01-01!")) {
            clearSave();
            resetGameState(false);
            window.location.replace(window.location.href);
        }
    });

    document.getElementById('inheritBtn').addEventListener('click', () => {
        showInheritanceModal(false);
    });

    document.getElementById('helpButton').addEventListener('click', () => {
        openPanel('helpPanel');
    });

    setOnPanelOpenCallback((panelId) => {
        if (panelId === 'shopPanel') renderUpgrades();
        else if (panelId === 'crystalsPanel') { renderCrystals(); updateUI(); }
    });
    initPanels();

    setInterval(saveGame, 30000);
}

// ==========================================
// 4. ЗАПУСК
// ==========================================
bindEvents();
showMainMenu();