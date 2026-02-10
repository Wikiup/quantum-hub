import { store } from '../store.js';
import { HapticFeedback } from '../haptics.js';

/**
 * Explore Module - Template Library
 * Curated collection of ready-to-use wheels
 */

export class ExploreModule {
    constructor(container) {
        this.container = typeof container === 'string' 
            ? document.getElementById(container) 
            : container;
        
        // Curated Templates Database
        this.templates = [
            {
                id: 'yes-no',
                name: 'Yes or No',
                description: 'Classic binary decision maker',
                category: 'Quick Decisions',
                icon: 'bi-check-circle',
                color: 'from-emerald-500 to-cyan-500',
                uses: '50.2k',
                segments: [
                    { label: 'Yes ✓', color: '#10b981' },
                    { label: 'No ✗', color: '#ef4444' }
                ]
            },
            {
                id: 'magic-8-ball',
                name: 'Magic 8-Ball',
                description: 'Ask and receive cosmic wisdom',
                category: 'Fun & Games',
                icon: 'bi-circle-fill',
                color: 'from-purple-500 to-pink-500',
                uses: '42.8k',
                segments: [
                    { label: 'Yes!', color: '#10b981' },
                    { label: 'No', color: '#ef4444' },
                    { label: 'Maybe', color: '#f59e0b' },
                    { label: 'Definitely', color: '#22c55e' },
                    { label: 'Never', color: '#dc2626' },
                    { label: 'Ask Again', color: '#8b5cf6' },
                    { label: 'Very Likely', color: '#14b8a6' },
                    { label: 'Outlook Good', color: '#06b6d4' }
                ]
            },
            {
                id: 'lunch-ideas',
                name: 'Lunch Decider',
                description: 'What should we eat today?',
                category: 'Food & Dining',
                icon: 'bi-cup-straw',
                color: 'from-orange-500 to-red-500',
                uses: '38.5k',
                segments: [
                    { label: '🍕 Pizza', color: '#ef4444' },
                    { label: '🍣 Sushi', color: '#f59e0b' },
                    { label: '🍔 Burger', color: '#eab308' },
                    { label: '🥗 Salad', color: '#22c55e' },
                    { label: '🌮 Tacos', color: '#3b82f6' },
                    { label: '🍝 Pasta', color: '#8b5cf6' },
                    { label: '🍜 Ramen', color: '#ec4899' },
                    { label: '🥙 Wrap', color: '#14b8a6' }
                ]
            },
            {
                id: 'movie-night',
                name: 'Movie Genre Picker',
                description: 'What genre should we watch?',
                category: 'Entertainment',
                icon: 'bi-film',
                color: 'from-blue-500 to-indigo-500',
                uses: '29.3k',
                segments: [
                    { label: '🎬 Action', color: '#ef4444' },
                    { label: '😂 Comedy', color: '#eab308' },
                    { label: '🎭 Drama', color: '#8b5cf6' },
                    { label: '👻 Horror', color: '#1f2937' },
                    { label: '🚀 Sci-Fi', color: '#3b82f6' },
                    { label: '💕 Romance', color: '#ec4899' },
                    { label: '🔍 Mystery', color: '#6366f1' },
                    { label: '🤠 Western', color: '#92400e' }
                ]
            },
            {
                id: 'workout',
                name: 'Workout Randomizer',
                description: 'Random exercise generator',
                category: 'Health & Fitness',
                icon: 'bi-heart-pulse',
                color: 'from-red-500 to-rose-500',
                uses: '25.7k',
                segments: [
                    { label: '🏃 Cardio', color: '#ef4444' },
                    { label: '💪 Strength', color: '#f97316' },
                    { label: '🧘 Yoga', color: '#8b5cf6' },
                    { label: '🏋️ HIIT', color: '#dc2626' },
                    { label: '🚴 Cycling', color: '#3b82f6' },
                    { label: '🤸 Stretching', color: '#14b8a6' }
                ]
            },
            {
                id: 'dice-1-6',
                name: 'Number 1-6',
                description: 'Classic dice replacement',
                category: 'Quick Decisions',
                icon: 'bi-dice-6',
                color: 'from-cyan-500 to-blue-500',
                uses: '22.1k',
                segments: [
                    { label: '1', color: '#ef4444' },
                    { label: '2', color: '#f59e0b' },
                    { label: '3', color: '#eab308' },
                    { label: '4', color: '#22c55e' },
                    { label: '5', color: '#3b82f6' },
                    { label: '6', color: '#8b5cf6' }
                ]
            },
            {
                id: 'truth-dare',
                name: 'Truth or Dare',
                description: 'Classic party game decision',
                category: 'Fun & Games',
                icon: 'bi-lightning-charge',
                color: 'from-yellow-500 to-orange-500',
                uses: '19.8k',
                segments: [
                    { label: 'Truth 🤔', color: '#3b82f6' },
                    { label: 'Dare 🔥', color: '#ef4444' }
                ]
            },
            {
                id: 'weekend-activity',
                name: 'Weekend Plans',
                description: 'What to do this weekend?',
                category: 'Lifestyle',
                icon: 'bi-calendar-check',
                color: 'from-teal-500 to-green-500',
                uses: '17.2k',
                segments: [
                    { label: '🎮 Gaming', color: '#8b5cf6' },
                    { label: '🎨 Creative', color: '#ec4899' },
                    { label: '🌳 Outdoor', color: '#22c55e' },
                    { label: '📚 Reading', color: '#3b82f6' },
                    { label: '🎵 Music', color: '#f59e0b' },
                    { label: '👥 Social', color: '#14b8a6' },
                    { label: '🏡 Home Project', color: '#6366f1' },
                    { label: '😴 Rest & Relax', color: '#06b6d4' }
                ]
            },
            {
                id: 'team-builder',
                name: 'Team Randomizer',
                description: 'Split into Team A or B',
                category: 'Games & Sports',
                icon: 'bi-people-fill',
                color: 'from-indigo-500 to-purple-500',
                uses: '15.6k',
                segments: [
                    { label: 'Team A 🔵', color: '#3b82f6' },
                    { label: 'Team B 🔴', color: '#ef4444' }
                ]
            },
            {
                id: 'study-break',
                name: 'Study Break Ideas',
                description: 'How to spend your study break',
                category: 'Productivity',
                icon: 'bi-book',
                color: 'from-violet-500 to-purple-500',
                uses: '12.9k',
                segments: [
                    { label: '☕ Coffee Break', color: '#92400e' },
                    { label: '🚶 Walk', color: '#22c55e' },
                    { label: '🧘 Meditate', color: '#8b5cf6' },
                    { label: '🎵 Music', color: '#f59e0b' },
                    { label: '💪 Quick Exercise', color: '#ef4444' },
                    { label: '📱 Social Media', color: '#3b82f6' }
                ]
            },
            {
                id: 'chore-picker',
                name: 'Chore Selector',
                description: 'Who does which chore?',
                category: 'Household',
                icon: 'bi-house',
                color: 'from-slate-500 to-gray-500',
                uses: '11.4k',
                segments: [
                    { label: '🧹 Sweep', color: '#6b7280' },
                    { label: '🧽 Dishes', color: '#3b82f6' },
                    { label: '🗑️ Trash', color: '#22c55e' },
                    { label: '🧺 Laundry', color: '#8b5cf6' },
                    { label: '🪟 Windows', color: '#06b6d4' },
                    { label: '🌱 Plants', color: '#10b981' }
                ]
            },
            {
                id: 'rock-paper-scissors',
                name: 'Rock Paper Scissors',
                description: 'Classic hand game randomizer',
                category: 'Fun & Games',
                icon: 'bi-scissors',
                color: 'from-gray-500 to-slate-500',
                uses: '10.2k',
                segments: [
                    { label: '🪨 Rock', color: '#6b7280' },
                    { label: '📄 Paper', color: '#f3f4f6' },
                    { label: '✂️ Scissors', color: '#3b82f6' }
                ]
            }
        ];

        this.currentCategory = 'all';
    }

