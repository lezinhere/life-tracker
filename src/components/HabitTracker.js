'use client';
import { useState, useEffect } from 'react';
import {
    Check, Activity, Moon, Dumbbell, Salad, Bed, Droplets, Plus, BarChart3, Calendar,
    Trash2, Pencil, X, BookOpen, Briefcase, Sun, Heart, Brain, Zap, Coffee, Music, Smartphone
} from 'lucide-react';
import { DataManager, formatDate } from '@/lib/DataManager';

const ICON_MAP = {
    Moon, Dumbbell, Salad, Bed, Droplets, Activity,
    BookOpen, Briefcase, Sun, Heart, Brain, Zap, Coffee, Music, Smartphone
};

const getSmartIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('sleep') || n.includes('bed') || n.includes('nap')) return 'Bed';
    if (n.includes('morning') || n.includes('wake') || n.includes('early')) return 'Sun';
    if (n.includes('gym') || n.includes('fitness') || n.includes('run') || n.includes('walk') || n.includes('exercise')) return 'Dumbbell';
    if (n.includes('diet') || n.includes('eat') || n.includes('food') || n.includes('meal') || n.includes('fruit') || n.includes('veg')) return 'Salad';
    if (n.includes('water') || n.includes('drink') || n.includes('hydrate')) return 'Droplets';
    if (n.includes('meditat') || n.includes('mind') || n.includes('calm') || n.includes('breathe') || n.includes('yoga')) return 'Moon';
    if (n.includes('read') || n.includes('book') || n.includes('study') || n.includes('learn')) return 'BookOpen';
    if (n.includes('work') || n.includes('job') || n.includes('career') || n.includes('project')) return 'Briefcase';
    if (n.includes('code') || n.includes('dev') || n.includes('program')) return 'Zap';
    if (n.includes('journal') || n.includes('write')) return 'BookOpen';
    if (n.includes('music') || n.includes('guitar') || n.includes('piano')) return 'Music';
    if (n.includes('phone') || n.includes('social') || n.includes('screen')) return 'Smartphone';
    if (n.includes('coffee') || n.includes('caffeine')) return 'Coffee';
    return 'Activity';
};

