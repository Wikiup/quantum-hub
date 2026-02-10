import { WheelGame } from './modules/wheel.js';
import { DiceGame } from './modules/dice.js';
import { CoinGame } from './modules/coin.js';
import { RaffleGame } from './modules/raffle.js';
import { RankingGame } from './modules/ranking.js';
import { RPSGame } from './modules/rps.js';
import { StatsGame } from './modules/stats.js';
import { SettingsModule } from './modules/settings.js';
import { ExploreModule } from './modules/explore.js';
import { KeyboardShortcuts } from './keyboard.js';
import { store } from './store.js';
import { history } from './history.js';
import { loading, LoadingUI } from './loading.js';
import { audio } from './audio.js';

// Router and State Management

const routes = {
    home: { title: 'Quantum Hub', render: renderHome },
    wheels: { title: 'My Wheels', render: renderWheels, afterRender: initWheels },
    explore: { title: 'Explore', render: renderExplore, afterRender: initExplore },
    stats: { title: 'Statistics', render: renderModuleStats, afterRender: initStats },
    settings: { title: 'Settings', render: renderSettings, afterRender: initSettings },
    'wheel-editor': { title: 'Wheel Editor', render: renderWheelEditor, afterRender: initWheelEditor },
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
let keyboardShortcuts = null; // Keyboard shortcuts instance

function init() {
    // Nav listeners with sound feedback
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            audio.navigate();
            navigate(btn.dataset.route);
        });
    });

    // Back button with sound
    backBtn.addEventListener('click', () => {
        audio.navigate();
        navigate('home');
    });

    // Initialize Keyboard Shortcuts
    keyboardShortcuts = new KeyboardShortcuts();
    
    // Keyboard help button
    document.getElementById('keyboard-help-btn').addEventListener('click', () => {
        keyboardShortcuts.showHelp();
    });
    
    // Listen for keyboard navigation events
    window.addEventListener('keyboard-navigate', (e) => {
        audio.navigate();
        navigate(e.detail.route);
    });

    // Listen for keyboard primary action events
    window.addEventListener('keyboard-action', (e) => {
        if (e.detail.action === 'primary' && activeModule) {
            // Trigger the primary action button in the active module
            const primaryBtn = document.querySelector('[data-primary-action]');
            if (primaryBtn && !primaryBtn.disabled) {
                primaryBtn.click();
            }
        }
    });
    
    // Listen for history updates to refresh home view
    window.addEventListener('history-updated', () => {
        if (currentRoute === 'home') {
            navigate('home');
        }
    });
    
    // Global clear history handler
    window.clearHistory = () => {
        if (confirm('Clear all activity history? This cannot be undone.')) {
            history.clear();
            navigate('home');
        }
    };

    // Initial Render
    navigate('home');
}