    render() {
        const categories = ['all', ...new Set(this.templates.map(t => t.category))];
        
        const filteredTemplates = this.currentCategory === 'all' 
            ? this.templates 
            : this.templates.filter(t => t.category === this.currentCategory);

        this.container.innerHTML = `
            <div class="h-full overflow-y-auto pb-20">
                <!-- Header -->
                <div class="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3">
                    <h2 class="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                        Template Library
                    </h2>
                    <p class="text-sm text-slate-400">
                        Instant wheels for every occasion
                    </p>
                </div>

                <!-- Category Tabs -->
                <div class="px-4 pt-4 pb-2 overflow-x-auto">
                    <div class="flex gap-2 whitespace-nowrap" id="category-tabs">
                        ${categories.map(cat => `
                            <button 
                                data-category="${cat}" 
                                class="category-tab px-4 py-2 rounded-full text-sm font-medium transition ${
                                    cat === this.currentCategory 
                                        ? 'bg-cyan-500 text-slate-900' 
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                }">
                                ${cat === 'all' ? 'All Templates' : cat}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Templates Grid -->
                <div class="px-4 pb-4">
                    <div class="grid grid-cols-1 gap-4" id="templates-grid">
                        ${filteredTemplates.map(template => this.renderTemplateCard(template)).join('')}
                    </div>
                    
