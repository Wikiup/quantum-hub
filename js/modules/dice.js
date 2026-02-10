import { HapticFeedback } from '../haptics.js';
import { history } from '../history.js';

export class DiceGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.diceCount = 1;
        this.isRolling = false;
        this.audioCtx = null;
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
                <div class="w-full px-6 flex justify-between items-center mb-4">
                    <div class="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
                        <button class="dice-count-btn w-8 h-8 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold transition" data-count="1">1</button>
                        <button class="dice-count-btn w-8 h-8 rounded hover:bg-slate-600 text-slate-400 font-bold transition" data-count="2">2</button>
                        <button class="dice-count-btn w-8 h-8 rounded hover:bg-slate-600 text-slate-400 font-bold transition" data-count="3">3</button>
                    </div>
                    <div class="text-slate-400 text-sm font-bold uppercase tracking-wider">Total: <span id="dice-total" class="text-white text-xl ml-1">-</span></div>
                </div>

                <div id="dice-scene" class="flex-1 w-full flex items-center justify-center perspective-1000 overflow-hidden">
                    <div id="dice-wrapper" class="grid gap-8 justify-items-center items-center transition-all duration-500">
                        <!-- Dice injected here -->
                    </div>
                </div>

                <div class="w-full max-w-md px-6 mt-6">
                    <button id="roll-btn" data-primary-action class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/30 transform active:scale-95 transition-all text-lg tracking-wider border-t border-white/20">
                        ROLL DICE
                    </button>
                </div>
            </div>
        `;
        
        this.updateDiceCount(1);
    }

    renderDie(id) {
        const pipMaps = {
            1: [4],
            2: [0, 8],
            3: [0, 4, 8],
            4: [0, 2, 6, 8],
            5: [0, 2, 4, 6, 8],
            6: [0, 2, 3, 5, 6, 8]
        };

        const createFace = (num, transform) => {
            return `<div class="die-face absolute inset-0 bg-white rounded-xl border border-slate-300 shadow-inner flex items-center justify-center backface-hidden" style="transform: ${transform} translateZ(50px);">
                <div class="grid grid-cols-3 grid-rows-3 w-16 h-16 gap-1 p-2 pointer-events-none">
                    ${Array(9).fill(0).map((_, i) => pipMaps[num].includes(i) ? '<div class="bg-slate-900 rounded-full w-full h-full shadow-sm"></div>' : '<div></div>').join('')}
                </div>
            </div>`;
        };

        return `
            <div id="die-${id}" class="die w-[100px] h-[100px] relative transform-style-3d transition-transform duration-[2s] ease-out" data-rot-x="0" data-rot-y="0">
                ${createFace(1, 'rotateY(0deg)')}
                ${createFace(6, 'rotateY(180deg)')}
                ${createFace(2, 'rotateX(-90deg)')}
                ${createFace(5, 'rotateX(90deg)')}
                ${createFace(3, 'rotateY(90deg)')}
                ${createFace(4, 'rotateY(-90deg)')}
            </div>
        `;
    }

    updateDiceCount(count) {
        this.diceCount = count;
        const wrapper = this.container.querySelector('#dice-wrapper');
        
        if (count === 1) wrapper.className = 'grid grid-cols-1';
        else if (count === 2) wrapper.className = 'grid grid-cols-2 gap-12';
        else wrapper.className = 'grid grid-cols-3 gap-8'; 

        wrapper.innerHTML = Array(count).fill(0).map((_, i) => this.renderDie(i)).join('');
        
        this.container.querySelectorAll('.dice-count-btn').forEach(btn => {
            const isActive = parseInt(btn.dataset.count) === count;
            btn.className = `dice-count-btn w-8 h-8 rounded font-bold transition ${isActive ? 'bg-slate-700 text-white shadow-inner' : 'hover:bg-slate-700 text-slate-500'}`;
        });
    }

    attachEvents() {
        this.container.querySelector('#roll-btn').addEventListener('click', () => this.roll());
        
        this.container.querySelectorAll('.dice-count-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.isRolling) return;
                this.updateDiceCount(parseInt(e.target.dataset.count));
                this.container.querySelector('#dice-total').innerText = '-';
            });
        });
    }

    playRollSound() {
        if (!this.audioCtx) return;
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

        const bufferSize = this.audioCtx.sampleRate * 0.1;
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.audioCtx.createGain();
        gain.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
        
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);
        noise.start();
    }

    roll() {
        if (this.isRolling) return;
        this.isRolling = true;
        
        // Haptic feedback on roll start
        HapticFeedback.medium();
        
        const btn = this.container.querySelector('#roll-btn');
        btn.classList.add('opacity-50', 'cursor-not-allowed');
        this.container.querySelector('#dice-total').innerText = '...';

        this.playRollSound();

        let total = 0;
        const dice = this.container.querySelectorAll('.die');
        
        // We calculate results first, but apply transforms inside loop
        dice.forEach((die) => {
            const result = Math.floor(Math.random() * 6) + 1;
            total += result;

            // Target Face Rotation
            let targetX = 0, targetY = 0;
            switch(result) {
                case 1: targetX = 0; targetY = 0; break;
                case 6: targetX = 0; targetY = 180; break; 
                case 2: targetX = 90; targetY = 0; break; 
                case 5: targetX = -90; targetY = 0; break;
                case 3: targetX = 0; targetY = -90; break;
                case 4: targetX = 0; targetY = 90; break;
            }

            // Get current rotation
            let currentX = parseFloat(die.getAttribute('data-rot-x') || 0);
            let currentY = parseFloat(die.getAttribute('data-rot-y') || 0);

            // Add extra spins (3-5 full spins)
            const spinsX = (Math.floor(Math.random() * 3) + 3) * 360;
            const spinsY = (Math.floor(Math.random() * 3) + 3) * 360;

            let nextX = currentX + spinsX;
            let nextY = currentY + spinsY;
            
            // Adjust to land on target
            // nextX should end up as N*360 + targetX
            // Remove remainder, add target
            nextX = Math.round(nextX / 360) * 360 + targetX;
            nextY = Math.round(nextY / 360) * 360 + targetY;

            // Ensure forward movement if we rounded down
            if (nextX <= currentX) nextX += 360;
            if (nextY <= currentY) nextY += 360;

            die.style.transform = `rotateX(${nextX}deg) rotateY(${nextY}deg)`;
            die.setAttribute('data-rot-x', nextX);
            die.setAttribute('data-rot-y', nextY);
        });

        setTimeout(() => {
            this.isRolling = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
            this.container.querySelector('#dice-total').innerText = total;
            this.playRollSound(); // Land sound
            HapticFeedback.heavy(); // Success haptic
            
            // Log to history
            history.add({
                type: 'dice',
                result: total.toString(),
                details: {
                    diceCount: this.diceCount
                }
            });
        }, 2000);
    }
}
