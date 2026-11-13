let activePanelId = null;
let onPanelOpenCallback = null;

export function setOnPanelOpenCallback(callback) {
    onPanelOpenCallback = callback;
}

export function initPanels() {
    const backdrop = document.getElementById('panelBackdrop');

    document.querySelectorAll('[data-panel-target]').forEach((button) => {
        button.addEventListener('click', () => {
            const panelId = button.dataset.panelTarget;
            openPanel(panelId);
        });
    });

    document.querySelectorAll('[data-panel-close]').forEach((button) => {
        button.addEventListener('click', closePanel);
    });

    if (backdrop) {
        backdrop.addEventListener('click', closePanel);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closePanel();
        }
    });
}

export function openPanel(panelId) {
    const panel = document.getElementById(panelId);
    const backdrop = document.getElementById('panelBackdrop');

    if (!panel || !backdrop) {
        console.error(`Панель или backdrop не найдены: ${panelId}`);
        return;
    }

    closePanel();

    activePanelId = panelId;

    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('is-open');
    document.body.classList.add('panel-open');
    
    // 🔑 СКРЫВАЕМ ГЛАВНОЕ МЕНЮ, если оно открыто
    const mainMenu = document.getElementById('mainMenu');
    if (mainMenu && mainMenu.style.display !== 'none') {
        mainMenu.dataset.wasVisible = 'true'; // Запоминаем, что его надо вернуть
        mainMenu.style.display = 'none';
    }

    if (onPanelOpenCallback) {
        onPanelOpenCallback(panelId);
    }
}

export function closePanel() {
    const backdrop = document.getElementById('panelBackdrop');

    document.querySelectorAll('.side-panel').forEach((panel) => {
        panel.classList.remove('is-open');
        panel.setAttribute('aria-hidden', 'true');
    });

    if (backdrop) {
        backdrop.classList.remove('is-open');
    }

    document.body.classList.remove('panel-open');
    
    // 🔑 ВОЗВРАЩАЕМ ГЛАВНОЕ МЕНЮ, если оно было скрыто
    const mainMenu = document.getElementById('mainMenu');
    if (mainMenu && mainMenu.dataset.wasVisible === 'true') {
        mainMenu.style.display = 'flex';
        delete mainMenu.dataset.wasVisible;
    }
    
    activePanelId = null;
}

export function getActivePanelId() {
    return activePanelId;
}