import { HapticFeedback } from '../haptics.js';

export class CoinGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.isFlipping = false;
        this.audioCtx = null;
        this.result = null; // 'heads' or 'tails'
        this.init();
    }

    destroy() {
        if (this.audioCtx) this.audioCtx.close();
    }

    init() {
        this.renderUI();
        this.attachEvents();
        
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('AudioContext not supported');
        }
    }

    renderUI() {
        this.container.innerHTML = `
            <div class="flex flex-col items-center justify-between h-full w-full py-6">
                <div class="w-full px-6 text-center mb-4">
                    <div class="text-slate-400 text-sm font-bold uppercase tracking-wider">Result: <span id="coin-result" class="text-white text-xl ml-1">-</span></div>
                </div>

                <div id="coin-scene" class="flex-1 w-full flex items-center justify-center perspective-1000 overflow-hidden">
                    <div id="coin" class="w-48 h-48 relative transform-style-3d transition-transform duration-[3s] ease-out cursor-pointer">
                        <!-- Heads -->
                        <div class="coin-face absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 shadow-xl border-4 border-yellow-600 flex items-center justify-center backface-hidden z-10">
                            <i class="bi bi-person-circle text-8xl text-yellow-800 opacity-80"></i>
                        </div>
                        <!-- Tails -->
                        <div class="coin-face absolute inset-0 rounded-full bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 shadow-xl border-4 border-slate-600 flex items-center justify-center backface-hidden transform rotate-y-180">
                            <span class="text-6xl font-bold text-slate-700 opacity-80">1</span>
                        </div>
                        <!-- Edge (pseudo-3d effect) -->
                        <div class="absolute inset-0 rounded-full border-[10px] border-yellow-700 opacity-50 transform translate-z-[-5px]"></div>
                    </div>
                </div>

                <div class="w-full max-w-md px-6 mt-6">
                    <button id="flip-btn" data-primary-action class="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-yellow-500/30 transform active:scale-95 transition-all text-lg tracking-wider border-t border-white/20">
                        FLIP COIN
                    </button>
                </div>
            </div>
        `;
    }

    attachEvents() {
        this.container.querySelector('#flip-btn').addEventListener('click', () => this.flip());
        this.container.querySelector('#coin').addEventListener('click', () => this.flip());
    }

    playFlipSound() {
        if (!this.audioCtx) return;
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

        // Metallic ping
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.audioCtx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.5);
    }

    playLandSound() {
        if (!this.audioCtx) return;
        // Thud
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.audioCtx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);
    }

    flip() {
        if (this.isFlipping) return;
        this.isFlipping = true;
        
        // Haptic feedback on flip start
        HapticFeedback.medium();
        
        const btn = this.container.querySelector('#flip-btn');
        btn.classList.add('opacity-50', 'cursor-not-allowed');
        const resultDisplay = this.container.querySelector('#coin-result');
        resultDisplay.innerText = '...';

        this.playFlipSound();

        const coin = this.container.querySelector('#coin');
        
        // Random result
        const isHeads = Math.random() > 0.5;
        this.result = isHeads ? 'HEADS' : 'TAILS';
        
        // Reset transform to 0 (or keep building up if needed, but let's reset to keep it simple or track accumulation)
        // Better to accumulate to ensure smooth transition from current state
        let currentRotation = parseFloat(coin.dataset.rotation || 0);
        
        // Spin heavily (5-10 full spins) + target
        // Heads = 0 (or 360*N), Tails = 180 (or 360*N + 180)
        const baseSpins = (Math.floor(Math.random() * 5) + 5) * 360; 
        const target = isHeads ? 0 : 180;
        
        // We want to land on 'target' relative to a multiple of 360
        // Current: 180. Next should be > 180 + baseSpins. 
        // Example: current 180. target 0. 
        // We want next to be 180 + 360*5 + (something to get to 0 mod 360) -> NO.
        // We want the final value % 360 to be target.
        
        let nextRotation = currentRotation + baseSpins;
        const remainder = nextRotation % 360;
        // Adjust to match target
        // If remainder is 0 and target is 180 -> add 180. 
        // If remainder is 180 and target is 0 -> add 180.
        // If remainder is 0 and target is 0 -> add 0.
        
        const adjustment = (target - remainder + 360) % 360;
        nextRotation += adjustment;

        // Apply
        coin.style.transform = `rotateY(${nextRotation}deg)`;
        coin.dataset.rotation = nextRotation;

        // Animate tilt for realism (wobble)
        const wobbleX = Math.random() * 20 - 10;
        // We can't easily combine rotateY and rotateX cleanly without complex matrix or nested divs if we want independent axes, 
        // but let's try adding it to the string.
        // Actually, let's keep it simple Y-axis spin for now to avoid gimbal lock visual weirdness.

        setTimeout(() => {
            this.isFlipping = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
            resultDisplay.innerText = this.result;
            resultDisplay.className = `text-xl ml-1 font-bold ${isHeads ? 'text-yellow-400' : 'text-slate-300'}`;
            this.playLandSound();
            HapticFeedback.heavy(); // Success haptic on land
        }, 3000); // Matches duration-3000
    }
}
