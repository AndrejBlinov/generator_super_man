import { gameState, legacy, stats, loadFullGame, resetActiveGame, resetAll, handleDeath, saveGame } from './state.js';
import { hasActiveGame, hasLegacy, clearActiveGame, clearAll } from './storage.js'; // 🔑 Обновлено!
import { startGameLoop, stopGameLoop } from './gameLoop.js';
import { recalculateStats, buyUpgradeBulk, buyItemBulk } from './upgrades.js';
import { renderUI, updateUI, showCritPopup, showMessage, renderCrystals, renderUpgrades, showInheritanceModal, renderDifficultyPanel, showDeathScreen } from './ui.js';
import { createCrystalBulk, selectCrystal, getMaxAffordableCrystals } from './crystals.js';
import { initPanels, setOnPanelOpenCallback, openPanel, closePanel } from './panels.js';
import { canTrain, getTrainingBlockReason, restoreNeedManual, renderNeeds, handleTreatDisease, renderDiseaseBlock } from './needs/index.js';
import { applyInheritance } from './inheritance.js';

// 🔑 ЗАГРУЗКА ИНСТРУКЦИИ (выполняется 1 раз при старте модуля)
const helpResponse = await fetch('./include/instruction.html');
const helpHtml = await helpResponse.text();
document.getElementById('helpPanelContainer').innerHTML = helpHtml;
console.log('✅ Инструкция загружена');

// ==========================================
// 1. ЛОГИКА ИГРОВОГО ДВИЖКА
// ==========================================
function startGameEngine() {
    stopGameEngine(); // 🔑 Сначала гарантированно останавливаем старый цикл
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

    // 🔑 Загружаем все данные из разделённых хранилищ
    const hasActive = loadFullGame();
    const hasLeg = hasLegacy();
    const isAlive = !gameState.isGameOver;

    console.log('📊 Состояние меню:', { hasActive, hasLeg, isAlive, difficulty: gameState.difficulty });

    // 1. Кнопка "Продолжить игру" (только если есть активное сохранение и персонаж жив)
    if (hasActive && isAlive) {
        const btn = document.createElement('button');
        btn.className = 'menu-btn';
        const diffIcons = { easy: '🌱', medium: '⚖️', hard: '💀' };
        const diffIcon = diffIcons[gameState.difficulty] || '⚖️';
        btn.textContent = `▶️ Продолжить игру ${diffIcon}`;
        btn.onclick = () => {
            menu.style.display = 'none';
            app.style.display = 'block';
            startGameEngine();
        };
        btnContainer.appendChild(btn);
    }

    // 2. Кнопка "С бонусами наследия" (если есть бонусы)
    if (hasLeg) {
        const btn = document.createElement('button');
        btn.className = 'menu-btn secondary';
        btn.textContent = `🧬 Начать новое поколение (+${legacy.exchangeRateBonus}% курс)`;
        btn.onclick = () => {
            // Сбрасываем активную игру, применяя наследие
            applyInheritance();
            menu.style.display = 'none';
            app.style.display = 'block';
            startGameEngine();
        };
        btnContainer.appendChild(btn);
    }

    // 3. Кнопка "Новая игра" (ВСЕГДА доступна)
    const newGameBtn = document.createElement('button');
    newGameBtn.className = 'menu-btn danger';
    newGameBtn.textContent = hasActiveGame() ? '🔄 Новая игра (выбрать сложность)' : '🔄 Новая игра';

    newGameBtn.onclick = () => {
        if (hasActiveGame()) {
            if (!confirm("⚠️ ВНИМАНИЕ: Это удалит текущее сохранение. Наследие и статистика сохранятся. Продолжить?")) {
                return;
            }
            clearActiveGame(); // 🔑 Было clearSave(), стало clearActiveGame()
        }
        renderDifficultyPanel();
        openPanel('difficultyPanel');
    };
    btnContainer.appendChild(newGameBtn);

    // 4. Кнопка "Полный сброс" (если есть наследие или статистика)
    if (hasLeg || stats.runsCompleted > 0) {
        const resetBtn = document.createElement('button');
        resetBtn.className = 'menu-btn';
        resetBtn.style.background = '#6c757d';
        resetBtn.style.fontSize = '13px';
        resetBtn.style.padding = '10px';
        resetBtn.style.marginTop = '10px';
        resetBtn.textContent = '🗑️ Полный сброс (удалить ВСЁ, включая наследие)';
        resetBtn.onclick = () => {
            if (confirm("⚠️ ВНИМАНИЕ: Это удалит ВСЁ — наследие, статистику, активную игру. Действие необратимо! Продолжить?")) {
                resetAll();
                window.location.reload();
            }
        };
        btnContainer.appendChild(resetBtn);
    }

    // 🔑 Отображаем общую статистику в подвале меню
    const footer = menu.querySelector('.menu-footer');
    if (footer && stats.runsCompleted > 0) {
        footer.innerHTML = `
            <p>📊 Поколений: ${stats.runsCompleted} • 💀 Смертей: ${stats.totalDeaths} • 🏆 Рекорд возраста: ${stats.highestAgeReached} лет</p>
            <p>Автосохранение каждые 30 секунд</p>
        `;
    }
}

