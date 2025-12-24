// Sound Manager - Handles audio playback for game events
export class SoundManager {
    constructor() {
        // Preload audio files
        this.pickupSound = new Audio('sounds/pickup.wav');
        this.bridgeSound = new Audio('sounds/bridge.wav');
        this.victorySound = new Audio('sounds/victory.wav');
        this.damageSound = new Audio('sounds/damage.mp3');
        
        // Set volume levels (0.0 to 1.0)
        this.pickupSound.volume = 0.7;
        this.bridgeSound.volume = 0.5; // Lower volume since it plays frequently
        this.victorySound.volume = 0.8;
        this.damageSound.volume = 0.7;
        
        // Preload sounds
        this.pickupSound.preload = 'auto';
        this.bridgeSound.preload = 'auto';
        this.victorySound.preload = 'auto';
        this.damageSound.preload = 'auto';
        
        // Error handling
        this.pickupSound.addEventListener('error', () => {
            console.warn('Failed to load pickup.wav');
        });
        this.bridgeSound.addEventListener('error', () => {
            console.warn('Failed to load bridge.wav');
        });
        this.victorySound.addEventListener('error', () => {
            console.warn('Failed to load victory.wav');
        });
        this.damageSound.addEventListener('error', () => {
            console.warn('Failed to load damage.mp3');
        });
    }
    
    playPickup() {
        try {
            // Clone and play to allow overlapping sounds
            const sound = this.pickupSound.cloneNode();
            sound.volume = this.pickupSound.volume;
            sound.play().catch(err => {
                // Ignore autoplay restrictions - user interaction will enable audio
                console.debug('Audio play prevented:', err);
            });
        } catch (err) {
            console.debug('Error playing pickup sound:', err);
        }
    }
    
    playBridge() {
        try {
            // Clone and play to allow overlapping sounds
            const sound = this.bridgeSound.cloneNode();
            sound.volume = this.bridgeSound.volume;
            sound.play().catch(err => {
                // Ignore autoplay restrictions - user interaction will enable audio
                console.debug('Audio play prevented:', err);
            });
        } catch (err) {
            console.debug('Error playing bridge sound:', err);
        }
    }
    
    playVictory() {
        try {
            // Clone and play to allow overlapping sounds
            const sound = this.victorySound.cloneNode();
            sound.volume = this.victorySound.volume;
            sound.play().catch(err => {
                // Ignore autoplay restrictions - user interaction will enable audio
                console.debug('Audio play prevented:', err);
            });
        } catch (err) {
            console.debug('Error playing victory sound:', err);
        }
    }
    
    playDamage() {
        try {
            // Clone and play to allow overlapping sounds
            const sound = this.damageSound.cloneNode();
            sound.volume = this.damageSound.volume;
            sound.play().catch(err => {
                // Ignore autoplay restrictions - user interaction will enable audio
                console.debug('Audio play prevented:', err);
            });
        } catch (err) {
            console.debug('Error playing damage sound:', err);
        }
    }
}

