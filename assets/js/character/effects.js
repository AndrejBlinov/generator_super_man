// Применение визуальных эффектов болезней
export function applyDiseaseEffects(character, diseases) {
    diseases.forEach(disease => {
        switch (disease.id) {
            case 'trauma':
                character.classList.add('disease-trauma');
                break;
            case 'flu':
                character.classList.add('disease-flu');
                break;
            case 'stroke':
                character.classList.add('disease-stroke');
                break;
            // Добавляй другие болезни по мере необходимости
        }
    });
}

// Очистка эффектов болезней
export function clearDiseaseEffects(character) {
    character.classList.remove('disease-trauma', 'disease-flu', 'disease-stroke');
}