import { gameState, legacy, stats, loadFullGame, resetActiveGame, resetAll, handleDeath, saveGame } from './state.js';
import { hasActiveGame, hasLegacy, clearActiveGame, clearAll } from './storage.js'; // 🔑 Обновлено!
import { startGameLoop, stopGameLoop } from './gameLoop.js';
import { recalculateStats, buyUpgradeBulk, buyItemBulk } from './upgrades.js';
import { renderUI, updateUI, showCritPopup, showMessage, renderCrystals, renderUpgrades, showInheritanceModal, renderDifficultyPanel, showDeathScreen } from './ui.js';
import { createCrystalBulk, selectCrystal, getMaxAffordableCrystals } from './crystals.js';
import { initPanels, setOnPanelOpenCallback, openPanel, closePanel } from './panels.js';
import { canTrain, getTrainingBlockReason, restoreNeedManual, renderNeeds, handleTreatDisease, renderDiseaseBlock } from './needs/index.js';
import { initCharacter, updateCharacterStateFromGame, updateHousingInfo } from './character/index.js';
import { GAME_VERSION, HOUSING_CONFIG } from './config.js';

// 🔑 ЗАГРУЗКА ИНСТРУКЦИИ (выполняется 1 раз при старте модуля)
const helpResponse = await fetch('./include/instruction.html');
const helpHtml = await helpResponse.text();
document.getElementById('helpPanelContainer').innerHTML = helpHtml;
console.log('✅ Инструкция загружена');

