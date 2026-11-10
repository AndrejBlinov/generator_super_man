let activePanelId = null;

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
        console.warn(`Панель или backdrop не найдены: ${panelId}`);
        return;
    }

    closePanel();

    activePanelId = panelId;

    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');

    backdrop.classList.add('is-open');
    document.body.classList.add('panel-open');
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
    activePanelId = null;
}

export function getActivePanelId() {
    return activePanelId;
}