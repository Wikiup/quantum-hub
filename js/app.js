import { WheelGame } from './modules/wheel.js';
import { DiceGame } from './modules/dice.js';
import { CoinGame } from './modules/coin.js';
import { RaffleGame } from './modules/raffle.js';
import { RankingGame } from './modules/ranking.js';
import { RPSGame } from './modules/rps.js';

// Router and State Management

const routes = {
    home: { title: 'Quantum Hub', render: renderHome },
    wheels: { title: 'My Wheels', render: renderWheels },
    explore: { title: 'Explore', render: renderExplore },
    // Modules
    wheel: { title: 'Spin Wheel', render: renderModuleWheel, afterRender: initWheel },
    dice: { title: 'Dice Roll', render: renderModuleDice, afterRender: initDice },
    coin: { title: 'Coin Flip', render: renderModuleCoin, afterRender: initCoin },
    raffle: { title: 'Raffle Draw', render: renderModuleRaffle, afterRender: initRaffle },
    ranking: { title: 'Ranking', render: renderModuleRanking, afterRender: initRanking },
    rps: { title: 'Rock-Paper-Scissors', render: renderModuleRPS, afterRender: initRPS }
};

let currentRoute = 'home';
const app = document.getElementById('app');
const pageTitle = document.getElementById('pageTitle');
const backBtn = document.getElementById('back-btn');
let activeModule = null; // Store active module instance

function init() {
    // Nav listeners
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => navigate(btn.dataset.route));
    });

    // Back button
    backBtn.addEventListener('click', () => navigate('home')); // Simple back logic for now

    // Initial Render
    navigate('home');
}

function navigate(route, params = {}) {
    // Cleanup active module
    if (activeModule) {
        if (typeof activeModule.destroy === 'function') {
            activeModule.destroy();
        }
        activeModule = null;
    }

    currentRoute = route;
    const view = routes[route];
    
    // Update Title
    document.getElementById('page-title').textContent = view.title;

    // Update Bottom Nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.route === route);
    });

    // Show/Hide Back Button
    if (['home', 'wheels', 'explore'].includes(route)) {
        backBtn.classList.add('hidden');
        document.querySelector('nav').classList.remove('hidden');
    } else {
        backBtn.classList.remove('hidden');
        document.querySelector('nav').classList.add('hidden'); 
    }

    // Render View
    app.innerHTML = view.render(params);
    app.firstElementChild.classList.add('view-enter');

    // Lifecycle Hook
    if (view.afterRender) {
        // slight delay to ensure DOM is ready if needed, though innerHTML is sync
        requestAnimationFrame(() => view.afterRender(params));
    }
}

// ---- Views ----

function renderHome() {
    const modules = [
        { id: 'wheel', name: 'Spin Wheel', icon: 'bi-pie-chart', color: 'text-cyan-400' },
        { id: 'dice', name: 'Dice Roll', icon: 'bi-dice-5', color: 'text-emerald-400' },
        { id: 'coin', name: 'Coin Flip', icon: 'bi-coin', color: 'text-yellow-400' },
        { id: 'raffle', name: 'Raffle', icon: 'bi-ticket-perforated', color: 'text-purple-400' },
        { id: 'ranking', name: 'Ranking', icon: 'bi-trophy', color: 'text-rose-400' },
        { id: 'rps', name: 'R-P-S', icon: 'bi-scissors', color: 'text-orange-400' } // Rock Paper Scissors
    ];

    return `
        <div class="p-4 grid grid-cols-2 gap-4">
            ${modules.map(m => `
                <div class="feature-card" onclick="window.navigate('${m.id}')">
                    <i class="bi ${m.icon} feature-icon ${m.color}"></i>
                    <span class="font-bold text-sm tracking-wide">${m.name}</span>
                </div>
            `).join('')}
        </div>
        
        <div class="px-6 mt-4">
            <h3 class="text-xs uppercase text-slate-500 font-bold mb-3 tracking-widest">Recent Activity</h3>
            <div class="bg-slate-800/50 rounded-lg p-4 text-center text-slate-500 text-sm italic">
                No recent spins yet.
            </div>
        </div>
    `;
}

function renderWheels() {
    return `
        <div class="p-4 flex flex-col items-center justify-center h-full text-slate-500">
            <i class="bi bi-collection text-4xl mb-2 opacity-50"></i>
            <p>Your saved wheels will appear here.</p>
            <button class="mt-4 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-full transition">
                + Create New Wheel
            </button>
        </div>
    `;
}

function renderExplore() {
    return `
        <div class="p-4">
            <div class="flex gap-4 mb-4 border-b border-slate-700">
                <button class="pb-2 border-b-2 border-cyan-400 text-white font-medium">Trending</button>
                <button class="pb-2 border-b-2 border-transparent text-slate-400 font-medium">New</button>
            </div>
            <div class="grid gap-4">
                <!-- Mock Templates -->
                ${[1,2,3].map(i => `
                    <div class="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                        <div class="h-24 bg-gradient-to-r from-slate-700 to-slate-600 flex items-center justify-center">
                            <i class="bi bi-image text-3xl opacity-20"></i>
                        </div>
                        <div class="p-3 flex justify-between items-center">
                            <div>
                                <h4 class="font-bold text-sm">Dinner Decider</h4>
                                <span class="text-xs text-slate-400">12.5k uses</span>
                            </div>
                            <button class="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center hover:bg-cyan-500 hover:text-slate-900 transition">
                                <i class="bi bi-play-fill"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ---- Modules ----

function renderModuleWheel() {
    return `<div id="wheel-container" class="h-full flex flex-col relative"></div>`;
}

function initWheel() {
    activeModule = new WheelGame('wheel-container');
}

function renderModuleDice() {
    return `<div id="dice-container" class="h-full flex flex-col relative"></div>`;
}

function initDice() {
    activeModule = new DiceGame('dice-container');
}

function renderModuleCoin() {
    return `<div id="coin-container" class="h-full flex flex-col relative"></div>`;
}

function initCoin() {
    activeModule = new CoinGame('coin-container');
}

function renderModuleRaffle() {
    return `<div id="raffle-container" class="h-full flex flex-col relative"></div>`;
}

function initRaffle() {
    activeModule = new RaffleGame('raffle-container');
}

function renderModuleRanking() {
    return `<div id="ranking-container" class="h-full flex flex-col relative"></div>`;
}

function initRanking() {
    activeModule = new RankingGame('ranking-container');
    window.activeRankingInstance = activeModule;
}

function renderModuleRPS() {
    return `<div id="rps-container" class="h-full flex flex-col relative"></div>`;
}

function initRPS() {
    activeModule = new RPSGame('rps-container');
}

// Expose navigate to window for inline onclicks (hack for now)
window.navigate = navigate;

// Boot
init();