export default function HabitTracker() {
    const [habits, setHabits] = useState({});
    const [habitConfig, setHabitConfig] = useState([]);
    const [today, setToday] = useState('');

    // Add/Edit State
    const [newHabitName, setNewHabitName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false); // Mobile 'Edit' toggle

    // View State: 'entry' | 'overview'
    const [viewMode, setViewMode] = useState('entry');
    // Filter State: 'week' | 'month'
    const [filterPeriod, setFilterPeriod] = useState('week');

    useEffect(() => {
        const loadedConfig = DataManager.getHabitConfig();

        // Healing: Fix existing generic icons if they match a smart type
        const healedConfig = loadedConfig.map(h => {
            if (h.icon === 'Activity' || !h.icon) {
                const smartIcon = getSmartIcon(h.label);
                if (smartIcon !== 'Activity') {
                    return { ...h, icon: smartIcon };
                }
            }
            return h;
        });

        // Save if changed (implicit healing)
        if (JSON.stringify(loadedConfig) !== JSON.stringify(healedConfig)) {
            DataManager.setHabitConfig(healedConfig);
        }

        setHabitConfig(healedConfig);
        setHabits(DataManager.getHabits());
        setToday(formatDate(new Date()));
    }, []);

    const toggleHabit = (habitId) => {
        if (isEditMode) return; // Disable toggling while editing

        const currentDayHabits = habits[today] || {};
        const newStatus = !currentDayHabits[habitId];

        const newHabits = {
            ...habits,
            [today]: {
                ...currentDayHabits,
                [habitId]: newStatus
            }
        };

        setHabits(newHabits);
        DataManager.setHabits(newHabits);
    };

    const addOrUpdateHabit = (e) => {
        e.preventDefault();
        if (!newHabitName.trim()) return;

        const smartIcon = getSmartIcon(newHabitName);

        if (editingId) {
            // Update existing
            const updatedConfig = habitConfig.map(h =>
                h.id === editingId ? { ...h, label: newHabitName, icon: smartIcon } : h
            );
            setHabitConfig(updatedConfig);
            DataManager.setHabitConfig(updatedConfig);
            setEditingId(null);
        } else {
            // Add new
            const newConfig = {
                id: `habit-${Date.now()}`,
                label: newHabitName,
                icon: smartIcon
            };
            const updatedConfig = [...habitConfig, newConfig];
            setHabitConfig(updatedConfig);
            DataManager.setHabitConfig(updatedConfig);
        }

        setNewHabitName('');
        setIsAdding(false);
        setIsEditMode(false);
    };

    const deleteHabit = (id) => {
        if (confirm('Are you sure you want to delete this habit?')) {
            const updatedConfig = habitConfig.filter(h => h.id !== id);
            setHabitConfig(updatedConfig);
            DataManager.setHabitConfig(updatedConfig);

            // If deleting the one being edited, reset form
            if (editingId === id) {
                setEditingId(null);
                setNewHabitName('');
                setIsAdding(false);
            }
        }
    };

    const startEdit = (habit) => {
        setNewHabitName(habit.label);
        setEditingId(habit.id);
        setIsAdding(true);
        setViewMode('entry');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setNewHabitName('');
        setIsAdding(false);
    };

    // --- Analytics Logic ---
    const calculateStats = () => {
        const daysToLookBack = filterPeriod === 'week' ? 7 : 30;
        const now = new Date();
        const dates = [];

        // Generate last N dates
        for (let i = 0; i < daysToLookBack; i++) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            dates.push(formatDate(d));
        }

        // Calculate consistency per habit
        const stats = habitConfig.map(config => {
            let completedCount = 0;
            dates.forEach(date => {
                if (habits[date]?.[config.id]) {
                    completedCount++;
                }
            });
            return {
                ...config,
                score: Math.round((completedCount / daysToLookBack) * 100)
            };
        }).sort((a, b) => b.score - a.score);

        const overallConsistency = stats.length > 0
            ? Math.round(stats.reduce((acc, curr) => acc + curr.score, 0) / stats.length)
            : 0;

        return { stats, overallConsistency };
    };

    const { stats, overallConsistency } = calculateStats();

    return (
        <div className="space-y-4">
            {/* 1. iOS Segmented Control & Edit Toggle */}
            <div className="flex gap-3 mb-6">
                <div className="bg-[#1C1C1E] p-1 rounded-xl flex flex-1">
                    <button
                        onClick={() => setViewMode('entry')}
                        className={`flex-1 py-1.5 rounded-[9px] text-[13px] font-semibold transition-all ${viewMode === 'entry' ? 'bg-[var(--card-dark)] text-white shadow-sm' : 'text-[#8E8E93]'}`}
                    >
                        Checklist
                    </button>
                    <button
                        onClick={() => setViewMode('overview')}
                        className={`flex-1 py-1.5 rounded-[9px] text-[13px] font-semibold transition-all ${viewMode === 'overview' ? 'bg-[var(--card-dark)] text-white shadow-sm' : 'text-[#8E8E93]'}`}
                    >
                        Overview
                    </button>
                </div>

                {/* Mobile Edit Toggle */}
                {viewMode === 'entry' && !isAdding && habitConfig.length > 0 && (
                    <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`px-4 py-1.5 rounded-xl text-[13px] font-semibold transition-all ${isEditMode ? 'bg-[#DEF254] text-black' : 'bg-[#1C1C1E] text-[#8E8E93]'}`}
                    >
                        {isEditMode ? 'Done' : 'Edit'}
                    </button>
                )}
            </div>

            {/* VIEW: ENTRY MODE */}
            {viewMode === 'entry' && (
                <>
                    {/* Add/Edit Habit Input */}
                    {isAdding && (
                        <form onSubmit={addOrUpdateHabit} className="mb-6 animate-in slide-in-from-top-2">
                            <input
                                type="text"
                                value={newHabitName}
                                onChange={(e) => setNewHabitName(e.target.value)}
                                placeholder={editingId ? "Rename habit..." : "Name your new habit..."}
                                className="w-full bg-transparent h-[50px] px-2 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition-all font-medium mb-2 border-b border-transparent focus:border-white/10"
                                autoFocus
                            />
                            <div className="flex gap-4">
                                <button type="submit" className="text-sm font-medium text-[var(--primary)]">
                                    {editingId ? 'Update' : 'Save'}
                                </button>
                                <button type="button" onClick={cancelEdit} className="text-sm font-medium text-[var(--text-tertiary)]">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {habitConfig.length === 0 && !isAdding ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <Activity size={24} className="text-white" />
                            </div>
                            <p className="text-sm font-medium text-white">No habits tracked yet.</p>
                        </div>
                    ) : (
                        habitConfig.map((config) => {
                            const Icon = ICON_MAP[config.icon] || Activity;
                            const isCompleted = habits[today]?.[config.id] || false;
                            const isEditingThis = editingId === config.id;

                            if (isEditingThis) return null; // Hide from list while editing

                            return (
                                <div
                                    key={config.id}
                                    className={`w-full flex items-center justify-between p-6 rounded-[20px] transition-all duration-200 mb-4 group relative ${isCompleted && !isEditMode ? 'bg-transparent opacity-40' : 'bg-[var(--card-dark)]'} ${!isEditMode && 'hover:bg-[var(--card-hover)]'}`}
                                >
                                    {/* Main Click Area for Toggling */}
                                    <div
                                        onClick={() => toggleHabit(config.id)}
                                        className={`flex-1 flex items-center gap-4 ${!isEditMode ? 'cursor-pointer' : ''}`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors bg-white/5`}>
                                            <Icon size={22} className={isCompleted && !isEditMode ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'} />
                                        </div>

                                        <div className="text-left">
                                            <div className="text-[16px] font-bold text-[var(--text-primary)]">
                                                {config.label}
                                            </div>
                                            {!isEditMode && (
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-[var(--primary)]' : 'bg-[var(--text-tertiary)]'}`}></div>
                                                    <span className={`text-xs font-medium text-[var(--text-tertiary)]`}>
                                                        {isCompleted ? 'Completed' : 'Up next'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons (Edit/Delete vs Checkmark) */}
                                    <div className="flex items-center gap-2">

                                        {/* Normal Mode: Checkmark */}
                                        {!isEditMode && (
                                            <div
                                                onClick={() => toggleHabit(config.id)}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${isCompleted
                                                    ? 'bg-[var(--primary)] text-black'
                                                    : 'bg-white/5 text-transparent active:bg-white/10'
                                                    }`}
                                            >
                                                <Check size={16} strokeWidth={4} />
                                            </div>
                                        )}

                                        {/* Edit Mode: Action Buttons */}
                                        {isEditMode && (
                                            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                                                {/* Edit Button */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); startEdit(config); }}
                                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={18} />
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteHabit(config.id); }}
                                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FF453A]/10 text-[#FF453A] hover:bg-[#FF453A]/20 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Ghost Add Button (Bottom) */}
                    {!isAdding && !isEditMode && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-4 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors gap-2"
                        >
                            <Plus size={18} />
                            <span className="text-sm font-medium">Add new habit</span>
                        </button>
                    )}
                </>
            )}

            {/* VIEW: OVERVIEW MODE */}
            {viewMode === 'overview' && (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                    {/* Time Filters */}
                    <div className="flex justify-center gap-2 mb-8">
                        {['week', 'month'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setFilterPeriod(p)}
                                className={`px-4 py-2 rounded-full text-xs font-medium capitalize transition-colors ${filterPeriod === p ? 'bg-white text-black' : 'text-[#8E8E93] hover:text-white'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    {/* Hero Stats */}
                    <div className="bg-[var(--card-dark)] p-6 rounded-[24px] text-center mb-8">
                        <div className="text-[#8E8E93] text-xs font-medium uppercase tracking-wide mb-2">Consistency</div>
                        <div className="text-5xl font-bold text-[#DEF254] tracking-tight">
                            {overallConsistency}%
                        </div>
                        <div className="text-[10px] text-[#8E8E93] mt-2">average daily completion</div>
                    </div>

                    {/* Habit Breakdown */}
                    <div className="space-y-6">
                        {stats.map((stat) => {
                            const Icon = ICON_MAP[stat.icon] || Activity;
                            return (
                                <div key={stat.id} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2 text-white font-medium">
                                            <Icon size={14} className="text-[#8E8E93]" />
                                            {stat.label}
                                        </div>
                                        <div className="text-[#8E8E93]">{stat.score}%</div>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="h-[6px] w-full bg-[#1C1C1E] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
                                            style={{ width: `${stat.score}%`, opacity: stat.score > 0 ? 1 : 0.3 }}
                                        ></div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
