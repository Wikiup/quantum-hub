// Haptic Feedback Utility (2026 Mobile UX Best Practice)
// Progressive enhancement for devices that support Vibration API
export class HapticFeedback {
    static light() {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }
    
    static medium() {
        if ('vibrate' in navigator) {
            navigator.vibrate(20);
        }
    }
    
    static heavy() {
        if ('vibrate' in navigator) {
            navigator.vibrate([30, 10, 30]);
        }
    }
    
    static success() {
        if ('vibrate' in navigator) {
            navigator.vibrate([20, 40, 60]);
        }
    }
    
    static error() {
        if ('vibrate' in navigator) {
            navigator.vibrate([50, 30, 50, 30, 50]);
        }
    }
    
    static tick() {
        if ('vibrate' in navigator) {
            navigator.vibrate(5);
        }
    }
}