function navigate(route, params = {}) {
    // Show progress bar for navigation
    loading.showProgress();
    
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
    } else if (route === 'wheel-editor') {
        backBtn.classList.remove('hidden');
        document.querySelector('nav').classList.add('hidden');
        // Custom back behavior for editor
        backBtn.onclick = () => navigate('wheels');
    } else {
        backBtn.classList.remove('hidden');
        document.querySelector('nav').classList.add('hidden');
        // Default back to home
        backBtn.onclick = () => navigate('home');
    }

    // Render View
    app.innerHTML = view.render(params);
    app.firstElementChild.classList.add('view-enter');

    // Lifecycle Hook
    if (view.afterRender) {
        // slight delay to ensure DOM is ready if needed, though innerHTML is sync
        requestAnimationFrame(() => {
            view.afterRender(params);
            // Hide progress bar after render
            setTimeout(() => loading.hideProgress(), 100);
        });
    } else {
        // Hide progress bar immediately if no afterRender
        setTimeout(() => loading.hideProgress(), 100);
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
        { id: 'rps', name: 'R-P-S', icon: 'bi-scissors', color: 'text-orange-400' }, // Rock Paper Scissors
        { id: 'stats', name: 'Statistics', icon: 'bi-graph-up', color: 'text-indigo-400' }, // Stats Dashboard
        { id: 'settings', name: 'Settings', icon: 'bi-gear', color: 'text-slate-400' } // Settings
    ];
    
    // Get recent history
    const recentHistory = history.getAll({ limit: 5 });
    
    // Format timestamp
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };
    
    // Icon map
    const iconMap = {
        wheel: 'bi-pie-chart text-cyan-400',
        dice: 'bi-dice-5 text-emerald-400',
        coin: 'bi-coin text-yellow-400',
        raffle: 'bi-ticket-perforated text-purple-400',
        ranking: 'bi-trophy text-rose-400',
        rps: 'bi-scissors text-orange-400'
    };

    return `
        <div class="p-4 grid grid-cols-2 gap-4">
            ${modules.map(m => `
                <div class="feature-card" onclick="window.navigate('${m.id}')">
                    <i class="bi ${m.icon} feature-icon ${m.color}"></i>
                    <span class="font-bold text-sm tracking-wide">${m.name}</span>
                </div>
            `).join('')}
        </div>
        
        <div class="px-6 mt-4 pb-24">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-xs uppercase text-slate-500 font-bold tracking-widest">Recent Activity</h3>
                ${recentHistory.length > 0 ? `<button onclick="window.clearHistory()" class="text-[10px] text-slate-500 hover:text-rose-400 transition"><i class="bi bi-trash"></i></button>` : ''}
            </div>
            
            ${recentHistory.length === 0 ? `
                <div class="bg-slate-800/50 rounded-lg p-4 text-center text-slate-500 text-sm italic">
                    No recent spins yet.
                </div>
            ` : `
                <div class="space-y-2">
                    ${recentHistory.map(entry => `
                        <div class="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 hover:border-slate-600 transition">
                            <div class="flex items-start gap-3">
                                <i class="bi ${iconMap[entry.type]} text-lg mt-0.5"></i>
                                <div class="flex-1 min-w-0">
                                    <div class="font-medium text-sm text-white truncate">${entry.result}</div>
                                    <div class="text-xs text-slate-500 mt-0.5">${formatTime(entry.timestamp)}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

function renderWheels() {
    const wheels = store.getWheels();
    
    if (wheels.length === 0) {
        return `
            <div class="p-4 flex flex-col items-center justify-center h-full text-slate-500">
                <i class="bi bi-collection text-4xl mb-2 opacity-50"></i>
                <p>No wheels yet. Create your first one!</p>
                <button onclick="window.navigate('wheel-editor')" class="mt-4 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-full transition">
                    + Create New Wheel
                </button>
            </div>
        `;
    }
    
    return `
        <div class="p-4 pb-20">
            <button onclick="window.navigate('wheel-editor')" class="w-full mb-4 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-xl transition shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2">
                <i class="bi bi-plus-circle text-xl"></i>
                Create New Wheel
            </button>
            
            <div class="grid grid-cols-1 gap-4">
                ${wheels.map(wheel => `
                    <div class="wheel-library-card bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700 overflow-hidden hover:border-cyan-500/50 transition">
                        <div class="p-4 flex items-start gap-3">
                            <!-- Mini Wheel Preview -->
                            <div class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 flex items-center justify-center relative">
                                <svg class="w-full h-full" viewBox="0 0 100 100">
                                    ${wheel.segments.map((seg, i) => {
                                        const angle = (360 / wheel.segments.length);
                                        const startAngle = i * angle - 90;
                                        const endAngle = startAngle + angle;
                                        const x1 = 50 + 45 * Math.cos(startAngle * Math.PI / 180);
                                        const y1 = 50 + 45 * Math.sin(startAngle * Math.PI / 180);
                                        const x2 = 50 + 45 * Math.cos(endAngle * Math.PI / 180);
                                        const y2 = 50 + 45 * Math.sin(endAngle * Math.PI / 180);
                                        const largeArc = angle > 180 ? 1 : 0;
                                        return `
                                            <path d="M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z" 
                                                  fill="${seg.color}" opacity="0.9" />
                                        `;
                                    }).join('')}
                                    <circle cx="50" cy="50" r="12" fill="#1e293b" stroke="#64748b" stroke-width="2" />
                                </svg>
                            </div>
                            
                            <!-- Info -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between gap-2">
                                    <div class="flex-1 min-w-0">
                                        <h3 class="font-bold text-white truncate">${wheel.name}</h3>
                                        <p class="text-xs text-slate-400 mt-0.5">${wheel.segments.length} options</p>
                                    </div>
                                    ${wheel.isDefault ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-medium shrink-0">Default</span>' : ''}
                                </div>
                                
                                <!-- Color Dots Preview -->
                                <div class="flex gap-1 mt-2">
                                    ${wheel.segments.slice(0, 8).map(seg => `
                                        <div class="w-3 h-3 rounded-full" style="background: ${seg.color}"></div>
                                    `).join('')}
                                    ${wheel.segments.length > 8 ? '<span class="text-[10px] text-slate-500 ml-1">+' + (wheel.segments.length - 8) + '</span>' : ''}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="px-4 pb-4 flex gap-2">
                            <button onclick="window.spinWheel('${wheel.id}')" class="flex-1 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-slate-900 rounded-lg font-medium transition flex items-center justify-center gap-1.5">
                                <i class="bi bi-play-circle"></i>
                                Spin
                            </button>
                            <button onclick="window.editWheel('${wheel.id}')" class="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button onclick="window.duplicateWheel('${wheel.id}')" class="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition">
                                <i class="bi bi-files"></i>
                            </button>
                            ${!wheel.isDefault ? `
                                <button onclick="window.deleteWheel('${wheel.id}')" class="px-3 py-2 bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-lg transition">
                                    <i class="bi bi-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function initWheels() {
    // Attach global wheel actions
    window.spinWheel = (id) => {
        const wheel = store.getWheel(id);
        if (wheel) {
            navigate('wheel', { wheelId: id });
        }
    };
    
    window.editWheel = (id) => {
        navigate('wheel-editor', { wheelId: id });
    };
    
    window.duplicateWheel = (id) => {
        const duplicate = store.duplicateWheel(id);
        if (duplicate) {
            navigate('wheels'); // Refresh view
        }
    };
    
    window.deleteWheel = (id) => {
        if (confirm('Delete this wheel? This cannot be undone.')) {
            store.deleteWheel(id);
            navigate('wheels'); // Refresh view
        }
    };
}

function renderExplore() {
    return `<div id="explore-container" class="h-full flex flex-col relative overflow-hidden"></div>`;
}

function initExplore() {
    activeModule = new ExploreModule(document.getElementById('explore-container'));
    activeModule.render();
}

// ---- Modules ----

function renderWheelEditor(params = {}) {
    const wheelId = params.wheelId;
    const existingWheel = wheelId ? store.getWheel(wheelId) : null;
    
    return `
        <div id="wheel-editor-container" class="h-full overflow-y-auto p-4 pb-24">
            <form id="wheel-editor-form" class="max-w-2xl mx-auto">
                <!-- Wheel Name -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-slate-300 mb-2">Wheel Name</label>
                    <input type="text" id="wheel-name" value="${existingWheel?.name || ''}" 
                           placeholder="e.g. Dinner Ideas, Yes or No" 
                           class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition" 
                           required />
                </div>
                
                <!-- Segments -->
                <div class="mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <label class="text-sm font-medium text-slate-300">Segments</label>
                        <span class="text-xs text-slate-500" id="segment-count">0 options</span>
                    </div>
                    
                    <div id="segments-list" class="space-y-2 mb-3">
                        <!-- Segments will be rendered here -->
                    </div>
                    
                    <button type="button" id="add-segment-btn" class="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 rounded-lg text-slate-400 hover:text-cyan-400 font-medium transition flex items-center justify-center gap-2">
                        <i class="bi bi-plus-circle"></i>
                        Add Segment
                    </button>
                </div>
                
                <!-- Quick Templates -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-slate-300 mb-2">Quick Templates</label>
                    <div class="grid grid-cols-2 gap-2">
                        <button type="button" data-template="yes-no" class="template-btn">Yes/No</button>
                        <button type="button" data-template="1-6" class="template-btn">1-6</button>
                        <button type="button" data-template="lunch" class="template-btn">Lunch Ideas</button>
                        <button type="button" data-template="movie-genres" class="template-btn">Movie Genres</button>
                    </div>
                </div>
                
                <!-- Actions -->
                <div class="flex gap-3">
                    <button type="submit" class="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-xl transition shadow-lg shadow-cyan-500/30">
                        ${existingWheel ? 'Save Changes' : 'Create Wheel'}
                    </button>
                    <button type="button" onclick="window.navigate('wheels')" class="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-xl transition">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;
}

function initWheelEditor(params = {}) {
    const wheelId = params.wheelId;
    const existingWheel = wheelId ? store.getWheel(wheelId) : null;
    
    let segments = existingWheel?.segments || [
        { label: 'Option 1', color: '#FF6B6B' },
        { label: 'Option 2', color: '#4ECDC4' }
    ];
    
    const templates = {
        'yes-no': [
            { label: 'Yes', color: '#10b981' },
            { label: 'No', color: '#ef4444' }
        ],
        '1-6': [
            { label: '1', color: '#ef4444' },
            { label: '2', color: '#f59e0b' },
            { label: '3', color: '#eab308' },
            { label: '4', color: '#22c55e' },
            { label: '5', color: '#3b82f6' },
            { label: '6', color: '#8b5cf6' }
        ],
        'lunch': [
            { label: 'Pizza', color: '#ef4444' },
            { label: 'Sushi', color: '#f59e0b' },
            { label: 'Burger', color: '#eab308' },
            { label: 'Salad', color: '#22c55e' },
            { label: 'Tacos', color: '#3b82f6' },
            { label: 'Pasta', color: '#8b5cf6' }
        ],
        'movie-genres': [
            { label: 'Action', color: '#ef4444' },
            { label: 'Comedy', color: '#eab308' },
            { label: 'Drama', color: '#8b5cf6' },
            { label: 'Horror', color: '#1f2937' },
            { label: 'Sci-Fi', color: '#3b82f6' },
            { label: 'Romance', color: '#ec4899' }
        ]
    };
    
    function renderSegments() {
        const container = document.getElementById('segments-list');
        const countEl = document.getElementById('segment-count');
        
        container.innerHTML = segments.map((seg, index) => `
            <div class="flex items-center gap-2">
                <input type="text" value="${seg.label}" 
                       data-index="${index}" 
                       class="segment-label flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition" 
                       placeholder="Option ${index + 1}" />
                <input type="color" value="${seg.color}" 
                       data-index="${index}" 
                       class="segment-color w-12 h-10 rounded-lg border border-slate-700 cursor-pointer bg-slate-800" />
                <button type="button" data-index="${index}" class="remove-segment-btn w-10 h-10 rounded-lg bg-slate-700 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition flex items-center justify-center">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `).join('');
        
        countEl.textContent = `${segments.length} option${segments.length !== 1 ? 's' : ''}`;
        
        // Attach listeners
        container.querySelectorAll('.segment-label').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                segments[index].label = e.target.value;
            });
        });
        
        container.querySelectorAll('.segment-color').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                segments[index].color = e.target.value;
            });
        });
        
        container.querySelectorAll('.remove-segment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                if (segments.length > 2) {
                    segments.splice(index, 1);
                    renderSegments();
                } else {
                    alert('A wheel must have at least 2 segments.');
                }
            });
        });
    }
    
    function addSegment() {
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F43', '#6C5CE7', '#A8E6CF'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        segments.push({ label: `Option ${segments.length + 1}`, color: randomColor });
        renderSegments();
    }
    
    // Initial render
    renderSegments();
    
    // Add segment button
    document.getElementById('add-segment-btn').addEventListener('click', addSegment);
    
    // Template buttons
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const template = btn.dataset.template;
            if (templates[template]) {
                segments = [...templates[template]];
                renderSegments();
            }
        });
    });
    
    // Form submission
    document.getElementById('wheel-editor-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('wheel-name').value.trim();
        if (!name) {
            alert('Please enter a wheel name.');
            return;
        }
        
        if (segments.length < 2) {
            alert('A wheel must have at least 2 segments.');
            return;
        }
        
        const wheel = {
            id: wheelId || undefined,
            name,
            segments,
            isDefault: false
        };
        
        store.saveWheel(wheel);
        navigate('wheels');
    });
}

function renderModuleWheel(params = {}) {
    return `<div id="wheel-container" class="h-full flex flex-col relative"></div>`;
}
}

function initWheel(params = {}) {
    const wheelId = params.wheelId;
    const customSegments = params.customSegments; // From Explore templates
    let wheelConfig = null;
    
    if (customSegments) {
        // Use custom segments from template
        wheelConfig = customSegments;
    } else if (wheelId) {
        // Load saved wheel
        const savedWheel = store.getWheel(wheelId);
        if (savedWheel) {
            wheelConfig = savedWheel.segments;
        }
    }
    
    activeModule = new WheelGame('wheel-container', wheelConfig);
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

function renderModuleStats() {
    return `<div id="stats-container" class="h-full flex flex-col relative overflow-y-auto"></div>`;
}

function initStats() {
    activeModule = new StatsGame(document.getElementById('stats-container'));
    activeModule.render().then(() => {
        // Animate staggered items after render
        LoadingUI.animateStaggeredList(document.getElementById('stats-container'), '.staggered-item');
    });
}

function renderSettings() {
    return `<div id="settings-container" class="h-full flex flex-col relative overflow-y-auto"></div>`;
}

function initSettings() {
    activeModule = new SettingsModule(document.getElementById('settings-container'));
    activeModule.render();
}

// Expose navigate to window for inline onclicks (hack for now)
window.navigate = navigate;

// Boot
init();
