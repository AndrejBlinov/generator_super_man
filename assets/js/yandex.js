// assets/js/yandex-sdk.js

// 🔑 ВРЕМЕННЫЙ РЕЖИМ: 
// true  = воскрешение работает МГНОВЕННО без рекламы (для локальных тестов)
// false = работает реальная реклама Яндекса (включи это перед загрузкой в Яндекс!)
const DEBUG_NO_ADS = true; 

let ysdk = null;
let isYandexEnv = false;

// 1. Инициализация SDK
export async function initYandexSDK() {
    try {
        if (window.YaGames) {
            ysdk = await window.YaGames.init();
            isYandexEnv = true;
            console.log("✅ Yandex SDK успешно инициализирован");
            ysdk.features.LoadingAPI?.ready();
        } else {
            console.log("ℹ️ Запуск вне Яндекс Игр (локально)");
        }
    } catch (error) {
        console.error("❌ Ошибка инициализации Yandex SDK:", error);
    }
}

// 2. Управление состоянием геймплея (Пауза/Старт)
export function setGameplayState(isPlaying) {
    if (isYandexEnv && ysdk?.features?.GameplayAPI) {
        if (isPlaying) {
            ysdk.features.GameplayAPI.start();
        } else {
            ysdk.features.GameplayAPI.stop();
        }
    }
}

// 3. Полноэкранная реклама
export async function showFullscreenAd() {
    if (!isYandexEnv || !ysdk || DEBUG_NO_ADS) return;
    try {
        await ysdk.adv.showFullscreenAdv({
            callbacks: {
                onClose: () => console.log("Реклама закрыта"),
                onError: (e) => console.log("Ошибка рекламы:", e)
            }
        });
    } catch (err) {
        console.error("Не удалось показать рекламу:", err);
    }
}

// 4. Реклама за вознаграждение (ВОСКРЕШЕНИЕ)
export async function showRewardedAd(onRewardGranted) {
    // 🔑 ГЛАВНОЕ ИЗМЕНЕНИЕ: Если включен тестовый режим, сразу выдаем награду
    if (DEBUG_NO_ADS) {
        console.log("🛠️ [DEBUG] Воскрешение сработало БЕЗ рекламы (тестовый режим)");
        if (onRewardGranted) {
            // Небольшая задержка в 100мс, чтобы имитировать реальный процесс и не сломать анимации
            setTimeout(() => onRewardGranted(), 100);
        }
        return;
    }

    // Реальный код для Яндекса (сработает только когда DEBUG_NO_ADS = false)
    if (!isYandexEnv || !ysdk) return;
    
    try {
        await ysdk.adv.showRewardedVideo({
            callbacks: {
                onOpen: () => console.log("Реклама открыта"),
                onRewarded: () => {
                    console.log("✅ Награда получена!");
                    if (onRewardGranted) onRewardGranted();
                },
                onClose: () => console.log("Реклама закрыта"),
                onError: (e) => console.error("Ошибка рекламы:", e)
            }
        });
    } catch (err) {
        console.error("Не удалось показать rewarded рекламу:", err);
    }
}

// 5. Проверка окружения
export function isYandex() {
    return isYandexEnv;
}