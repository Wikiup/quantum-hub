import { HapticFeedback } from '../haptics.js';

export class WheelGame {
    constructor(containerId, customSegments = null) {
        this.container = document.getElementById(containerId);
        this.canvas = null;
        this.ctx = null;
        this.segments = customSegments || [
            { label: 'Yes', color: '#FF6B6B' },
            { label: 'No', color: '#4ECDC4' },
            { label: 'Maybe', color: '#FFE66D' },
            { label: 'Ask Again', color: '#FF9F43' },
            { label: 'Definitely', color: '#6C5CE7' },
            { label: 'Nope', color: '#A8E6CF' }
        ];
        this.currentAngle = 0;
        this.isSpinning = false;
        this.spinVelocity = 0;
        this.friction = 0.99; // Less friction for longer spins
        this.size = 0; // Dynamic
        this.centerX = 0;
        this.centerY = 0;
        this.radius = 0;
        this.lastTickIndex = -1;
        this.audioCtx = null;
        this.destroyed = false;
        
        this.init();
    }

    destroy() {
        this.destroyed = true;
        if (this.audioCtx) {
            this.audioCtx.close();
        }
        window.removeEventListener('resize', this.resizeBind);
    }

    init() {
        this.renderUI();
        this.canvas = this.container.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Responsive Resize
        this.resizeBind = this.resize.bind(this);
        this.resize();
        window.addEventListener('resize', this.resizeBind);

        this.attachEvents();
        
        // Init Audio
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('AudioContext not supported');
        }
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        // Use the smaller dimension to keep it circular and fitting
        // Reserve some space for buttons/result (approx 200px vertical buffer if needed, or just max width)
        const minDim = Math.min(rect.width, rect.height - 150); 
        this.size = Math.max(300, minDim - 40); // Min 300px, or fit container with padding
        
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.size * dpr;
        this.canvas.height = this.size * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = `${this.size}px`;
        this.canvas.style.height = `${this.size}px`;
        
        this.centerX = this.size / 2;
        this.centerY = this.size / 2;
        this.radius = (this.size - 20) / 2;
        
