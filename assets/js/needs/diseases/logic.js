import { gameState } from '../../state.js';
import { DISEASES_CONFIG, DISEASES_BY_CATEGORY, AGE_BRACKETS, MAX_ACTIVE_DISEASES } from './config.js';
import { audioManager } from '../../audio.js';

function getAgeBracket() {
    const age = gameState.ageInYears;
    return AGE_BRACKETS.find(b => age >= b.min && age <= b.max) || AGE_BRACKETS[AGE_BRACKETS.length - 1];
}

// 🔑 Проверка, доступна ли болезнь для текущего пола персонажа
function isDiseaseForGender(diseaseId, gender) {
    const config = DISEASES_CONFIG[diseaseId];
    if (!config) return false;
    return config.gender === 'both' || config.gender === gender;
}

export function trySpawnDiseases() {
    if (!gameState.activeDiseases) gameState.activeDiseases = [];
    if (gameState.activeDiseases.length >= MAX_ACTIVE_DISEASES) return [];

    // 🔑 Проверка иммунитета
    if (gameState.diseaseImmunityTicks > 0) return [];

    const chances = getAgeBracket().chances;
    const spawned = [];
    const currentGender = gameState.gender || 'both';

    for (const category of ['light', 'medium', 'heavy']) {
        if (gameState.activeDiseases.length >= MAX_ACTIVE_DISEASES) break;

        if (Math.random() < chances[category]) {
            // Фильтруем: не активна УЖЕ + доступна по ПОЛУ
            const available = DISEASES_BY_CATEGORY[category].filter(
                id => !gameState.activeDiseases.some(d => d.id === id) &&
                    isDiseaseForGender(id, currentGender)
            );

            if (available.length === 0) continue;

            const diseaseId = available[Math.floor(Math.random() * available.length)];
            const config = DISEASES_CONFIG[diseaseId];

            const newDisease = {
                id: diseaseId,
                ticksRemaining: config.duration,
                progressed: false
            };

            gameState.activeDiseases.push(newDisease);
            audioManager.playDisease();

            spawned.push(config);
        }
    }

    return spawned;
}

export function processDiseasesTick() {
    if (!gameState.activeDiseases) gameState.activeDiseases = [];

    const result = {
        spawned: trySpawnDiseases(),
        progressed: [],
        died: null,
        autoTreated: [],
        selfHealed: [] // 🔑 Новое: для отслеживания самоизлечения (можно использовать в UI)
    };

    if (gameState.autoTreatEnabled) {
        result.autoTreated = autoTreatDiseases();
    }

    const toRemove = [];
    const currentGender = gameState.gender || 'both';

    gameState.activeDiseases.forEach((disease, index) => {
        disease.ticksRemaining--;

        // Проверяем только когда таймер истек
        if (disease.ticksRemaining <= 0) {
            const config = DISEASES_CONFIG[disease.id];
            if (!config) {
                toRemove.push(index); // Защита от битых данных
                return;
            }

            // 1. Смертельная болезнь
            if (config.deathOnExpire) {
                result.died = config.name;
                return;
            }

            // 2. Эволюция в следующую стадию
            if (config.nextStage) {
                const nextConfig = DISEASES_CONFIG[config.nextStage];

                // Если следующей стадии нет в конфиге или она не подходит по полу -> болезнь просто проходит
                if (!nextConfig || !isDiseaseForGender(config.nextStage, currentGender)) {
                    toRemove.push(index);
                    return;
                }

                // Проверяем, нет ли уже этой (более тяжелой) стадии в активных
                const alreadyHas = gameState.activeDiseases.some(
                    (d, i) => i !== index && d.id === config.nextStage
                );

                if (alreadyHas) {
                    toRemove.push(index); // Удаляем текущую, так как следующая уже есть
                } else {
                    // Эволюционируем прямо в этом слоте
                    disease.id = config.nextStage;
                    disease.ticksRemaining = nextConfig.duration;
                    disease.progressed = true;
                    result.progressed.push(nextConfig);
                }
            }
            // 3. 🔑 НЕТ следующей стадии -> Шанс 5% на самоизлечение за тик
            else {
                if (config.category == 'light') {
                    if (Math.random() < 0.05) {
                        if (!gameState.flags.includes('self_healed')) gameState.flags.push('self_healed');
                        toRemove.push(index);
                        result.selfHealed.push(config);
                    }
                }

                // Если не повезло (95%), болезнь остается, таймер уходит в минус, 
                // продолжая наносить урон (healthDecayBonus), и на следующем тике 
                // проверка 5% повторится снова.
            }
        }
    });

    // Удаляем болезни в обратном порядке, чтобы не сбить индексы массива
    toRemove.reverse().forEach(i => gameState.activeDiseases.splice(i, 1));

    return result;
}