// ==========================================
// 3. ПРИВЯЗКА СОБЫТИЙ (выполняется 1 раз)
// ==========================================
function bindEvents() {

    // 🔑 ОБРАБОТЧИК КНОПКИ "СООБЩИТЬ О БАГЕ"
    document.getElementById('bugReportBtn').addEventListener('click', () => {
        openPanel('bugReportPanel');
    });

    // 🔑 ОБРАБОТЧИК ОТПРАВКИ ФОРМЫ
    document.getElementById('bugForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('submitBugBtn');
        const originalText = submitBtn.textContent;

        // Блокируем кнопку на время отправки
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Отправка...';

        // Собираем данные
        const formData = {
            name: document.getElementById('bugName').value.trim() || 'Аноним',
            email: document.getElementById('bugEmail').value.trim() || 'Не указан',
            description: document.getElementById('bugDescription').value.trim(),
            steps: document.getElementById('bugSteps').value.trim() || 'Не указаны',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            gameState: {
                age: gameState.ageInYears,
                difficulty: gameState.difficulty,
                evolutionPoints: Math.round(gameState.evolutionPoints),
                version: gameState.gameVersion
            }
        };

                try {
            // 🔑 1. РЕАЛЬНАЯ ОТПРАВКА НА PHP СКРИПТ
            const response = await fetch('./api/submit-bug.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ошибка! Статус: ${response.status}`);
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || 'Ошибка на стороне сервера');
            }

            // 🔑 2. ЛОКАЛЬНАЯ ЗАГЛУШКА (дубликат для надежности или тестов без сервера)
            console.log('📦 Данные бага успешно отправлены на сервер:', formData);
            const savedBugs = JSON.parse(localStorage.getItem('mock_bug_reports') || '[]');
            savedBugs.push(formData);
            localStorage.setItem('mock_bug_reports', JSON.stringify(savedBugs));

            showMessage('✅ Спасибо! Отчет о баге успешно отправлен.');
            document.getElementById('bugForm').reset();
            closePanel();

        } catch (error) {
            console.error('❌ Ошибка отправки на сервер:', error);
            
            // 🔑 Фоллбек: если PHP-сервер недоступен (например, локальный запуск без OpenServer), 
            // мы все равно сохраняем отчет локально, чтобы данные не потерялись.
            const savedBugs = JSON.parse(localStorage.getItem('mock_bug_reports') || '[]');
            savedBugs.push(formData);
            localStorage.setItem('mock_bug_reports', JSON.stringify(savedBugs));
            
            showMessage('⚠️ Сервер недоступен, но отчет сохранен локально.');
            document.getElementById('bugForm').reset();
            closePanel();
            
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

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

    document.getElementById('menuBtn').addEventListener('click', () => {
        saveGame();          // 1. Сохраняем текущий прогресс
        stopGameLoop();      // 2. Останавливаем игровой цикл (пауза)
        showMainMenu();      // 3. Возвращаемся на главный экран
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        if (confirm("Вы уверены? Весь прогресс будет потерян, а дата сброшена к 2026-01-01!")) {
            resetAll();
            window.location.replace(window.location.href);
        }
    });

    // document.getElementById('inheritBtn').addEventListener('click', () => {
    //     showInheritanceModal(false);
    // });

    document.getElementById('helpButton').addEventListener('click', () => {
        openPanel('helpPanel');
    });

    // 🔑 НОВЫЙ ОБРАБОТЧИК: Выбор сложности
    const diffContainer = document.getElementById('difficultyOptions');
    if (diffContainer) {
        diffContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.difficulty-select-btn');
            if (!btn) return;

            const difficulty = btn.dataset.difficulty;

            // Сбрасываем активную игру с выбранной сложностью
            resetActiveGame(difficulty);
            saveGame();

            closePanel();

            const menu = document.getElementById('mainMenu');
            const app = document.getElementById('gameApp');
            menu.style.display = 'none';
            app.style.display = 'block';

            startGameEngine();
        });
    }

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

window.startGameEngine = startGameEngine;