        this.draw();
    }

    playTick() {
        // Haptic feedback on each tick
        HapticFeedback.tick();
        
        if (!this.audioCtx) return;
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);
    }

    renderUI() {
        this.container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full w-full">
                <div class="relative mb-4 flex-shrink-0">
                    <canvas></canvas>
                    <!-- Pointer -->
                    <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-1 drop-shadow-lg z-10 text-white text-4xl">
                        ▼
                    </div>
                    <!-- Center Logo/Hub -->
                    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg border-4 border-slate-200 flex items-center justify-center">
                        <i class="bi bi-star-fill text-yellow-400 text-2xl"></i>
                    </div>
                </div>
                
                <div id="result-display" class="h-10 text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-6 tracking-wide uppercase drop-shadow-sm flex items-center justify-center"></div>

                <div class="flex gap-4 w-full max-w-md px-6">
                    <button id="spin-btn" data-primary-action class="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/30 transform active:scale-95 transition-all text-lg tracking-wider border-t border-white/20">
                        SPIN
                    </button>
                    <button id="edit-btn" class="bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-xl shadow-lg transition active:scale-95 border-t border-white/10">
                        <i class="bi bi-pencil-fill text-lg"></i>
                    </button>
                </div>

                <!-- Editor Modal -->
                <div id="editor-modal" class="hidden fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 p-6 flex flex-col items-center justify-center">
                    <div class="bg-slate-800 p-6 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl flex flex-col max-h-[80vh]">
                        <div class="flex justify-between items-center mb-4 flex-shrink-0">
                            <h2 class="text-xl font-bold text-white"><i class="bi bi-palette-fill mr-2 text-cyan-400"></i>Edit Wheel</h2>
                            <button id="close-editor" class="text-slate-400 hover:text-white transition"><i class="bi bi-x-lg text-xl"></i></button>
                        </div>
                        
                        <div class="overflow-y-auto flex-1 pr-2 mb-4 custom-scrollbar" id="segments-list">
                            <!-- Dynamic Inputs -->
                        </div>

                        <div class="flex gap-2 flex-shrink-0">
                            <button id="add-segment" class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition border border-slate-600">
                                <i class="bi bi-plus-lg mr-2"></i>Add
                            </button>
                            <button id="shuffle-colors" class="px-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition border border-slate-600" title="Shuffle Colors">
                                <i class="bi bi-shuffle"></i>
                            </button>
                        </div>
                        <button id="save-wheel" class="w-full mt-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 rounded-xl transition shadow-lg shadow-cyan-500/20">
                            Save & Spin
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderEditorList() {
        const list = this.container.querySelector('#segments-list');
        list.innerHTML = this.segments.map((seg, i) => `
            <div class="flex gap-2 mb-2 group">
                <input type="color" value="${seg.color}" class="w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer segment-color" data-index="${i}">
                <input type="text" value="${seg.label}" class="flex-1 bg-slate-900 text-white px-3 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 segment-label" data-index="${i}" placeholder="Option ${i+1}">
                <button class="text-slate-500 hover:text-red-400 transition px-2 remove-segment" data-index="${i}">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </div>
        `).join('');
    }

    attachEvents() {
        this.container.querySelector('#spin-btn').addEventListener('click', () => this.spin());
        
        // Editor Events
        const modal = this.container.querySelector('#editor-modal');
        const listContainer = this.container.querySelector('#segments-list');
        
        // Open Editor
        this.container.querySelector('#edit-btn').addEventListener('click', () => {
            this.renderEditorList();
            modal.classList.remove('hidden');
        });
        
        // Close Editor
        this.container.querySelector('#close-editor').addEventListener('click', () => {
            modal.classList.add('hidden');
            this.draw(); // Ensure final state is drawn
        });

        // Add Segment
        this.container.querySelector('#add-segment').addEventListener('click', () => {
            const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F43', '#6C5CE7', '#A8E6CF'];
            this.segments.push({
                label: `Option ${this.segments.length + 1}`,
                color: colors[this.segments.length % colors.length]
            });
            this.renderEditorList();
            this.draw();
        });

        // Shuffle Colors
        this.container.querySelector('#shuffle-colors').addEventListener('click', () => {
            this.segments.forEach(seg => {
                seg.color = `hsl(${Math.random() * 360}, 75%, 60%)`;
            });
            this.renderEditorList();
            this.draw();
        });

        // List Delegation (Inputs and Remove)
        listContainer.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            if (isNaN(index)) return;
            
            if (e.target.classList.contains('segment-label')) {
                this.segments[index].label = e.target.value;
            } else if (e.target.classList.contains('segment-color')) {
                this.segments[index].color = e.target.value;
            }
            this.draw();
        });

        listContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.remove-segment');
            if (!btn) return;
            
            const index = parseInt(btn.dataset.index);
            if (this.segments.length > 1) {
                this.segments.splice(index, 1);
                this.renderEditorList();
                this.draw();
            }
        });

        // Save & Spin
        this.container.querySelector('#save-wheel').addEventListener('click', () => {
            modal.classList.add('hidden');
            this.spin();
        });
    }

    draw() {
        if (!this.ctx) return;
        const total = this.segments.length;
        const arc = (2 * Math.PI) / total;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.rotate(this.currentAngle);

        this.segments.forEach((segment, i) => {
            const angle = i * arc;
            this.ctx.beginPath();
            this.ctx.fillStyle = segment.color;
            this.ctx.moveTo(0, 0);
            this.ctx.arc(0, 0, this.radius, angle, angle + arc);
            this.ctx.lineTo(0, 0);
            this.ctx.fill();
            
            // Segment Border
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            this.ctx.stroke();

            // Text
            this.ctx.save();
            this.ctx.translate(Math.cos(angle + arc / 2) * (this.radius * 0.65), Math.sin(angle + arc / 2) * (this.radius * 0.65));
            this.ctx.rotate(angle + arc / 2);
            this.ctx.fillStyle = 'rgba(255,255,255,0.95)';
            this.ctx.font = 'bold 16px "Outfit", sans-serif'; 
            this.ctx.textAlign = 'right';
            this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
            this.ctx.shadowBlur = 4;
            
            let text = segment.label;
            if (text.length > 14) text = text.substring(0, 12) + '..';
            
            this.ctx.fillText(text, this.radius * 0.3, 6);
            this.ctx.restore();
        });

        this.ctx.restore();
    }

    spin() {
        if (this.isSpinning) return;
        
        // Haptic feedback on spin start
        HapticFeedback.medium();
        
        // Init audio context on first user interaction if suspended
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        this.isSpinning = true;
        this.spinVelocity = Math.random() * 0.3 + 0.5; // Random start speed
        this.container.querySelector('#result-display').textContent = '';
        this.container.querySelector('#result-display').classList.remove('scale-125', 'transition-transform');
        
        // Disable spin button visually
        const btn = this.container.querySelector('#spin-btn');
        btn.classList.add('opacity-50', 'cursor-not-allowed');

        const animate = () => {
            if (this.destroyed) return;
            if (this.spinVelocity <= 0.002) {
                this.isSpinning = false;
                this.determineResult();
                btn.classList.remove('opacity-50', 'cursor-not-allowed');
                return;
            }

            this.currentAngle += this.spinVelocity;
            this.spinVelocity *= this.friction; // Decelerate

            // Tick Logic
            // Calculate current index at the top (pointer is at -PI/2)
            const total = this.segments.length;
            const arc = (2 * Math.PI) / total;
            // Angle of pointer in wheel space: -PI/2 - currentAngle
            let relativeAngle = (-Math.PI / 2 - this.currentAngle) % (2 * Math.PI);
            if (relativeAngle < 0) relativeAngle += 2 * Math.PI;
            const currentIndex = Math.floor(relativeAngle / arc);

            if (currentIndex !== this.lastTickIndex) {
                this.playTick();
                this.lastTickIndex = currentIndex;
            }

            this.draw();
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    determineResult() {
        const total = this.segments.length;
        const arc = (2 * Math.PI) / total;
        let relativeAngle = (-Math.PI / 2 - this.currentAngle) % (2 * Math.PI);
        if (relativeAngle < 0) relativeAngle += 2 * Math.PI;
        
        const index = Math.floor(relativeAngle / arc);
        const winner = this.segments[index];
        
        // Haptic success feedback
        HapticFeedback.success();
        
        const resultDisplay = this.container.querySelector('#result-display');
        resultDisplay.textContent = winner.label;
        resultDisplay.classList.add('scale-125', 'transition-transform');
        
        // Celebration sound (higher pitch tick sequence or just a chime)
        if (this.audioCtx) {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, this.audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.3);
        }
    }
}
