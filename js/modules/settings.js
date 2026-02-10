/**
 * Settings Module
 * User preferences and app configuration
 */

export class SettingsModule {
    constructor(container) {
        this.container = container;
        this.settings = this.loadSettings();
    }

    loadSettings() {
        const defaults = {
            theme: 'dark', // dark, light, auto
            soundEffects: true,
            hapticFeedback: true,
            animations: true,
            reducedMotion: false
        };
        
        const saved = localStorage.getItem('quantum-hub-settings');
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    }

    saveSettings() {
        localStorage.setItem('quantum-hub-settings', JSON.stringify(this.settings));
        this.applySettings();
    }

    applySettings() {
        // Apply theme
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        
        // Apply reduced motion
        if (this.settings.reducedMotion) {
            document.documentElement.classList.add('reduce-motion');
        } else {
            document.documentElement.classList.remove('reduce-motion');
        }
        
        // Broadcast settings change event
        window.dispatchEvent(new CustomEvent('settings-changed', { 
            detail: this.settings 
        }));
    }

    async render() {
        this.container.innerHTML = `
            <div class="p-6 pb-24 max-w-2xl mx-auto">
                
                <!-- Header -->
                <div class="mb-6">
                    <h2 class="text-2xl font-bold text-white mb-2">Settings</h2>
                    <p class="text-sm text-slate-400">Customize your Quantum Hub experience</p>
                </div>

                <!-- Appearance Section -->
                <section class="mb-6">
                    <h3 class="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3">Appearance</h3>
                    
                    <div class="space-y-3">
                        <!-- Theme Toggle -->
                        <div class="setting-card">
                            <div class="flex items-center justify-between">
                                <div>
                                    <div class="font-medium text-white">Theme</div>
                                    <div class="text-xs text-slate-400 mt-0.5">Choose your color scheme</div>
                                </div>
                                <div class="flex gap-2">
                                    <button class="theme-btn ${this.settings.theme === 'dark' ? 'active' : ''}" data-theme="dark">
                                        <i class="bi bi-moon-fill"></i>
                                        <span>Dark</span>
                                    </button>
                                    <button class="theme-btn ${this.settings.theme === 'light' ? 'active' : ''}" data-theme="light">
                                        <i class="bi bi-sun-fill"></i>
                                        <span>Light</span>
                                    </button>
                                    <button class="theme-btn ${this.settings.theme === 'auto' ? 'active' : ''}" data-theme="auto">
                                        <i class="bi bi-circle-half"></i>
                                        <span>Auto</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Animations Toggle -->
                        <div class="setting-card">
                            <div class="flex items-center justify-between">
                                <div>
                                    <div class="font-medium text-white">Animations</div>
                                    <div class="text-xs text-slate-400 mt-0.5">Enable smooth transitions</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="animations-toggle" ${this.settings.animations ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <!-- Reduced Motion -->
                        <div class="setting-card">
                            <div class="flex items-center justify-between">
                                <div>
                                    <div class="font-medium text-white">Reduced Motion</div>
                                    <div class="text-xs text-slate-400 mt-0.5">Minimize animations for accessibility</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="reduced-motion-toggle" ${this.settings.reducedMotion ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Interaction Section -->
                <section class="mb-6">
                    <h3 class="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3">Interaction</h3>
                    
                    <div class="space-y-3">
                        <!-- Sound Effects -->
                        <div class="setting-card">
                            <div class="flex items-center justify-between">
                                <div>
                                    <div class="font-medium text-white flex items-center gap-2">
                                        <i class="bi bi-volume-up text-cyan-400"></i>
                                        Sound Effects
                                    </div>
                                    <div class="text-xs text-slate-400 mt-0.5">Play audio feedback</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="sound-toggle" ${this.settings.soundEffects ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <!-- Haptic Feedback -->
                        <div class="setting-card">
                            <div class="flex items-center justify-between">
                                <div>
                                    <div class="font-medium text-white flex items-center gap-2">
                                        <i class="bi bi-phone-vibrate text-emerald-400"></i>
                                        Haptic Feedback
                                    </div>
                                    <div class="text-xs text-slate-400 mt-0.5">Vibration on interactions (mobile)</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="haptic-toggle" ${this.settings.hapticFeedback ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Data Management Section -->
                <section class="mb-6">
                    <h3 class="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3">Data Management</h3>
                    
                    <div class="space-y-3">
                        <!-- Storage Info -->
                        <div class="setting-card">
                            <div class="flex items-center justify-between">
                                <div>
                                    <div class="font-medium text-white">Storage Used</div>
                                    <div class="text-xs text-slate-400 mt-0.5" id="storage-info">Calculating...</div>
                                </div>
                                <i class="bi bi-database text-2xl text-slate-600"></i>
                            </div>
                        </div>

                        <!-- Export Data -->
                        <div class="setting-card">
                            <div class="flex items-center justify-between">
                                <div>
                                    <div class="font-medium text-white">Export All Data</div>
                                    <div class="text-xs text-slate-400 mt-0.5">Download wheels, history & settings</div>
                                </div>
                                <button id="export-all-btn" class="btn-secondary">
                                    <i class="bi bi-download"></i>
                                    Export
                                </button>
                            </div>
                        </div>

                        <!-- Clear All Data -->
                        <div class="setting-card border-red-500/20">
                            <div class="flex items-center justify-between">
                                <div>
                                    <div class="font-medium text-red-400">Clear All Data</div>
                                    <div class="text-xs text-slate-400 mt-0.5">Reset app to factory defaults</div>
                                </div>
                                <button id="clear-all-btn" class="btn-danger">
                                    <i class="bi bi-trash"></i>
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- About Section -->
                <section>
                    <h3 class="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3">About</h3>
                    
                    <div class="setting-card">
                        <div class="text-center py-4">
                            <div class="text-4xl mb-3">⚛️</div>
                            <h4 class="text-xl font-bold text-white mb-1">Quantum Hub</h4>
                            <p class="text-sm text-slate-400 mb-2">Decision Toolkit</p>
                            <p class="text-xs text-slate-500">Version 1.0.0</p>
                            
                            <div class="mt-4 pt-4 border-t border-slate-700">
                                <p class="text-xs text-slate-400">
                                    Built with ❤️ by Rick Sanchez<br>
                                    Powered by chaos & coffee
                                </p>
                            </div>
                            
                            <div class="mt-4 flex flex-wrap justify-center gap-3">
                                <a href="https://github.com/Wikiup/quantum-hub" target="_blank" rel="noopener" class="text-xs text-cyan-400 hover:text-cyan-300 transition">
                                    <i class="bi bi-github"></i> GitHub
                                </a>
                                <a href="https://quantum-hub-fuk-7pk.pages.dev" target="_blank" rel="noopener" class="text-xs text-cyan-400 hover:text-cyan-300 transition">
                                    <i class="bi bi-globe"></i> Website
                                </a>
                                <button id="feedback-btn" class="text-xs text-cyan-400 hover:text-cyan-300 transition">
                                    <i class="bi bi-chat-dots"></i> Feedback
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        `;

        this.attachEventListeners();
        this.updateStorageInfo();
    }

