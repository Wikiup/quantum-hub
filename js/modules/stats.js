/**
 * Stats Dashboard Module
 * Visualizes activity history with charts and insights
 */

import { history } from '../history.js';
import { LoadingUI } from '../loading.js';

export class StatsGame {
    constructor(container) {
        this.container = container;
        this.stats = null;
        this.activities = null;
    }

    async render() {
        // Show skeleton loading
        this.container.innerHTML = LoadingUI.createSkeleton('stats');
        
        // Simulate data loading (in real app, this would be async data fetch)
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Load data
        this.stats = history.getStats();
        this.activities = history.getAll();
        
        // Render actual content
        this.container.innerHTML = `
            <div class="stats-dashboard">
                <!-- Overview Cards -->
                <div class="stats-overview">
                    <div class="stat-card staggered-item">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-value">${this.stats.total}</div>
                        <div class="stat-label">Total Activities</div>
                    </div>
                    <div class="stat-card staggered-item">
                        <div class="stat-icon">📅</div>
                        <div class="stat-value">${this.stats.recent24h}</div>
                        <div class="stat-label">Last 24 Hours</div>
                    </div>
                    <div class="stat-card staggered-item">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-value">${this.stats.mostActive || 'N/A'}</div>
                        <div class="stat-label">Most Used</div>
                    </div>
                    <div class="stat-card staggered-item">
                        <div class="stat-icon">🔥</div>
                        <div class="stat-value">${this.calculateStreak()}</div>
                        <div class="stat-label">Day Streak</div>
                    </div>
                </div>

                <!-- Activity Breakdown -->
                <div class="stats-section delayed-content">
                    <h3 class="stats-heading">Activity Breakdown</h3>
                    <div class="stats-breakdown">
                        ${this.renderBreakdown()}
                    </div>
                </div>

                <!-- Usage Chart -->
                <div class="stats-section delayed-content">
                    <h3 class="stats-heading">Usage Over Time</h3>
                    <div class="stats-chart">
                        ${this.renderTimelineChart()}
                    </div>
                </div>

                <!-- Activity Timeline -->
                <div class="stats-section delayed-content">
                    <h3 class="stats-heading">Recent Activity</h3>
                    <div class="stats-timeline">
                        ${this.renderTimeline()}
                    </div>
                </div>

                <!-- Insights -->
                <div class="stats-section">
                    <h3 class="stats-heading">Insights</h3>
                    <div class="stats-insights">
                        ${this.renderInsights()}
                    </div>
                </div>

                <!-- Export Options -->
                <div class="stats-section">
                    <h3 class="stats-heading">Export Data</h3>
                    <div class="export-buttons">
                        <button class="export-btn" data-format="json">
                            <span class="export-icon">📊</span>
                            Export JSON
                        </button>
                        <button class="export-btn" data-format="csv">
                            <span class="export-icon">📄</span>
                            Export CSV
                        </button>
                        <button class="export-btn danger" onclick="window.clearHistory()">
                            <span class="export-icon">🗑️</span>
                            Clear History
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    renderBreakdown() {
        const types = {
            wheel: { icon: '🎡', label: 'Wheel Spins', color: '#3b82f6' },
            dice: { icon: '🎲', label: 'Dice Rolls', color: '#8b5cf6' },
            coin: { icon: '🪙', label: 'Coin Flips', color: '#f59e0b' },
            raffle: { icon: '🎟️', label: 'Raffle Draws', color: '#ec4899' },
            ranking: { icon: '🏆', label: 'Rankings', color: '#10b981' },
            rps: { icon: '✊', label: 'RPS Games', color: '#ef4444' }
        };

        const total = this.stats.total || 1; // Avoid division by zero

        return Object.entries(types).map(([type, config]) => {
            const count = this.stats.byType[type] || 0;
            const percentage = ((count / total) * 100).toFixed(1);
            
            return `
                <div class="breakdown-item">
                    <div class="breakdown-header">
                        <span class="breakdown-icon">${config.icon}</span>
                        <span class="breakdown-label">${config.label}</span>
                        <span class="breakdown-count">${count}</span>
                    </div>
                    <div class="breakdown-bar">
                        <div class="breakdown-fill" style="width: ${percentage}%; background: ${config.color}"></div>
                    </div>
                    <div class="breakdown-percent">${percentage}%</div>
                </div>
            `;
        }).join('');
    }

    renderTimelineChart() {
        // Group activities by day (last 7 days)
        const days = this.getLast7Days();
        const activityByDay = this.groupByDay(this.activities);
        
        const maxCount = Math.max(...days.map(day => activityByDay[day] || 0), 1);

        return `
            <div class="timeline-chart">
                ${days.map(day => {
                    const count = activityByDay[day] || 0;
                    const height = (count / maxCount) * 100;
                    const date = new Date(day);
                    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
                    
                    return `
                        <div class="chart-bar">
                            <div class="chart-column">
                                <div class="chart-fill" style="height: ${height}%">
                                    ${count > 0 ? `<span class="chart-value">${count}</span>` : ''}
                                </div>
                            </div>
                            <div class="chart-label">${dayLabel}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderTimeline() {
        if (this.activities.length === 0) {
            return `<div class="empty-state">No activity yet. Start using Quantum Hub!</div>`;
        }

        return this.activities.slice(0, 20).map(activity => {
            const timeAgo = this.getTimeAgo(activity.timestamp);
            const icon = this.getActivityIcon(activity.type);
            
            return `
                <div class="timeline-item">
                    <div class="timeline-icon">${icon}</div>
                    <div class="timeline-content">
                        <div class="timeline-title">${activity.description}</div>
                        <div class="timeline-time">${timeAgo}</div>
                    </div>
                    <div class="timeline-badge">${activity.type}</div>
                </div>
            `;
        }).join('');
    }

    renderInsights() {
        const insights = [];

        // Favorite module
        if (this.stats.mostActive) {
            const icon = this.getActivityIcon(this.stats.mostActive);
            insights.push({
                icon: '⭐',
                title: 'Favorite Tool',
                text: `You use ${icon} ${this.stats.mostActive} the most!`
            });
        }

        // Activity level
        if (this.stats.recent24h > 10) {
            insights.push({
                icon: '🔥',
                title: 'Power User',
                text: `${this.stats.recent24h} activities in 24 hours! You're on fire!`
            });
        } else if (this.stats.recent24h > 5) {
            insights.push({
                icon: '👍',
                title: 'Active User',
                text: `Great engagement with ${this.stats.recent24h} activities today!`
            });
        }

        // Streak
        const streak = this.calculateStreak();
        if (streak > 3) {
            insights.push({
                icon: '🎯',
                title: 'Consistent User',
                text: `${streak} day streak! Keep it going!`
            });
        }

        // Total milestone
        if (this.stats.total >= 100) {
            insights.push({
                icon: '🏆',
                title: 'Century Club',
                text: `${this.stats.total} total activities! You're a Quantum Hub legend!`
            });
        } else if (this.stats.total >= 50) {
            insights.push({
                icon: '🌟',
                title: 'Half Century',
                text: `${this.stats.total} activities and counting!`
            });
        }

        // Diversity check
        const usedModules = Object.values(this.stats.byType).filter(count => count > 0).length;
        if (usedModules === 6) {
            insights.push({
                icon: '🎨',
                title: 'Jack of All Trades',
                text: `You've tried all ${usedModules} modules! Diverse decision-maker!`
            });
        }

        if (insights.length === 0) {
            insights.push({
                icon: '🚀',
                title: 'Getting Started',
                text: 'Keep using Quantum Hub to unlock insights!'
            });
        }

        return insights.map(insight => `
            <div class="insight-card">
                <div class="insight-icon">${insight.icon}</div>
                <div class="insight-content">
                    <div class="insight-title">${insight.title}</div>
                    <div class="insight-text">${insight.text}</div>
                </div>
            </div>
        `).join('');
    }

