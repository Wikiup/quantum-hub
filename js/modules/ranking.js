export class RankingGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.items = [];
        this.currentPair = null;
        this.round = 0;
        this.totalRounds = 0;
        this.votes = new Map(); // item -> score
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="h-full flex flex-col bg-gradient-to-br from-slate-900 via-rose-950/20 to-slate-900">
                <!-- Input Phase -->
                <div id="input-phase" class="p-6 flex flex-col gap-4">
                    <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <label class="block text-sm font-bold text-rose-400 mb-2 uppercase tracking-wider">
                            <i class="bi bi-trophy"></i> Add Items to Rank
                        </label>
                        <div class="flex gap-2 mb-3">
                            <input 
                                type="text" 
                                id="item-input" 
                                placeholder="Enter item name..."
                                class="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-rose-400 transition"
                            />
                            <button 
                                id="add-btn"
                                class="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-lg font-bold transition active:scale-95"
                            >
                                <i class="bi bi-plus-lg"></i>
                            </button>
                        </div>
                        <div id="item-list" class="space-y-2 max-h-48 overflow-y-auto"></div>
                    </div>

                    <div class="flex gap-2">
                        <button id="quick-5" class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition">
                            Quick 5
                        </button>
                        <button id="clear-all" class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition">
                            Clear All
                        </button>
                    </div>

                    <button 
                        id="start-ranking"
                        class="py-4 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl font-bold text-lg tracking-wide transition shadow-lg shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Start Ranking
                    </button>
                </div>

                <!-- Voting Phase -->
                <div id="voting-phase" class="hidden h-full flex flex-col">
                    <!-- Progress -->
                    <div class="px-6 pt-6 pb-4">
                        <div class="flex justify-between text-xs text-slate-400 mb-2">
                            <span id="round-counter">Round 1/10</span>
                            <span id="progress-pct">0%</span>
                        </div>
                        <div class="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div id="progress-bar" class="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-300" style="width: 0%"></div>
                        </div>
                    </div>

                    <!-- Voting Cards -->
                    <div class="flex-1 flex flex-col justify-center px-6 pb-6 gap-4">
                        <div class="text-center mb-2">
                            <h3 class="text-sm uppercase tracking-widest text-slate-400 font-bold">Which do you prefer?</h3>
                        </div>
                        
                        <button id="vote-a" class="vote-card group">
                            <span id="item-a-text" class="text-lg font-bold">Option A</span>
                            <i class="bi bi-hand-thumbs-up-fill opacity-0 group-hover:opacity-100 transition text-rose-400"></i>
                        </button>

                        <button id="vote-b" class="vote-card group">
                            <span id="item-b-text" class="text-lg font-bold">Option B</span>
                            <i class="bi bi-hand-thumbs-up-fill opacity-0 group-hover:opacity-100 transition text-rose-400"></i>
                        </button>
                    </div>
                </div>

                <!-- Results Phase -->
                <div id="results-phase" class="hidden h-full flex flex-col p-6 overflow-y-auto">
                    <div class="text-center mb-6">
                        <i class="bi bi-trophy-fill text-6xl text-rose-400 mb-2"></i>
                        <h2 class="text-2xl font-bold mb-1">Final Ranking</h2>
                        <p class="text-slate-400 text-sm">Based on your votes</p>
                    </div>

                    <div id="results-list" class="space-y-3 mb-6"></div>

                    <button 
                        id="rank-again"
                        class="py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl font-bold transition shadow-lg shadow-rose-500/20"
                    >
                        Rank Again
                    </button>
                </div>
            </div>
        `;

        // Event Listeners
        document.getElementById('add-btn').addEventListener('click', () => this.addItem());
        document.getElementById('item-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addItem();
        });
        document.getElementById('quick-5').addEventListener('click', () => this.quickAdd5());
        document.getElementById('clear-all').addEventListener('click', () => this.clearAll());
        document.getElementById('start-ranking').addEventListener('click', () => this.startRanking());
        document.getElementById('vote-a').addEventListener('click', () => this.vote(0));
        document.getElementById('vote-b').addEventListener('click', () => this.vote(1));
        document.getElementById('rank-again').addEventListener('click', () => this.reset());

        this.updateStartButton();
    }

    addItem() {
        const input = document.getElementById('item-input');
        const text = input.value.trim();
        if (!text) return;
        
        this.items.push(text);
        input.value = '';
        this.renderItemList();
        this.updateStartButton();
    }

    renderItemList() {
        const list = document.getElementById('item-list');
        if (this.items.length === 0) {
            list.innerHTML = '<div class="text-center text-slate-500 text-sm py-4">Add at least 2 items to start</div>';
            return;
        }

        list.innerHTML = this.items.map((item, idx) => `
            <div class="flex items-center gap-2 bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-700">
                <span class="flex-1 text-sm">${item}</span>
                <button 
                    onclick="event.stopPropagation(); window.rankingRemoveItem(${idx})"
                    class="text-slate-500 hover:text-rose-400 transition"
                >
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        `).join('');
    }

    removeItem(idx) {
        this.items.splice(idx, 1);
        this.renderItemList();
        this.updateStartButton();
    }

    quickAdd5() {
        const templates = ['Pizza', 'Burger', 'Sushi', 'Tacos', 'Pasta'];
        this.items = [...templates];
        this.renderItemList();
        this.updateStartButton();
    }

    clearAll() {
        this.items = [];
        this.renderItemList();
        this.updateStartButton();
    }

    updateStartButton() {
        const btn = document.getElementById('start-ranking');
        btn.disabled = this.items.length < 2;
        btn.textContent = this.items.length < 2 
            ? 'Add at least 2 items' 
            : `Start Ranking (${this.items.length} items)`;
    }

    startRanking() {
        // Initialize scores
        this.votes.clear();
        this.items.forEach(item => this.votes.set(item, 0));

        // Generate all pairs (round-robin)
        this.pairs = [];
        for (let i = 0; i < this.items.length; i++) {
            for (let j = i + 1; j < this.items.length; j++) {
                this.pairs.push([this.items[i], this.items[j]]);
            }
        }

        // Shuffle pairs
        this.pairs.sort(() => Math.random() - 0.5);

        this.round = 0;
        this.totalRounds = this.pairs.length;

        // Hide input, show voting
        document.getElementById('input-phase').classList.add('hidden');
        document.getElementById('voting-phase').classList.remove('hidden');

        this.nextPair();
    }

    nextPair() {
        if (this.round >= this.totalRounds) {
            this.showResults();
            return;
        }

        this.currentPair = this.pairs[this.round];
        document.getElementById('item-a-text').textContent = this.currentPair[0];
        document.getElementById('item-b-text').textContent = this.currentPair[1];

        // Update progress
        const progress = ((this.round + 1) / this.totalRounds) * 100;
        document.getElementById('round-counter').textContent = `Round ${this.round + 1}/${this.totalRounds}`;
        document.getElementById('progress-pct').textContent = `${Math.round(progress)}%`;
        document.getElementById('progress-bar').style.width = `${progress}%`;
    }

    vote(choice) {
        const winner = this.currentPair[choice];
        this.votes.set(winner, this.votes.get(winner) + 1);

        // Animate choice
        const btn = choice === 0 ? document.getElementById('vote-a') : document.getElementById('vote-b');
        btn.classList.add('scale-105', 'bg-rose-500/30');
        setTimeout(() => {
            btn.classList.remove('scale-105', 'bg-rose-500/30');
            this.round++;
            this.nextPair();
        }, 200);
    }

    showResults() {
        // Sort by score
        const ranked = Array.from(this.votes.entries())
            .sort((a, b) => b[1] - a[1]);

        const resultsList = document.getElementById('results-list');
        resultsList.innerHTML = ranked.map((entry, idx) => {
            const [item, score] = entry;
            const maxScore = this.items.length - 1;
            const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
            
            let medal = '';
            let badgeColor = 'bg-slate-700';
            if (idx === 0) {
                medal = '🥇';
                badgeColor = 'bg-yellow-500/20 text-yellow-400';
            } else if (idx === 1) {
                medal = '🥈';
                badgeColor = 'bg-slate-400/20 text-slate-300';
            } else if (idx === 2) {
                medal = '🥉';
                badgeColor = 'bg-orange-500/20 text-orange-400';
            }

            return `
                <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">${medal || '•'}</span>
                            <div>
                                <h4 class="font-bold text-lg">${item}</h4>
                                <span class="text-xs text-slate-400">Wins: ${score} / ${maxScore}</span>
                            </div>
                        </div>
                        <span class="px-3 py-1 ${badgeColor} rounded-full text-sm font-bold">
                            #${idx + 1}
                        </span>
                    </div>
                    <div class="h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                            class="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-500" 
                            style="width: ${pct}%"
                        ></div>
                    </div>
                </div>
            `;
        }).join('');

        // Hide voting, show results
        document.getElementById('voting-phase').classList.add('hidden');
        document.getElementById('results-phase').classList.remove('hidden');

        // Confetti for winner
        this.playConfetti();
    }

    playConfetti() {
        // Simple confetti burst (emoji-based)
        const emojis = ['🎉', '✨', '🎊', '⭐'];
        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-50px';
            confetti.style.fontSize = '24px';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';
            confetti.style.transition = 'all 2s ease-out';
            document.body.appendChild(confetti);

            setTimeout(() => {
                confetti.style.top = '120vh';
                confetti.style.transform = `rotate(${Math.random() * 720 - 360}deg)`;
                confetti.style.opacity = '0';
            }, 50);

            setTimeout(() => confetti.remove(), 2100);
        }
    }

    reset() {
        this.items = [];
        this.votes.clear();
        this.round = 0;
        document.getElementById('results-phase').classList.add('hidden');
        document.getElementById('input-phase').classList.remove('hidden');
        document.getElementById('item-input').value = '';
        this.renderItemList();
        this.updateStartButton();
    }

    destroy() {
        // Cleanup
        window.rankingRemoveItem = null;
    }
}

// Expose helper for inline onclick
window.rankingRemoveItem = function(idx) {
    // This will be set by the active instance in app.js
    if (window.activeRankingInstance) {
        window.activeRankingInstance.removeItem(idx);
    }
};
