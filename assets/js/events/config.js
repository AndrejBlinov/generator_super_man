// assets/js/events/config.js

import { SIMPLE_EVENTS } from './simple.js';
import { COMPLEX_EVENTS } from './complex.js';

// Объединяем все события в один объект для удобства доступа по ID
export const EVENTS_CONFIG = {
    ...SIMPLE_EVENTS,
    ...COMPLEX_EVENTS
};

// ==========================================
// ВЕСА СОБЫТИЙ (БАЛАНС ЧАСТОТЫ)
// ==========================================
export const EVENT_WEIGHTS = {
    // --- Простые бытовые и социальные (вес 6-8) ---
    "found_wallet": 8, "flu_season": 7, "charity_request": 8, "internet_outage": 6, "unexpected_gift": 5,
    "parking_ticket": 7, "neighbor_cookies": 7, "pests": 6, "landlord_gift": 4, "heatwave": 6,
    "overtime_offer": 7, "tax_refund": 5, "old_friend_debt": 6,
    "insomnia": 7, "expired_food": 6, "gym_bros": 6,
    "homeless_person": 8, "found_phone": 7, "wrong_delivery": 5,
    "pigeon_attack": 6, "vending_machine": 7, "lucky_charm": 5,
    "noisy_neighbor": 6, "street_performer": 6, "lottery_ticket": 7,
    "plumbing_disaster": 5, "mansion_party": 5,

    // --- Средние / Абсурд (вес 3-5) ---
    "mysterious_package": 5, "pyramid_scheme": 5, "miracle_cure": 4,
    "online_course_ad": 6, "roof_leak": 5, "mysterious_inheritance": 3,
    "alien_abduction": 2, "squirrel_mafia": 3,

    // --- Цепочки (вес 0, вызываются ТОЛЬКО по расписанию через scheduleEvent) ---
    "meet_stranger": 6, "stray_dog": 6, // Триггеры цепочек имеют небольшой вес для рандома
    "first_date": 0, "relationship_start": 0, "relationship_crisis": 0,
    "marriage_proposal": 0, "wedding_planning": 0, 
    "vet_visit": 0, "pet_escape": 0,
    "course_completed": 0, "mold_growth": 0, "inheritance_result": 0
};