                    ${filteredTemplates.length === 0 ? `
                        <div class="text-center py-12 text-slate-500">
                            <i class="bi bi-inbox text-4xl opacity-50 mb-2"></i>
                            <p>No templates in this category</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        this.attachEvents();
    }

    renderTemplateCard(template) {
        return `
            <div class="template-card bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700 overflow-hidden hover:border-cyan-500/50 transition transform hover:scale-[1.02] active:scale-[0.98]">
                <!-- Header with Gradient -->
                <div class="bg-gradient-to-r ${template.color} p-4 relative overflow-hidden">
                    <div class="absolute inset-0 opacity-20">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl -mr-16 -mt-16"></div>
                    </div>
                    <div class="relative flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <i class="bi ${template.icon} text-2xl text-white"></i>
                                <h3 class="font-bold text-white text-lg">${template.name}</h3>
                            </div>
                            <p class="text-white/80 text-sm">${template.description}</p>
                        </div>
                    </div>
                </div>

                <!-- Body -->
                <div class="p-4">
                    <!-- Category & Stats -->
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-slate-300">
                            ${template.category}
                        </span>
                        <span class="text-xs text-slate-500 flex items-center gap-1">
                            <i class="bi bi-fire"></i>
                            ${template.uses} uses
                        </span>
                    </div>

                    <!-- Color Preview Dots -->
                    <div class="flex gap-1 mb-4">
                        ${template.segments.slice(0, 8).map(seg => `
                            <div class="w-3 h-3 rounded-full" style="background: ${seg.color}" title="${seg.label}"></div>
                        `).join('')}
                        ${template.segments.length > 8 ? `
                            <span class="text-xs text-slate-500 ml-1">+${template.segments.length - 8}</span>
                        ` : ''}
                    </div>

                    <!-- Segment Count -->
                    <div class="text-xs text-slate-400 mb-3">
                        ${template.segments.length} options
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex gap-2">
                        <button 
                            data-template-id="${template.id}" 
                            class="spin-template-btn flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-lg transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2">
                            <i class="bi bi-play-circle"></i>
                            Spin Now
                        </button>
                        <button 
                            data-template-id="${template.id}" 
                            class="clone-template-btn px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition flex items-center justify-center">
                            <i class="bi bi-plus-square"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    attachEvents() {
        // Category tab switching
        const tabs = this.container.querySelectorAll('.category-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                HapticFeedback.light();
                this.currentCategory = tab.dataset.category;
                this.render();
            });
        });

        // Spin template buttons
        const spinButtons = this.container.querySelectorAll('.spin-template-btn');
        spinButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                HapticFeedback.medium();
                const templateId = btn.dataset.templateId;
                this.spinTemplate(templateId);
            });
        });

        // Clone template buttons
        const cloneButtons = this.container.querySelectorAll('.clone-template-btn');
        cloneButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                HapticFeedback.light();
                const templateId = btn.dataset.templateId;
                this.cloneTemplate(templateId);
            });
        });
    }

    spinTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;

        // Navigate to wheel module with template data
        window.navigate('wheel', { 
            customSegments: template.segments,
            templateName: template.name
        });
    }

    cloneTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;

        // Create a new wheel from template
        const wheel = {
            name: template.name + ' (Copy)',
            segments: [...template.segments],
            isDefault: false
        };

        const savedWheel = store.saveWheel(wheel);
        
        // Show success toast
        this.showToast(`✓ "${template.name}" added to your wheels!`);
        
        // Optionally navigate to wheels library
        setTimeout(() => {
            window.navigate('wheels');
        }, 1500);
    }

    showToast(message) {
        // Check if toast container exists
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = 'toast-message bg-slate-800 border border-cyan-500/50 text-white px-6 py-3 rounded-full shadow-lg shadow-cyan-500/20 mb-2 animate-toast-in pointer-events-auto';
        toast.textContent = message;

        toastContainer.appendChild(toast);

        // Auto remove after 3s
        setTimeout(() => {
            toast.classList.remove('animate-toast-in');
            toast.classList.add('animate-toast-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    destroy() {
        // Cleanup if needed
    }
}
