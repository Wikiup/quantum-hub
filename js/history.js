/**
 * History Manager - Track all spins, rolls, flips, and raffles
 * Stores activity in localStorage for persistence
 */

export class HistoryManager {
    constructor() {
        this.storageKey = 'quantum-hub-history';
        this.maxEntries = 100; // Keep last 100 activities
    }

    /**
     * Add a new history entry
     * @param {Object} entry - { type, result, timestamp, details }
     */
    add(entry) {
        const history = this.getAll();
        
        const fullEntry = {
            id: this.generateId(),
            timestamp: Date.now(),
            ...entry
        };
        
        history.unshift(fullEntry); // Add to beginning
        
        // Trim to max entries
        if (history.length > this.maxEntries) {
            history.splice(this.maxEntries);
        }
        
        this.save(history);
        
        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('history-updated', { detail: fullEntry }));
        
        return fullEntry;
    }

    /**
     * Get all history entries
     * @param {Object} filters - { type, limit, since }
     */
    getAll(filters = {}) {
        const history = this.load();
        
        let filtered = history;
        
        // Filter by type
        if (filters.type) {
            filtered = filtered.filter(entry => entry.type === filters.type);
        }
        
        // Filter by time
        if (filters.since) {
            filtered = filtered.filter(entry => entry.timestamp >= filters.since);
        }
        
        // Limit results
        if (filters.limit) {
            filtered = filtered.slice(0, filters.limit);
        }
        
        return filtered;
    }

    /**
     * Get statistics
     */
    getStats() {
        const history = this.getAll();
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        
        // Count by type
        const typeCounts = {};
        history.forEach(entry => {
            typeCounts[entry.type] = (typeCounts[entry.type] || 0) + 1;
        });
        
        // Recent activity (last 24h)
        const recentCount = history.filter(e => (now - e.timestamp) < dayMs).length;
        
        // Most active type
        const mostActive = Object.entries(typeCounts)
            .sort((a, b) => b[1] - a[1])[0] || ['none', 0];
        
        return {
            total: history.length,
            byType: typeCounts,
            recent24h: recentCount,
            mostActive: { type: mostActive[0], count: mostActive[1] },
            firstActivity: history[history.length - 1]?.timestamp || null,
            lastActivity: history[0]?.timestamp || null
        };
    }

    /**
     * Clear all history
     */
    clear() {
        localStorage.removeItem(this.storageKey);
        window.dispatchEvent(new CustomEvent('history-cleared'));
    }

    /**
     * Delete specific entry
     */
    delete(id) {
        const history = this.getAll();
        const filtered = history.filter(entry => entry.id !== id);
        this.save(filtered);
        window.dispatchEvent(new CustomEvent('history-updated'));
    }

    // --- Private Methods ---

    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to load history:', e);
            return [];
        }
    }

    save(history) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(history));
        } catch (e) {
            console.error('Failed to save history:', e);
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    }
}

// Singleton instance
export const history = new HistoryManager();
