let ysdk = null;

export async function initYandexSDK() {
    try {
        ysdk = await YaGames.init();
        console.log('✅ Yandex SDK инициализирован');
        
        // Сообщаем платформе, что игра загрузилась и готова к отображению
        ysdk.features.LoadingAPI?.ready();

        // Обработка сворачивания/разворачивания игры (важно для Яндекс Игр!)
        ysdk.on('game_api_pause', () => {
            console.log('⏸️ Игра поставлена на паузу (окно свернуто)');
            if (window.stopGameEngine) window.stopGameEngine();
        });

        ysdk.on('game_api_resume', () => {
            console.log('▶️ Игра возобновлена');
            if (window.startGameEngine) window.startGameEngine();
        });

        return ysdk;
    } catch (error) {
        console.error('❌ Ошибка инициализации Yandex SDK:', error);
        return null;
    }
}

export function showFullscreenAd() {
    if (ysdk) {
        // Ставим игру на паузу перед показом рекламы
        if (window.stopGameEngine) window.stopGameEngine();
        
        ysdk.adv.showFullscreenAdv({
            callbacks: {
                onClose: function(wasShown) {
                    console.log('Реклама закрыта');
                    if (window.startGameEngine) window.startGameEngine();
                },
                onError: function(error) {
                    console.error('Ошибка рекламы:', error);
                    if (window.startGameEngine) window.startGameEngine();
                }
            }
        });
    }
}