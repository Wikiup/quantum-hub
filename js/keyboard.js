/**
 * KEYBOARD SHORTCUTS SYSTEM
 * 2026 UX Best Practice: Power user shortcuts for all major actions
 * 
 * Global Shortcuts:
 * - 1-6: Jump to module (Wheel, Dice, Coin, Raffle, Ranking, RPS)
 * - h: Go Home
 * - ?: Show keyboard shortcuts help modal
 * - Escape: Close modals / Go back
 * 
 * Module Shortcuts:
 * - Space/Enter: Trigger primary action (spin, roll, flip, draw, etc.)
 * - e: Open editor (where applicable)
 * - r: Reset/Clear
 * 
 * Accessibility: Respects input focus (doesn't trigger when typing)
 */

export class KeyboardShortcuts {
    constructor() {
        this.shortcuts = {
            // Navigation
            'h': { action: () => this.navigate('home'), description: 'Go Home', global: true },
            '1': { action: () => this.navigate('wheel'), description: 'Spin Wheel', global: true },
            '2': { action: () => this.navigate('dice'), description: 'Roll Dice', global: true },
            '3': { action: () => this.navigate('coin'), description: 'Flip Coin', global: true },
            '4': { action: () => this.navigate('raffle'), description: 'Raffle Draw', global: true },
            '5': { action: () => this.navigate('ranking'), description: 'Ranking Tool', global: true },
            '6': { action: () => this.navigate('rps'), description: 'Rock-Paper-Scissors', global: true },
            
            // Help
            '?': { action: () => this.showHelp(), description: 'Show keyboard shortcuts', global: true },
            
            // Universal Actions
            'Escape': { action: () => this.handleEscape(), description: 'Close / Go back', global: true },
            ' ': { action: () => this.triggerPrimaryAction(), description: 'Trigger primary action', global: false },
            'Enter': { action: () => this.triggerPrimaryAction(), description: 'Trigger primary action', global: false },
        };

        this.currentModule = null;
        this.helpModalOpen = false;
        this.init();
    }

    init() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    handleKeyPress(e) {
        // Don't trigger shortcuts when typing in input fields
        const isInputFocused = document.activeElement.matches('input, textarea, select, [contenteditable]');
        
        // Exception: Escape should work even in inputs
        if (e.key !== 'Escape' && isInputFocused) return;

        const key = e.key;
        const shortcut = this.shortcuts[key];

        if (shortcut) {
            // Prevent default browser behavior (e.g., space scrolling)
            e.preventDefault();
            shortcut.action();
        }
    }

    navigate(route) {
        // Dispatch custom event for app.js router to handle
        window.dispatchEvent(new CustomEvent('keyboard-navigate', { detail: { route } }));
    }

    handleEscape() {
        // Check if help modal is open
        if (this.helpModalOpen) {
            this.hideHelp();
            return;
        }

        // Check if there's an open modal/overlay
        const modal = document.querySelector('[data-modal], .modal-overlay, .editor-modal');
        if (modal) {
            // Try to find and click close button
            const closeBtn = modal.querySelector('[data-close], .close-btn, button[aria-label="Close"]');
            if (closeBtn) {
                closeBtn.click();
                return;
            }
        }

        // Otherwise, go back to home
        const currentRoute = window.location.hash.slice(1) || 'home';
        if (currentRoute !== 'home') {
            this.navigate('home');
        }
    }

    triggerPrimaryAction() {
        // Dispatch event for active module to handle
        window.dispatchEvent(new CustomEvent('keyboard-action', { detail: { action: 'primary' } }));
    }

    setCurrentModule(moduleName) {
        this.currentModule = moduleName;
    }

    showHelp() {
        if (this.helpModalOpen) return;
        this.helpModalOpen = true;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4';
        modal.setAttribute('data-modal', 'keyboard-help');
        modal.innerHTML = `
            <div class="bg-slate-800 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto border border-slate-700 shadow-2xl">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">⌨️ Keyboard Shortcuts</h2>
                    <button data-close class="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <h3 class="text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wide">Navigation</h3>
                        <div class="space-y-1.5">
                            ${this.shortcutRow('H', 'Go Home')}
                            ${this.shortcutRow('1', 'Spin Wheel')}
                            ${this.shortcutRow('2', 'Roll Dice')}
                            ${this.shortcutRow('3', 'Flip Coin')}
                            ${this.shortcutRow('4', 'Raffle Draw')}
                            ${this.shortcutRow('5', 'Ranking Tool')}
                            ${this.shortcutRow('6', 'Rock-Paper-Scissors')}
                        </div>
                    </div>

                    <div>
                        <h3 class="text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wide">Actions</h3>
                        <div class="space-y-1.5">
                            ${this.shortcutRow('Space', 'Trigger action (spin, roll, flip, etc.)')}
                            ${this.shortcutRow('Enter', 'Trigger action')}
                            ${this.shortcutRow('Esc', 'Close modal / Go back')}
                        </div>
                    </div>

                    <div>
                        <h3 class="text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wide">Help</h3>
                        <div class="space-y-1.5">
                            ${this.shortcutRow('?', 'Show this help')}
                        </div>
                    </div>
                </div>

                <div class="mt-6 pt-4 border-t border-slate-700">
                    <p class="text-xs text-slate-400 text-center">
                        💡 Tip: Shortcuts don't work when typing in text fields
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close handlers
        modal.querySelector('[data-close]').addEventListener('click', () => this.hideHelp());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideHelp();
        });
    }

    shortcutRow(key, description) {
        return `
            <div class="flex items-center justify-between text-sm">
                <span class="text-slate-300">${description}</span>
                <kbd class="px-2.5 py-1 bg-slate-700 border border-slate-600 rounded text-xs font-mono text-cyan-400 shadow-sm">
                    ${key}
                </kbd>
            </div>
        `;
    }

    hideHelp() {
        const modal = document.querySelector('[data-modal="keyboard-help"]');
        if (modal) {
            modal.remove();
            this.helpModalOpen = false;
        }
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyPress);
        this.hideHelp();
    }
}