// ==========================================
// 1. ЛОГИКА ИГРОВОГО ДВИЖКА
// ==========================================
function startGameEngine() {
    stopGameEngine();
    recalculateStats();
    initCharacter();
    updateCharacterStateFromGame();
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

    const hasActive = loadFullGame();
    const hasLeg = hasLegacy();
    const isAlive = !gameState.isGameOver;

    // 1. Кнопка "Продолжить игру"
    if (hasActive && isAlive) {
        const btn = document.createElement('button');
        btn.className = 'menu-btn';
        const diffIcons = { easy: '🌱', medium: '⚖️', hard: '💀' };
        const diffIcon = diffIcons[gameState.difficulty] || '⚖️';
        btn.textContent = `▶️ Продолжить игру ${diffIcon}`;
        btn.onclick = () => {
            menu.style.display = 'none';
            app.style.display = '';
            startGameEngine();
        };
        btnContainer.appendChild(btn);
    }

    // 2. Кнопка "Начать новое поколение"
    if (hasLeg) {
        const btn = document.createElement('button');
        btn.className = 'menu-btn secondary';

        const crystalsCount = (legacy.startingCrystals || []).length;
        const crystalLevels = (legacy.startingCrystals || [])
            .map(c => c.level)
            .sort((a, b) => b - a)
            .slice(0, 3)
            .join(', ');
        const moreText = crystalsCount > 3 ? ` +${crystalsCount - 3} ещё` : '';

        btn.textContent = `🧬 Начать новое поколение (+${legacy.exchangeRateBonus}% курс, ${crystalsCount} крист.${crystalLevels ? ` [${crystalLevels}${moreText}]` : ''})`;

        btn.onclick = () => {
            // 🔑 Сбрасываем старые флаги
            window.pendingNewGame = false;
            window.pendingDifficultyAfterInheritance = false;

            // 🔑 Сначала выбираем пол
            openPanel('genderPanel');
            window.pendingInheritance = true;
        };
        btnContainer.appendChild(btn);
    }

    // 3. Кнопка "Новая игра"
    const newGameBtn = document.createElement('button');
    newGameBtn.className = 'menu-btn danger';
    newGameBtn.textContent = hasActive ? '🔄 Новая игра (выбрать сложность)' : '🔄 Новая игра';

    newGameBtn.onclick = () => {
        if (hasActive) {
            if (!confirm("⚠️ ВНИМАНИЕ: Это удалит текущее сохранение. Продолжить?")) {
                return;
            }
            clearActiveGame();
        }

        // 🔑 Показываем выбор пола ПЕРЕД выбором сложности
        openPanel('genderPanel');
        window.pendingInheritance = false;
        window.pendingNewGame = true; // 🔑 Новый флаг
    };
    btnContainer.appendChild(newGameBtn);

    // Отображаем статистику
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
    // 🔑 ЛОГИКА МОДАЛКИ ПОДДЕРЖКИ
    const donateModal = document.getElementById('donateModal');
    const donateModalClose = document.getElementById('donateModalClose');
    const donateModalBackdrop = document.getElementById('donateModalBackdrop');
    const donateFromMenu = document.getElementById('donateFromMenuBtn');
    const donateFromHelp = document.getElementById('donateFromHelpBtn');

    function openDonateModal() {
        donateModal.classList.add('is-open');
        donateModal.setAttribute('aria-hidden', 'false');
    }

    function closeDonateModal() {
        donateModal.classList.remove('is-open');
        donateModal.setAttribute('aria-hidden', 'true');
    }

    if (donateFromMenu) donateFromMenu.addEventListener('click', openDonateModal);
    if (donateFromHelp) donateFromHelp.addEventListener('click', openDonateModal);
    if (donateModalClose) donateModalClose.addEventListener('click', closeDonateModal);
    if (donateModalBackdrop) donateModalBackdrop.addEventListener('click', closeDonateModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && donateModal.classList.contains('is-open')) {
            closeDonateModal();
        }
    });

    // 🔑 ОБРАБОТЧИК ВЫБОРА ПОЛА (УНИВЕРСАЛЬНЫЙ)
    const genderContainer = document.getElementById('genderOptions');
    if (genderContainer) {
        genderContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.gender-card');
            if (!card) return;

            // Защита от двойного клика
            if (!window.pendingInheritance && !window.pendingNewGame) return;

            const gender = card.dataset.gender;
            document.querySelectorAll('.gender-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            gameState.gender = gender;
            closePanel(); // Закрываем панель пола

            if (window.pendingInheritance) {
                window.pendingInheritance = false;
                // 🔑 После выбора пола открываем выбор сложности
                window.pendingDifficultyAfterInheritance = true;
                renderDifficultyPanel();
                openPanel('difficultyPanel');
            } else if (window.pendingNewGame) {
                window.pendingNewGame = false;
                // Для обычной новой игры тоже открываем выбор сложности
                renderDifficultyPanel();
                openPanel('difficultyPanel');
            }
        });
    }

    // 🔑 ОБРАБОТЧИК ОТПРАВКИ ФОРМЫ БАГА (без изменений)
    document.getElementById('bugForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submitBugBtn');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Отправка...';

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
            const response = await fetch('./api/submit-bug.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error(`HTTP ошибка! Статус: ${response.status}`);
            const result = await response.json();
            if (!result.success) throw new Error(result.message || 'Ошибка на стороне сервера');

            showMessage('✅ Спасибо! Отчет о баге успешно отправлен.');
            document.getElementById('bugForm').reset();
            closePanel();
        } catch (error) {
            console.error('❌ Ошибка отправки:', error);
            showMessage('⚠️ Сервер недоступен, но отчет сохранен локально.');
            document.getElementById('bugForm').reset();
            closePanel();
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // 🔑 ОБРАБОТЧИК ТРЕНИРОВКИ
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

        if (Math.random() < gameState.doubleClickChance) { earned *= 2; isDoubleClick = true; }
        if (Math.random() < gameState.critChance) { earned *= gameState.critMultiplier; isCrit = true; }

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

        // 🔑 Покупка жилья
        const housingBtn = e.target.closest('.upgrade-btn[data-housing]');
        if (housingBtn && !housingBtn.disabled) {
            const housingId = housingBtn.dataset.housing;
            const houseConfig = HOUSING_CONFIG[housingId];

            if (gameState.money >= houseConfig.cost) {
                gameState.money -= houseConfig.cost;
                gameState.housing = housingId;
                showMessage(`🏠 Вы переехали в: ${houseConfig.name}!`);

                if (gameState.needs.comfort > houseConfig.maxComfort) {
                    gameState.needs.comfort = houseConfig.maxComfort;
                }

                if (typeof updateHousingInfo === 'function') updateHousingInfo();
                renderNeeds();
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
        saveGame();
        stopGameLoop();
        showMainMenu();
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        if (confirm("Вы уверены? Весь прогресс будет потерян!")) {
            resetAll();
            window.location.replace(window.location.href);
        }
    });

    document.getElementById('helpButton').addEventListener('click', () => {
        openPanel('helpPanel');
    });

    // 🔑 ОБРАБОТЧИК ВЫБОРА СЛОЖНОСТИ (УНИВЕРСАЛЬНЫЙ)
    const diffContainer = document.getElementById('difficultyOptions');
    if (diffContainer) {
        diffContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.difficulty-select-btn');
            if (!btn) return;

            const difficulty = btn.dataset.difficulty;
            closePanel();

            const menu = document.getElementById('mainMenu');
            const app = document.getElementById('gameApp');
            menu.style.display = 'none';
            app.style.display = '';

            if (window.pendingDifficultyAfterInheritance) {
                // 🔑 ЗАПУСК С НАСЛЕДИЕМ И ВЫБРАННОЙ СЛОЖНОСТЬЮ
                window.pendingDifficultyAfterInheritance = false;

                import('./inheritance.js').then(module => {
                    return module.startInheritedGame(difficulty); // Передаем именно выбранную сложность!
                }).then(() => {
                    startGameEngine();
                    console.log(`✅ Игра с наследием запущена на сложности: ${difficulty}`);
                }).catch(err => {
                    console.error('❌ Ошибка запуска наследия:', err);
                });

            } else {
                // 🔑 ОБЫЧНЫЙ ЗАПУСК НОВОЙ ИГРЫ
                resetActiveGame(difficulty);
                console.log(`✅ Новая игра запущена на сложности: ${difficulty}`);
                saveGame();
                startGameEngine();
            }
        });
    }

    // 🔑 Эффект "прилипания" верхней панели
    const stickyPanel = document.querySelector('.top-sticky-panel');
    if (stickyPanel) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) {
                        stickyPanel.classList.add('is-stuck');
                    } else {
                        stickyPanel.classList.remove('is-stuck');
                    }
                });
            },
            { threshold: [1], rootMargin: '-1px 0px 0px 0px' }
        );
        
        const anchor = document.createElement('div');
        anchor.style.position = 'absolute';
        anchor.style.top = '-1px';
        anchor.style.height = '1px';
        anchor.style.width = '100%';
        stickyPanel.parentElement.insertBefore(anchor, stickyPanel);
        observer.observe(anchor);
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

// 🔑 Отображаем версию игры
const versionDisplay = document.getElementById('versionDisplay');
if (versionDisplay) {
    versionDisplay.textContent = GAME_VERSION;
}

bindEvents();
showMainMenu();

window.startGameEngine = startGameEngine;
// © 2024–2026 Андрей Блинов. Все права защищены (All rights reserved).