    // Helper Methods

    getLast7Days() {
        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 6; i >= 0; i--) {
            const day = new Date(today);
            day.setDate(day.getDate() - i);
            days.push(day.toISOString().split('T')[0]);
        }
        
        return days;
    }

    groupByDay(activities) {
        const grouped = {};
        
        activities.forEach(activity => {
            const date = new Date(activity.timestamp);
            const day = date.toISOString().split('T')[0];
            grouped[day] = (grouped[day] || 0) + 1;
        });
        
        return grouped;
    }

    calculateStreak() {
        if (this.activities.length === 0) return 0;

        const days = new Set();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.activities.forEach(activity => {
            const date = new Date(activity.timestamp);
            date.setHours(0, 0, 0, 0);
            days.add(date.toISOString().split('T')[0]);
        });

        let streak = 0;
        let currentDay = new Date(today);

        while (true) {
            const dayStr = currentDay.toISOString().split('T')[0];
            if (days.has(dayStr)) {
                streak++;
                currentDay.setDate(currentDay.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    }

    getActivityIcon(type) {
        const icons = {
            wheel: '🎡',
            dice: '🎲',
            coin: '🪙',
            raffle: '🎟️',
            ranking: '🏆',
            rps: '✊'
        };
        return icons[type] || '🎯';
    }

    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    }

    attachEventListeners() {
        // Export buttons
        const exportButtons = this.container.querySelectorAll('.export-btn[data-format]');
        exportButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const format = btn.dataset.format;
                this.exportData(format);
            });
        });
    }

    exportData(format) {
        if (format === 'json') {
            const data = {
                stats: this.stats,
                activities: this.activities,
                exportedAt: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            this.downloadFile(blob, `quantum-hub-data-${Date.now()}.json`);
        } else if (format === 'csv') {
            const headers = ['Type', 'Description', 'Timestamp', 'Date'];
            const rows = this.activities.map(a => [
                a.type,
                `"${a.description.replace(/"/g, '""')}"`,
                a.timestamp,
                new Date(a.timestamp).toLocaleString()
            ]);
            
            const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            this.downloadFile(blob, `quantum-hub-data-${Date.now()}.csv`);
        }
    }

    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    destroy() {
        // Cleanup if needed
    }
}
