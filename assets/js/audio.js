class AudioManager {
    constructor() {
        this.sounds = {
            ambience: new Audio('assets/audio/ambience.ogg'),
            achievement: new Audio('assets/audio/achievement.ogg'),
            disease: new Audio('assets/audio/disease.ogg')
        };
        
        // Настройка циклов и громкости
        this.sounds.ambience.loop = true;
        this.sounds.ambience.volume = 0.2; // Тихий фон
        this.sounds.achievement.volume = 0.6;
        this.sounds.disease.volume = 0.5;

        this.isMuted = false;
        this.ambienceStarted = false;
    }

    init() {
        // Браузеры блокируют автовоспроизведение звука до первого взаимодействия пользователя
        const startAudio = () => {
            if (!this.ambienceStarted && !this.isMuted) {
                this.sounds.ambience.play().catch(e => console.log('Автовоспроизведение заблокировано:', e));
                this.ambienceStarted = true;
            }
            document.removeEventListener('click', startAudio);
            document.removeEventListener('keydown', startAudio);
        };
        document.addEventListener('click', startAudio);
        document.addEventListener('keydown', startAudio);
    }

    playAchievement() {
        if (this.isMuted) return;
        this.sounds.achievement.currentTime = 0;
        this.sounds.achievement.play().catch(e => console.warn('Не удалось воспроизвести звук ачивки'));
    }

    playDisease() {
        if (this.isMuted) return;
        this.sounds.disease.currentTime = 0;
        this.sounds.disease.play().catch(e => console.warn('Не удалось воспроизвести звук болезни'));
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.sounds.ambience.pause();
        } else {
            if (this.ambienceStarted) this.sounds.ambience.play();
        }
        return this.isMuted;
    }
}

export const audioManager = new AudioManager();