    attachEventListeners() {
        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = btn.dataset.theme;
                this.settings.theme = theme;
                this.saveSettings();
                
                // Update active state
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Animations toggle
        document.getElementById('animations-toggle')?.addEventListener('change', (e) => {
            this.settings.animations = e.target.checked;
            this.saveSettings();
        });

        // Reduced motion toggle
        document.getElementById('reduced-motion-toggle')?.addEventListener('change', (e) => {
            this.settings.reducedMotion = e.target.checked;
            this.saveSettings();
        });

        // Sound effects toggle
        document.getElementById('sound-toggle')?.addEventListener('change', (e) => {
            this.settings.soundEffects = e.target.checked;
            this.saveSettings();
            
            // Play test sound if enabled
            if (e.target.checked) {
                this.playTestSound();
            }
        });

        // Haptic toggle
        document.getElementById('haptic-toggle')?.addEventListener('change', (e) => {
            this.settings.hapticFeedback = e.target.checked;
            this.saveSettings();
            
            // Test vibration if enabled
            if (e.target.checked && navigator.vibrate) {
                navigator.vibrate(50);
            }
        });

        // Export all data
        document.getElementById('export-all-btn')?.addEventListener('click', () => {
            this.exportAllData();
        });

        // Clear all data
        document.getElementById('clear-all-btn')?.addEventListener('click', () => {
            if (confirm('⚠️ Clear ALL data?\n\nThis will delete:\n• All saved wheels\n• Activity history\n• Settings\n\nThis cannot be undone!')) {
                if (confirm('Are you ABSOLUTELY sure? This is your last chance!')) {
                    this.clearAllData();
                }
            }
        });

        // Feedback button
        document.getElementById('feedback-btn')?.addEventListener('click', () => {
            alert('📬 Feedback:\n\nSend suggestions to:\nrick@quantum-hub.dev\n\nOr open an issue on GitHub!');
        });
    }

    updateStorageInfo() {
        try {
            const keys = Object.keys(localStorage);
            const hubKeys = keys.filter(k => k.startsWith('quantum-hub-'));
            
            let totalBytes = 0;
            hubKeys.forEach(key => {
                const value = localStorage.getItem(key);
                totalBytes += key.length + (value?.length || 0);
            });
            
            const kb = (totalBytes / 1024).toFixed(2);
            const infoEl = document.getElementById('storage-info');
            
            if (infoEl) {
                infoEl.textContent = `${kb} KB used (${hubKeys.length} items)`;
            }
        } catch (err) {
            console.error('Storage info error:', err);
        }
    }

    exportAllData() {
        try {
            const data = {
                version: '1.0.0',
                exportDate: new Date().toISOString(),
                settings: this.settings,
                wheels: JSON.parse(localStorage.getItem('quantum-hub-wheels') || '[]'),
                history: JSON.parse(localStorage.getItem('quantum-hub-history') || '[]')
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `quantum-hub-backup-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('✅ Data exported successfully!');
        } catch (err) {
            console.error('Export error:', err);
            this.showToast('❌ Export failed. Check console.');
        }
    }

    clearAllData() {
        try {
            const keys = Object.keys(localStorage);
            const hubKeys = keys.filter(k => k.startsWith('quantum-hub-'));
            
            hubKeys.forEach(key => localStorage.removeItem(key));
            
            this.showToast('🗑️ All data cleared. Reloading...');
            
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err) {
            console.error('Clear error:', err);
            this.showToast('❌ Clear failed. Check console.');
        }
    }

    playTestSound() {
        // Simple beep using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
        } catch (err) {
            console.warn('Sound test failed:', err);
        }
    }

    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg z-50 text-sm font-medium border border-slate-700';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, 10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // Static method to get current settings from localStorage
    static getSettings() {
        const defaults = {
            theme: 'dark',
            soundEffects: true,
            hapticFeedback: true,
            animations: true,
            reducedMotion: false
        };
        
        const saved = localStorage.getItem('quantum-hub-settings');
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    }
}
