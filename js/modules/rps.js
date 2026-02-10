// 🪨📄✂️ Rock-Paper-Scissors Module

export class RPSGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.gameState = 'idle'; // idle | playing | result
        this.playerChoice = null;
        this.computerChoice = null;
        this.result = null;
        this.stats = this.loadStats();
        
        this.render();
        this.attachListeners();
    }

    loadStats() {
        const saved = localStorage.getItem('quantum_rps_stats');
        return saved ? JSON.parse(saved) : { wins: 0, losses: 0, ties: 0 };
    }

    saveStats() {
        localStorage.setItem('quantum_rps_stats', JSON.stringify(this.stats));
    }

    render() {
        this.container.innerHTML = `
            <div class="flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
                
                <!-- Computer Area -->
                <div class="flex-1 flex items-center justify-center relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none"></div>
                    <div id="computer-hand" class="text-8xl transform transition-all duration-500 scale-100 opacity-60">
                        <span class="rps-emoji rotate-180 inline-block">🤖</span>
                    </div>
                </div>

                <!-- VS Divider -->
                <div class="py-3 px-4 flex items-center justify-between border-y border-slate-700 bg-slate-800/80 backdrop-blur">
                    <div class="text-xs text-slate-400 font-mono">
                        <div class="flex gap-3">
                            <span class="text-emerald-400">W: ${this.stats.wins}</span>
                            <span class="text-rose-400">L: ${this.stats.losses}</span>
                            <span class="text-yellow-400">T: ${this.stats.ties}</span>
                        </div>
                    </div>
                    <div id="result-text" class="text-lg font-black tracking-tight text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text">
                        READY?
                    </div>
                    <button id="reset-stats" class="text-xs text-slate-500 hover:text-slate-300 transition">
                        <i class="bi bi-arrow-clockwise"></i>
                    </button>
                </div>

                <!-- Player Area -->
                <div class="flex-1 flex items-center justify-center relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none"></div>
                    <div id="player-hand" class="text-8xl transform transition-all duration-500 scale-100">
                        <span class="rps-emoji">👊</span>
                    </div>
                </div>

                <!-- Controls -->
                <div class="p-6 pb-8 space-y-4">
                    <div id="choice-buttons" class="grid grid-cols-3 gap-3">
                        <button class="rps-btn" data-choice="rock">
                            <span class="text-5xl">🪨</span>
                            <span class="text-xs font-bold mt-1">ROCK</span>
                        </button>
                        <button class="rps-btn" data-choice="paper">
                            <span class="text-5xl">📄</span>
                            <span class="text-xs font-bold mt-1">PAPER</span>
                        </button>
                        <button class="rps-btn" data-choice="scissors">
                            <span class="text-5xl">✂️</span>
                            <span class="text-xs font-bold mt-1">SCISSORS</span>
                        </button>
                    </div>
                    
                    <button id="play-again" class="hidden w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-900 font-black rounded-2xl transition-all transform hover:scale-105 active:scale-95">
                        PLAY AGAIN
                    </button>
                </div>

            </div>
        `;
    }

    attachListeners() {
        // Choice buttons
        this.container.querySelectorAll('.rps-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.gameState === 'idle') {
                    this.play(btn.dataset.choice);
                }
            });
        });

        // Play again
        const playAgainBtn = this.container.querySelector('#play-again');
        playAgainBtn.addEventListener('click', () => this.reset());

        // Reset stats
        const resetStatsBtn = this.container.querySelector('#reset-stats');
        resetStatsBtn.addEventListener('click', () => {
            if (confirm('Reset all stats?')) {
                this.stats = { wins: 0, losses: 0, ties: 0 };
                this.saveStats();
                this.render();
                this.attachListeners();
            }
        });
    }

    play(playerChoice) {
        this.gameState = 'playing';
        this.playerChoice = playerChoice;

        // Disable buttons during animation
        this.container.querySelectorAll('.rps-btn').forEach(btn => {
            btn.classList.add('pointer-events-none', 'opacity-50');
        });

        // Shake animation
        this.shake(() => {
            this.computerChoice = this.getComputerChoice();
            this.determineWinner();
            this.showResult();
        });
    }

    shake(callback) {
        const playerHand = this.container.querySelector('#player-hand .rps-emoji');
        const computerHand = this.container.querySelector('#computer-hand .rps-emoji');
        const resultText = this.container.querySelector('#result-text');

        resultText.textContent = 'ROCK...';
        
        // Shake 3 times
        let shakeCount = 0;
        const shakeInterval = setInterval(() => {
            const offset = shakeCount % 2 === 0 ? -20 : 20;
            playerHand.style.transform = `translateY(${offset}px)`;
            computerHand.style.transform = `rotate(180deg) translateY(${offset}px)`;
            
            shakeCount++;
            
            if (shakeCount === 2) resultText.textContent = 'PAPER...';
            if (shakeCount === 4) resultText.textContent = 'SCISSORS...';
            
            if (shakeCount >= 6) {
                clearInterval(shakeInterval);
                playerHand.style.transform = 'translateY(0)';
                computerHand.style.transform = 'rotate(180deg) translateY(0)';
                resultText.textContent = 'SHOOT!';
                callback();
            }
        }, 300);
    }

    getComputerChoice() {
        const choices = ['rock', 'paper', 'scissors'];
        return choices[Math.floor(Math.random() * choices.length)];
    }

    determineWinner() {
        if (this.playerChoice === this.computerChoice) {
            this.result = 'tie';
            this.stats.ties++;
        } else if (
            (this.playerChoice === 'rock' && this.computerChoice === 'scissors') ||
            (this.playerChoice === 'paper' && this.computerChoice === 'rock') ||
            (this.playerChoice === 'scissors' && this.computerChoice === 'paper')
        ) {
            this.result = 'win';
            this.stats.wins++;
        } else {
            this.result = 'lose';
            this.stats.losses++;
        }
        
        this.saveStats();
    }

    showResult() {
        this.gameState = 'result';

        // Update hands with choices
        const playerHand = this.container.querySelector('#player-hand .rps-emoji');
        const computerHand = this.container.querySelector('#computer-hand .rps-emoji');
        const resultText = this.container.querySelector('#result-text');

        playerHand.textContent = this.getEmoji(this.playerChoice);
        computerHand.textContent = this.getEmoji(this.computerChoice);

        // Animate result
        setTimeout(() => {
            if (this.result === 'win') {
                resultText.textContent = 'YOU WIN! 🎉';
                resultText.className = 'text-lg font-black tracking-tight text-emerald-400';
                playerHand.classList.add('animate-bounce');
                this.celebrate();
            } else if (this.result === 'lose') {
                resultText.textContent = 'YOU LOSE 😢';
                resultText.className = 'text-lg font-black tracking-tight text-rose-400';
                computerHand.classList.add('animate-bounce');
            } else {
                resultText.textContent = "IT'S A TIE! 🤝";
                resultText.className = 'text-lg font-black tracking-tight text-yellow-400';
            }

            // Update stats display
            const statsDisplay = this.container.querySelector('.text-xs.text-slate-400');
            statsDisplay.innerHTML = `
                <div class="flex gap-3">
                    <span class="text-emerald-400">W: ${this.stats.wins}</span>
                    <span class="text-rose-400">L: ${this.stats.losses}</span>
                    <span class="text-yellow-400">T: ${this.stats.ties}</span>
                </div>
            `;

            // Show play again button
            this.container.querySelector('#play-again').classList.remove('hidden');
        }, 500);
    }

    getEmoji(choice) {
        const map = {
            rock: '🪨',
            paper: '📄',
            scissors: '✂️'
        };
        return map[choice];
    }

    celebrate() {
        // Simple confetti effect
        const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];
        const confettiCount = 30;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-10px';
                confetti.style.width = '8px';
                confetti.style.height = '8px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                confetti.style.zIndex = '9999';
                confetti.style.pointerEvents = 'none';
                confetti.style.transition = 'all 2s ease-out';
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.style.top = '110vh';
                    confetti.style.left = (parseFloat(confetti.style.left) + (Math.random() * 40 - 20)) + '%';
                    confetti.style.opacity = '0';
                }, 50);
                
                setTimeout(() => confetti.remove(), 2100);
            }, i * 40);
        }
    }

    reset() {
        this.gameState = 'idle';
        this.playerChoice = null;
        this.computerChoice = null;
        this.result = null;

        // Reset UI
        const playerHand = this.container.querySelector('#player-hand .rps-emoji');
        const computerHand = this.container.querySelector('#computer-hand .rps-emoji');
        const resultText = this.container.querySelector('#result-text');

        playerHand.textContent = '👊';
        playerHand.classList.remove('animate-bounce');
        computerHand.textContent = '🤖';
        computerHand.classList.remove('animate-bounce');
        
        resultText.textContent = 'READY?';
        resultText.className = 'text-lg font-black tracking-tight text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text';

        // Re-enable buttons
        this.container.querySelectorAll('.rps-btn').forEach(btn => {
            btn.classList.remove('pointer-events-none', 'opacity-50');
        });

        // Hide play again button
        this.container.querySelector('#play-again').classList.add('hidden');
    }

    destroy() {
        // Cleanup if needed
        this.container.innerHTML = '';
    }
}
