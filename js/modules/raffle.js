import { HapticFeedback } from '../haptics.js';
import { history } from '../history.js';

export class RaffleGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.entries = [];
        this.isDrawing = false;
        this.render();
        this.attachListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="flex flex-col h-full bg-gradient-to-br from-purple-900/20 to-slate-900">
                <!-- Input Section -->
                <div class="p-4 border-b border-slate-700/50">
                    <h2 class="text-lg font-bold mb-3 flex items-center gap-2">
                        <i class="bi bi-ticket-perforated text-purple-400"></i>
                        Raffle Draw
                    </h2>
                    <div class="flex gap-2 mb-3">
                        <input 
                            type="text" 
                            id="entry-input" 
                            placeholder="Enter participant name..."
                            class="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-purple-400 focus:outline-none text-white placeholder-slate-500"
                        >
                        <button id="add-entry-btn" class="px-6 py-2 bg-purple-500 hover:bg-purple-400 rounded-lg font-bold transition-all hover:scale-105 active:scale-95">
                            Add
                        </button>
                    </div>
                    
                    <!-- Quick Add -->
                    <div class="flex gap-2 mb-2">
                        <button class="bulk-add-btn flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium border border-slate-700 transition" data-count="10">
                            +10 Random
                        </button>
                        <button class="bulk-add-btn flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium border border-slate-700 transition" data-count="50">
                            +50 Random
                        </button>
                        <button id="clear-all-btn" class="py-2 px-4 bg-slate-800 hover:bg-red-600 rounded-lg text-sm font-medium border border-slate-700 transition">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                    
                    <div class="text-xs text-slate-400">
                        <span id="entry-count">0</span> entries
                    </div>
                </div>

                <!-- Entries List -->
                <div class="flex-1 overflow-y-auto px-4 py-3" id="entries-list">
                    <div class="text-center text-slate-500 mt-8">
                        <i class="bi bi-inbox text-4xl opacity-30"></i>
                        <p class="mt-2 text-sm">No entries yet. Add participants above.</p>
                    </div>
                </div>

                <!-- Winner Display -->
                <div id="winner-display" class="hidden px-4 py-6 bg-gradient-to-t from-purple-600/20 to-transparent border-t border-purple-500/30">
                    <div class="text-center">
                        <div class="text-sm text-purple-400 font-bold mb-2">🎉 WINNER 🎉</div>
                        <div id="winner-name" class="text-3xl font-black text-white mb-4 animate-pulse"></div>
                        <button id="remove-winner-btn" class="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-sm font-medium border border-purple-500/50 transition">
                            Remove & Draw Again
                        </button>
                    </div>
                </div>

                <!-- Draw Button -->
                <div class="p-4 border-t border-slate-700/50">
                    <button id="draw-btn" data-primary-action class="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-black text-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                        🎲 DRAW WINNER
                    </button>
                </div>
            </div>
        `;
    }

    attachListeners() {
        const input = this.container.querySelector('#entry-input');
        const addBtn = this.container.querySelector('#add-entry-btn');
        const drawBtn = this.container.querySelector('#draw-btn');
        const clearBtn = this.container.querySelector('#clear-all-btn');
        const bulkBtns = this.container.querySelectorAll('.bulk-add-btn');

        // Add Entry
        const addEntry = () => {
            const name = input.value.trim();
            if (name) {
                this.entries.push(name);
                input.value = '';
                this.updateUI();
            }
        };

        addBtn.addEventListener('click', addEntry);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addEntry();
        });

        // Bulk Add
        bulkBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const count = parseInt(btn.dataset.count);
                for (let i = 0; i < count; i++) {
                    this.entries.push(`Participant ${this.entries.length + 1}`);
                }
                this.updateUI();
            });
        });

        // Clear All
        clearBtn.addEventListener('click', () => {
            if (confirm('Clear all entries?')) {
                this.entries = [];
                this.updateUI();
                this.hideWinner();
            }
        });

        // Draw Winner
        drawBtn.addEventListener('click', () => this.drawWinner());

        // Remove Winner
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('#remove-winner-btn')) {
                const winnerName = this.container.querySelector('#winner-name').textContent;
                const index = this.entries.indexOf(winnerName);
                if (index > -1) {
                    this.entries.splice(index, 1);
                }
                this.hideWinner();
                this.updateUI();
            }
        });

        // Remove Individual Entry
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.remove-entry-btn')) {
                const index = parseInt(e.target.closest('.remove-entry-btn').dataset.index);
                this.entries.splice(index, 1);
                this.updateUI();
                this.hideWinner();
            }
        });
    }

    updateUI() {
        const list = this.container.querySelector('#entries-list');
        const count = this.container.querySelector('#entry-count');
        const drawBtn = this.container.querySelector('#draw-btn');

        count.textContent = this.entries.length;

        if (this.entries.length === 0) {
            list.innerHTML = `
                <div class="text-center text-slate-500 mt-8">
                    <i class="bi bi-inbox text-4xl opacity-30"></i>
                    <p class="mt-2 text-sm">No entries yet. Add participants above.</p>
                </div>
            `;
            drawBtn.disabled = true;
        } else {
            list.innerHTML = `
                <div class="space-y-2">
                    ${this.entries.map((entry, i) => `
                        <div class="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 hover:border-purple-500/50 transition group">
                            <div class="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                                ${i + 1}
                            </div>
                            <div class="flex-1 font-medium">${entry}</div>
                            <button class="remove-entry-btn opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition" data-index="${i}">
                                <i class="bi bi-x-circle-fill"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
            drawBtn.disabled = false;
        }
    }

    async drawWinner() {
        if (this.entries.length === 0 || this.isDrawing) return;

        this.isDrawing = true;
        const drawBtn = this.container.querySelector('#draw-btn');
        const winnerDisplay = this.container.querySelector('#winner-display');
        const winnerName = this.container.querySelector('#winner-name');

        drawBtn.disabled = true;
        drawBtn.innerHTML = '<i class="bi bi-hourglass-split animate-spin"></i> Drawing...';

        // Dramatic drum roll effect
        let iterations = 0;
        const maxIterations = 30;
        const interval = setInterval(() => {
            const randomEntry = this.entries[Math.floor(Math.random() * this.entries.length)];
            winnerName.textContent = randomEntry;
            
            if (!winnerDisplay.classList.contains('hidden')) {
                winnerDisplay.classList.add('hidden');
            }
            
            iterations++;
            if (iterations >= maxIterations) {
                clearInterval(interval);
                this.revealWinner();
            }
        }, 100);

        // Play drum roll sound (if you add audio later)
        // this.playSound('drumroll');
    }

    revealWinner() {
        const winnerDisplay = this.container.querySelector('#winner-display');
        const winnerName = this.container.querySelector('#winner-name');
        const drawBtn = this.container.querySelector('#draw-btn');

        // Pick final winner
        const winner = this.entries[Math.floor(Math.random() * this.entries.length)];
        winnerName.textContent = winner;
        
        // Haptic success feedback on winner reveal
        HapticFeedback.success();

        // Show winner
        winnerDisplay.classList.remove('hidden');
        
        // Confetti effect (visual only, no lib)
        this.showConfetti();

        // Play win sound
        // this.playSound('win');
        
        // Log to history
        history.add({
            type: 'raffle',
            result: winner,
            details: {
                totalEntries: this.entries.length,
                allEntries: [...this.entries]
            }
        });

        drawBtn.disabled = false;
        drawBtn.innerHTML = '🎲 DRAW WINNER';
        this.isDrawing = false;
    }

    hideWinner() {
        const winnerDisplay = this.container.querySelector('#winner-display');
        winnerDisplay.classList.add('hidden');
    }

    showConfetti() {
        // Simple confetti animation using emojis
        const emojis = ['🎉', '🎊', '✨', '🎈', '🎆'];
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                confetti.style.position = 'fixed';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-20px';
                confetti.style.fontSize = '24px';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '9999';
                confetti.style.transition = 'all 2s ease-out';
                
                document.body.appendChild(confetti);
                
                requestAnimationFrame(() => {
                    confetti.style.top = '100vh';
                    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                    confetti.style.opacity = '0';
                });
                
                setTimeout(() => confetti.remove(), 2000);
            }, i * 50);
        }
    }

    destroy() {
        // Cleanup if needed
    }
}
