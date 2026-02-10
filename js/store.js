/**
 * LocalStorage Wrapper - Centralized data persistence
 */

export class Store {
    constructor(key = 'quantum-hub-data') {
        this.key = key;
        this.data = this.load();
    }

    load() {
        try {
            const raw = localStorage.getItem(this.key);
            return raw ? JSON.parse(raw) : this.getDefaultData();
        } catch (e) {
            console.warn('Failed to load data from localStorage:', e);
            return this.getDefaultData();
        }
    }

    save() {
        try {
            localStorage.setItem(this.key, JSON.stringify(this.data));
        } catch (e) {
            console.error('Failed to save data to localStorage:', e);
        }
    }

    getDefaultData() {
        return {
            wheels: this.getDefaultWheels(),
            settings: {
                haptics: true,
                sound: true,
                darkMode: true
            }
        };
    }

    getDefaultWheels() {
        return [
            {
                id: 'default-yes-no',
                name: 'Yes or No',
                segments: [
                    { label: 'Yes', color: '#10b981' },
                    { label: 'No', color: '#ef4444' }
                ],
                created: Date.now(),
                isDefault: true
            },
            {
                id: 'default-magic-8',
                name: 'Magic 8-Ball',
                segments: [
                    { label: 'Yes', color: '#FF6B6B' },
                    { label: 'No', color: '#4ECDC4' },
                    { label: 'Maybe', color: '#FFE66D' },
                    { label: 'Ask Again', color: '#FF9F43' },
                    { label: 'Definitely', color: '#6C5CE7' },
                    { label: 'Nope', color: '#A8E6CF' }
                ],
                created: Date.now(),
                isDefault: true
            },
            {
                id: 'default-lunch',
                name: 'Lunch Ideas',
                segments: [
                    { label: 'Pizza', color: '#ef4444' },
                    { label: 'Sushi', color: '#f59e0b' },
                    { label: 'Burger', color: '#eab308' },
                    { label: 'Salad', color: '#22c55e' },
                    { label: 'Tacos', color: '#3b82f6' },
                    { label: 'Pasta', color: '#8b5cf6' }
                ],
                created: Date.now(),
                isDefault: true
            }
        ];
    }

    // Wheel Methods
    getWheels() {
        return this.data.wheels || [];
    }

    getWheel(id) {
        return this.data.wheels.find(w => w.id === id);
    }

    saveWheel(wheel) {
        if (!wheel.id) {
            wheel.id = `wheel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            wheel.created = Date.now();
        }
        wheel.updated = Date.now();
        
        const index = this.data.wheels.findIndex(w => w.id === wheel.id);
        if (index >= 0) {
            this.data.wheels[index] = wheel;
        } else {
            this.data.wheels.push(wheel);
        }
        
        this.save();
        return wheel;
    }

    deleteWheel(id) {
        const wheel = this.getWheel(id);
        if (wheel && wheel.isDefault) {
            return false; // Prevent deletion of default wheels
        }
        this.data.wheels = this.data.wheels.filter(w => w.id !== id);
        this.save();
        return true;
    }

    duplicateWheel(id) {
        const original = this.getWheel(id);
        if (!original) return null;
        
        const duplicate = {
            ...original,
            id: `wheel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: `${original.name} (Copy)`,
            created: Date.now(),
            updated: Date.now(),
            isDefault: false
        };
        
        this.data.wheels.push(duplicate);
        this.save();
        return duplicate;
    }

    // Settings Methods
    getSetting(key) {
        return this.data.settings?.[key];
    }

    setSetting(key, value) {
        if (!this.data.settings) {
            this.data.settings = {};
        }
        this.data.settings[key] = value;
        this.save();
    }
}

// Singleton instance
export const store = new Store();
