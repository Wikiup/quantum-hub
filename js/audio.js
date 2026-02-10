/**
 * Audio System for Quantum Hub
 * Professional game audio with Web Audio API
 * Sound effects for all interactions
 * Respects user preferences from settings
 */

export class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.enabled = this.getSetting();
        this.volume = 0.3; // Default volume (0.0 to 1.0)
        
        // Sound effect cache
        this.sounds = {};
        
        // Initialize on first user interaction (autoplay policy)
        this.initialized = false;
        
        // Bind initialization to user gesture
        document.addEventListener('click', () => this.init(), { once: true });
    }
    
    init() {
        if (this.initialized || !this.enabled) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('🔊 AudioSystem initialized');
        } catch (e) {
            console.warn('AudioContext not supported:', e);
        }
    }
    
    getSetting() {
        try {
            const settings = JSON.parse(localStorage.getItem('quantum-hub-settings') || '{}');
            return settings.soundEffects !== false; // Default true
        } catch {
            return true;
        }
    }
    
    enable() {
        this.enabled = true;
        this.init();
    }
    
    disable() {
        this.enabled = false;
    }
    
    setVolume(level) {
        this.volume = Math.max(0, Math.min(1, level));
    }
    
    /**
     * Generate sound using Web Audio API oscillators
     */
    playTone(frequency, duration = 0.1, type = 'sine', volume = null) {
        if (!this.enabled || !this.initialized || !this.audioContext) return;
        
        try {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = type; // 'sine', 'square', 'triangle', 'sawtooth'
            osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            
            const vol = volume !== null ? volume : this.volume;
            gain.gain.setValueAtTime(vol, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.warn('Audio playback failed:', e);
        }
    }
    
    /**
     * Play a chord (multiple frequencies)
     */
    playChord(frequencies, duration = 0.2, type = 'sine') {
        frequencies.forEach(freq => this.playTone(freq, duration, type, this.volume * 0.6));
    }
    
    // ===== Predefined Sound Effects =====
    
    /**
     * Click/Tap sound - subtle UI feedback
     */
    click() {
        this.playTone(800, 0.05, 'sine', this.volume * 0.4);
    }
    
    /**
     * Tick sound - for wheel/countdown
     */
    tick() {
        this.playTone(600, 0.03, 'square', this.volume * 0.3);
    }
    
    /**
     * Success sound - positive feedback
     */
    success() {
        this.playChord([523.25, 659.25, 783.99], 0.3, 'sine'); // C-E-G major chord
    }
    
    /**
     * Error sound - negative feedback
     */
    error() {
        this.playTone(200, 0.2, 'sawtooth', this.volume * 0.5);
    }
    
    /**
     * Whoosh sound - for transitions
     */
    whoosh() {
        if (!this.enabled || !this.initialized || !this.audioContext) return;
        
        try {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
            
            gain.gain.setValueAtTime(this.volume * 0.4, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + 0.3);
        } catch (e) {
            console.warn('Whoosh sound failed:', e);
        }
    }
    
    /**
     * Pop sound - for UI elements appearing
     */
    pop() {
        this.playTone(880, 0.08, 'sine', this.volume * 0.5);
        setTimeout(() => this.playTone(660, 0.05, 'sine', this.volume * 0.3), 30);
    }
    
    /**
     * Coin flip sound
     */
    coinFlip() {
        if (!this.enabled || !this.initialized || !this.audioContext) return;
        
        // Metallic ping sequence
        const times = [0, 0.05, 0.1, 0.15, 0.2, 0.25];
        const freqs = [1200, 1400, 1600, 1400, 1200, 1000];
        
        times.forEach((time, i) => {
            setTimeout(() => {
                this.playTone(freqs[i], 0.06, 'triangle', this.volume * 0.3);
            }, time * 1000);
        });
    }
    
    /**
     * Dice roll sound - bouncing effect
     */
    diceRoll() {
        if (!this.enabled || !this.initialized || !this.audioContext) return;
        
        // Bouncing rhythm
        const bounces = [
            { time: 0, freq: 300 },
            { time: 100, freq: 350 },
            { time: 180, freq: 320 },
            { time: 240, freq: 380 },
            { time: 280, freq: 340 },
            { time: 310, freq: 360 }
        ];
        
        bounces.forEach(({ time, freq }) => {
            setTimeout(() => {
                this.playTone(freq, 0.05, 'square', this.volume * 0.3);
            }, time);
        });
    }
    
    /**
     * Wheel spin start
     */
    wheelStart() {
        this.playTone(440, 0.15, 'triangle', this.volume * 0.5);
    }
    
    /**
     * Wheel tick (fast version for spinning)
     */
    wheelTick() {
        this.playTone(600, 0.02, 'square', this.volume * 0.25);
    }
    
    /**
     * Wheel stop - celebratory
     */
    wheelStop() {
        this.playChord([523.25, 659.25, 783.99, 1046.50], 0.4, 'triangle'); // C-E-G-C
    }
    
    /**
     * Raffle drum roll
     */
    drumRoll() {
        if (!this.enabled || !this.initialized || !this.audioContext) return;
        
        let count = 0;
        const interval = setInterval(() => {
            if (count >= 20) {
                clearInterval(interval);
                return;
            }
            this.playTone(150 + (count * 10), 0.03, 'sawtooth', this.volume * 0.2);
            count++;
        }, 50);
    }
    
    /**
     * Confetti pop
     */
    confetti() {
        const notes = [523.25, 587.33, 659.25, 783.99, 880.00]; // C-D-E-G-A
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.1, 'sine', this.volume * 0.4);
            }, i * 50);
        });
    }
    
    /**
     * Button press
     */
    buttonPress() {
        this.playTone(700, 0.06, 'triangle', this.volume * 0.35);
    }
    
    /**
     * Button release
     */
    buttonRelease() {
        this.playTone(500, 0.04, 'triangle', this.volume * 0.25);
    }
    
    /**
     * Navigation sound
     */
    navigate() {
        this.playTone(550, 0.08, 'sine', this.volume * 0.3);
    }
    
    /**
     * Achievement unlock
     */
    achievement() {
        const melody = [
            { freq: 523.25, time: 0 },     // C
            { freq: 659.25, time: 100 },   // E
            { freq: 783.99, time: 200 },   // G
            { freq: 1046.50, time: 300 }   // High C
        ];
        
        melody.forEach(({ freq, time }) => {
            setTimeout(() => {
                this.playTone(freq, 0.2, 'sine', this.volume * 0.4);
            }, time);
        });
    }
    
    /**
     * Notification sound
     */
    notification() {
        this.playTone(880, 0.1, 'sine', this.volume * 0.4);
        setTimeout(() => this.playTone(660, 0.15, 'sine', this.volume * 0.35), 100);
    }
    
    /**
     * Swipe sound
     */
    swipe() {
        this.playTone(800, 0.05, 'triangle', this.volume * 0.3);
    }
    
    /**
     * Countdown beep
     */
    countdown(isFinal = false) {
        if (isFinal) {
            this.playTone(1200, 0.2, 'sine', this.volume * 0.6);
        } else {
            this.playTone(800, 0.1, 'sine', this.volume * 0.4);
        }
    }
}

// Singleton instance
export const audio = new AudioSystem();

// Listen for settings changes
window.addEventListener('settings-updated', (e) => {
    if (e.detail && e.detail.soundEffects !== undefined) {
        if (e.detail.soundEffects) {
            audio.enable();
        } else {
            audio.disable();
        }
    }
});