// 🔑 Автоматическое лечение: лечит самую дешёвую болезнь, если есть деньги
function autoTreatDiseases() {
    if (!gameState.activeDiseases || gameState.activeDiseases.length === 0) return [];

    const treated = [];

    // Сортируем по стоимости лечения (от дешёвой к дорогой)
    const sortedDiseases = [...gameState.activeDiseases].sort((a, b) => {
        const costA = DISEASES_CONFIG[a.id].treatmentCost;
        const costB = DISEASES_CONFIG[b.id].treatmentCost;
        return costA - costB;
    });

    // Пытаемся лечить, пока есть деньги
    for (const disease of sortedDiseases) {
        const config = DISEASES_CONFIG[disease.id];

        if (gameState.money >= config.treatmentCost) {
            const index = gameState.activeDiseases.findIndex(d => d.id === disease.id);
            if (index !== -1) {
                gameState.money -= config.treatmentCost;
                gameState.activeDiseases.splice(index, 1);
                treated.push(config);
            }
        }
    }

    return treated;
}

export function treatDisease(diseaseId) {
    if (!gameState.activeDiseases) {
        return { success: false, message: "Нет активной болезни" };
    }
    gameState.flags.push('treated');

    const index = gameState.activeDiseases.findIndex(d => d.id === diseaseId);
    if (index === -1) {
        return { success: false, message: "Болезнь не найдена" };
    }

    const config = DISEASES_CONFIG[diseaseId];

    if (gameState.money < config.treatmentCost) {
        return {
            success: false,
            message: `Недостаточно денег! Нужно ${config.treatmentCost} 💰`
        };
    }

    gameState.money -= config.treatmentCost;
    gameState.activeDiseases.splice(index, 1);

    return {
        success: true,
        message: `${config.name} вылечена!`
    };
}

export function getDiseaseHealthDecayBonus() {
    if (!gameState.activeDiseases) return 0;
    return gameState.activeDiseases.reduce((sum, disease) => {
        const config = DISEASES_CONFIG[disease.id];
        return config ? sum + config.effects.healthDecayBonus : sum; // защита от битых id
    }, 0);
}

export function isDiseaseBlockingTraining() {
    if (!gameState.activeDiseases) return false;
    return gameState.activeDiseases.some(disease => {
        const config = DISEASES_CONFIG[disease.id];
        return config && config.effects.blockTraining; // защита от битых id
    });
}

export function getActiveDiseasesInfo() {
    if (!gameState.activeDiseases || !Array.isArray(gameState.activeDiseases)) {
        return [];
    }

    return gameState.activeDiseases
        // Фильтр "битых" записей на всякий случай
        .filter(disease => disease && disease.id && DISEASES_CONFIG[disease.id])
        .map(disease => {
            const config = DISEASES_CONFIG[disease.id];
            return {
                ...config,
                ticksRemaining: disease.ticksRemaining,
                // Динамический пересчет на основе ТЕКУЩИХ денег в реальном времени
                canAfford: gameState.money >= config.treatmentCost
            };
        });
}
// © 2024–2026 Андрей Блинов. Все права защищены (All rights reserved).