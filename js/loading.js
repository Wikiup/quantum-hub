/**
 * Loading States Utility
 * Quantum Hub - Sprint #18
 * Premium 2026 UX Pattern
 */

export class LoadingUI {
    constructor() {
        this.progressBar = null;
        this.initProgressBar();
    }

    /**
     * Initialize top progress bar
     */
    initProgressBar() {
        if (!this.progressBar) {
            this.progressBar = document.createElement('div');
            this.progressBar.className = 'progress-bar';
            document.body.prepend(this.progressBar);
        }
    }

    /**
     * Show/hide progress bar
     */
    showProgress() {
        if (this.progressBar) {
            this.progressBar.classList.add('active');
        }
    }

    hideProgress() {
        if (this.progressBar) {
            this.progressBar.classList.remove('active');
        }
    }

    /**
     * Create skeleton screen for a container
     * @param {string} type - 'wheel', 'dice', 'stats', 'generic'
     * @returns {string} HTML skeleton
     */
    static createSkeleton(type = 'generic') {
        const skeletons = {
            wheel: `
                <div class="skeleton-wheel">
                    <div class="skeleton skeleton-wheel-canvas"></div>
                    <div class="skeleton skeleton-text medium"></div>
                    <div class="skeleton skeleton-card" style="width: 80%; height: 3rem;"></div>
                </div>
            `,
            dice: `
                <div class="skeleton-dice">
                    <div class="skeleton-dice-container">
                        <div class="skeleton skeleton-die"></div>
                        <div class="skeleton skeleton-die"></div>
                    </div>
                    <div class="skeleton skeleton-text medium"></div>
                    <div class="skeleton skeleton-card" style="width: 80%; height: 3rem;"></div>
                </div>
            `,
            stats: `
                <div class="skeleton-stats">
                    ${Array(4).fill('<div class="skeleton skeleton-stat-card"></div>').join('')}
                </div>
            `,
            generic: `
                <div class="skeleton-module">
                    <div class="skeleton skeleton-heading"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text short"></div>
                    <div class="skeleton skeleton-card"></div>
                    <div class="skeleton skeleton-text medium"></div>
                </div>
            `
        };

        return skeletons[type] || skeletons.generic;
    }

    /**
     * Show loading overlay on an element
     * @param {HTMLElement} container
     * @param {string} message - Optional loading message
     * @param {string} spinnerColor - 'cyan', 'emerald', 'purple'
     */
    static showOverlay(container, message = 'Loading...', spinnerColor = 'cyan') {
        if (!container) return;

        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner spinner-large spinner-${spinnerColor}"></div>
                ${message ? `<div class="loading-text">${message}</div>` : ''}
            </div>
        `;
        
        container.style.position = 'relative';
        container.appendChild(overlay);
        
        return overlay;
    }

    /**
     * Hide loading overlay
     * @param {HTMLElement} container
     */
    static hideOverlay(container) {
        if (!container) return;
        
        const overlay = container.querySelector('.loading-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 200);
        }
    }

    /**
     * Show empty state
     * @param {HTMLElement} container
     * @param {Object} options - { icon, title, text, action }
     */
    static showEmptyState(container, options = {}) {
        const {
            icon = 'bi-inbox',
            title = 'Nothing here yet',
            text = 'Get started by trying one of the tools!',
            action = null
        } = options;

        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="bi ${icon} empty-state-icon"></i>
            <div class="empty-state-title">${title}</div>
            <div class="empty-state-text">${text}</div>
            ${action ? `<button class="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-full transition" onclick="${action.onClick}">${action.label}</button>` : ''}
        `;

        container.innerHTML = '';
        container.appendChild(emptyState);
    }

    /**
     * Add loading state to button
     * @param {HTMLElement} button
     */
    static setButtonLoading(button) {
        if (!button) return;
        
        button.classList.add('btn-loading');
        button.disabled = true;
        
        // Store original text
        if (!button.dataset.originalText) {
            button.dataset.originalText = button.innerHTML;
        }
    }

    /**
     * Remove loading state from button
     * @param {HTMLElement} button
     */
    static setButtonReady(button) {
        if (!button) return;
        
        button.classList.remove('btn-loading');
        button.disabled = false;
        
        // Restore original text
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
        }
    }

    /**
     * Simulate async operation with loading state
     * @param {HTMLElement} container
     * @param {Function} asyncFn - Async function to execute
     * @param {Object} options - { message, spinnerColor }
     */
    static async withLoading(container, asyncFn, options = {}) {
        const overlay = LoadingUI.showOverlay(container, options.message, options.spinnerColor);
        
        try {
            const result = await asyncFn();
            return result;
        } finally {
            LoadingUI.hideOverlay(container);
        }
    }

    /**
     * Animate staggered list items
     * @param {HTMLElement} container
     * @param {string} itemSelector - CSS selector for items
     * @param {number} delayMs - Delay between items
     */
    static animateStaggeredList(container, itemSelector = '.staggered-item', delayMs = 50) {
        if (!container) return;
        
        const items = container.querySelectorAll(itemSelector);
        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('loaded');
            }, index * delayMs);
        });
    }

    /**
     * Create loading dots
     * @returns {HTMLElement}
     */
    static createLoadingDots() {
        const dots = document.createElement('div');
        dots.className = 'loading-dots';
        dots.innerHTML = `
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
        `;
        return dots;
    }

    /**
     * Show toast notification (simple)
     * @param {string} message
     * @param {string} type - 'success', 'error', 'info'
     */
    static showToast(message, type = 'info') {
        const colors = {
            success: 'bg-emerald-500',
            error: 'bg-red-500',
            info: 'bg-cyan-500'
        };

        const toast = document.createElement('div');
        toast.className = `fixed bottom-24 left-1/2 -translate-x-1/2 ${colors[type]} text-white px-6 py-3 rounded-full shadow-lg font-medium z-50 loading-enter`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.remove('loading-enter');
            toast.classList.add('loading-enter-active');
        });

        // Auto-remove after 3s
        setTimeout(() => {
            toast.classList.remove('loading-enter-active');
            toast.classList.add('loading-exit-active');
            setTimeout(() => toast.remove(), 200);
        }, 3000);
    }
}

// Global instance
export const loading = new LoadingUI();
