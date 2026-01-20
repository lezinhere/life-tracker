'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, PenTool, Check, Flag, Calendar, Clock, AlertCircle } from 'lucide-react';
import { DataManager } from '@/lib/DataManager';

export default function TodoModule() {
    const [todos, setTodos] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [priority, setPriority] = useState('low'); // low, medium, high
    const [dueDate, setDueDate] = useState('');

    // View State: 'entry' | 'overview'
    const [viewMode, setViewMode] = useState('entry');
    // Filter State: 'day' | 'week' | 'month'
    const [filterPeriod, setFilterPeriod] = useState('week');

    useEffect(() => {
        setTodos(DataManager.getTodos());
    }, []);

    const saveTodos = (newTodos) => {
        setTodos(newTodos);
        DataManager.setTodos(newTodos);
    };

    const addTodo = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newTodo = {
            id: Date.now(),
            text: inputValue,
            completed: false,
            priority: priority,
            dueDate: dueDate,
            createdAt: new Date().toISOString(), // Track creation
            completedAt: null,
        };

        saveTodos([newTodo, ...todos]);
        setInputValue('');
        setPriority('low');
        setDueDate('');
    };

    const toggleTodo = (id) => {
        const newTodos = todos.map(t => {
            if (t.id === id) {
                const isNowCompleted = !t.completed;
                return {
                    ...t,
                    completed: isNowCompleted,
                    completedAt: isNowCompleted ? new Date().toISOString() : null
                };
            }
            return t;
        });
        saveTodos(newTodos);
    };

    const deleteTodo = (id) => {
        const newTodos = todos.filter(t => t.id !== id);
        saveTodos(newTodos);
    };

    // --- Analytics Logic ---
    const getCompletedStats = () => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Filter completed tasks based on period
        const completedInPeriod = todos.filter(t => {
            if (!t.completed || !t.completedAt) return false;
            const compDate = new Date(t.completedAt);

            if (filterPeriod === 'day') {
                return compDate >= startOfDay;
            } else if (filterPeriod === 'week') {
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - 7);
                return compDate >= startOfWeek;
            } else if (filterPeriod === 'month') {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                return compDate >= startOfMonth;
            }
            return true;
        });

        return {
            count: completedInPeriod.length,
            list: completedInPeriod.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        };
    };

    const stats = getCompletedStats();

    // Completion Rate (All Time)
    const totalTasks = todos.length;
    const totalCompleted = todos.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

    return (
        <div className="space-y-4">
            {/* 1. iOS Segmented Control */}
            <div className="bg-[#1C1C1E] p-1 rounded-xl flex mb-6">
                <button
                    onClick={() => setViewMode('entry')}
                    className={`flex-1 py-1.5 rounded-[9px] text-[13px] font-semibold transition-all ${viewMode === 'entry' ? 'bg-[var(--card-dark)] text-white shadow-sm' : 'text-[#8E8E93]'}`}
                >
                    Tasks
                </button>
                <button
                    onClick={() => setViewMode('overview')}
                    className={`flex-1 py-1.5 rounded-[9px] text-[13px] font-semibold transition-all ${viewMode === 'overview' ? 'bg-[var(--card-dark)] text-white shadow-sm' : 'text-[#8E8E93]'}`}
                >
                    Overview
                </button>
            </div>

            {/* VIEW: ENTRY MODE */}
            {viewMode === 'entry' && (
                <>
                    {/* Minimal Input */}
                    <form onSubmit={addTodo} className="mb-8">
                        <div className="flex items-center bg-[var(--card-dark)] rounded-[20px] px-4 py-2 gap-3 transition-colors focus-within:bg-[var(--card-hover)]">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Add a new task..."
                                className="flex-1 bg-transparent h-[50px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition-all font-medium"
                            />

                            {/* Priority Toggle */}
                            <button
                                type="button"
                                onClick={() => setPriority(p => p === 'low' ? 'medium' : p === 'medium' ? 'high' : 'low')}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${priority === 'high' ? 'bg-[#DEF254] text-black' :
                                    priority === 'medium' ? 'bg-white text-black' :
                                        'bg-white/5 text-[var(--text-tertiary)] hover:bg-white/10'
                                    }`}
                                title="Set Priority"
                            >
                                <Flag size={18} fill={priority === 'high' || priority === 'medium' ? 'currentColor' : 'none'} />
                            </button>

                            {/* Date Picker Trigger */}
                            <div className="relative">
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                                />
                                <button
                                    type="button"
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${dueDate ? 'bg-[#DEF254] text-black' : 'bg-white/5 text-[var(--text-tertiary)] hover:bg-white/10'
                                        }`}
                                >
                                    <Calendar size={18} />
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="space-y-3">
                        {todos.map((todo) => (
                            <div
                                key={todo.id}
                                className={`w-full flex items-center justify-between p-6 rounded-[20px] mb-4 group transition-colors relative overflow-hidden ${todo.completed ? 'bg-transparent opacity-40' : 'bg-[var(--card-dark)] hover:bg-[var(--card-hover)]'}`}
                            >
                                {/* Priority Indicator Strip */}
                                {!todo.completed && todo.priority === 'high' && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#DEF254]"></div>
                                )}
                                {!todo.completed && todo.priority === 'medium' && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>
                                )}

                                <button
                                    onClick={() => toggleTodo(todo.id)}
                                    className="flex items-center gap-4 flex-1 text-left"
                                >
                                    {/* Icon Box - NO FILL, JUST LIME ICON */}
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors bg-white/5 ml-2`}>
                                        <PenTool size={20} className={todo.completed ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'} />
                                    </div>

                                    <div className="flex-1">
                                        <div className={`text-[16px] font-bold transition-all ${todo.completed ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]'}`}>
                                            {todo.text}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                            {/* Priority Badge (if high/med and not completed) */}
                                            {!todo.completed && todo.priority !== 'low' && (
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] uppercase tracking-wide ${todo.priority === 'high' ? 'bg-[#DEF254]/20 text-[#DEF254]' : 'bg-white/20 text-white'
                                                    }`}>
                                                    {todo.priority}
                                                </span>
                                            )}

                                            {/* Due Date */}
                                            {todo.dueDate && (
                                                <div className="flex items-center gap-1 text-[var(--text-tertiary)]">
                                                    <Clock size={10} />
                                                    <span className={`text-xs font-medium ${!todo.completed && new Date(todo.dueDate) < new Date().setHours(0, 0, 0, 0) ? 'text-[#FF453A]' : ''
                                                        }`}>
                                                        {new Date(todo.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${todo.completed ? 'bg-[var(--primary)]' : 'bg-[var(--text-tertiary)]'}`}></div>
                                                <span className={`text-xs font-medium text-[var(--text-tertiary)]`}>
                                                    {todo.completed ? 'Completed' : 'Up next'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => deleteTodo(todo.id)}
                                    className="w-10 h-10 flex items-center justify-center text-[var(--text-tertiary)] hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))
                        }
                        {todos.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <Circle size={24} className="text-white" />
                                </div>
                                <p className="text-sm font-medium text-white">No pending tasks.</p>
                            </div>
                        )}
                    </div>

                    {/* MINIMAL GHOST FAB */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            document.querySelector('input[placeholder="Add a new task..."]').focus();
                        }}
                        className="fixed bottom-8 right-6 bg-[var(--card-dark)] text-[var(--primary)] px-6 py-4 rounded-full shadow-lg hover:bg-[#323234] active:scale-95 transition-all flex items-center gap-3 z-50">
                        <Plus size={20} />
                        <span className="font-medium text-sm tracking-wide">New Task</span>
                    </button>
                </>
            )}

            {/* VIEW: OVERVIEW MODE */}
            {viewMode === 'overview' && (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                    {/* Time Filters */}
                    <div className="flex justify-center gap-2 mb-8">
                        {['day', 'week', 'month'].map((p) => (
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
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-[var(--card-dark)] p-6 rounded-[24px] text-center">
                            <div className="text-[#8E8E93] text-xs font-medium uppercase tracking-wide mb-2">Completed</div>
                            <div className="text-4xl font-bold text-[#DEF254] tracking-tight">
                                {stats.count}
                            </div>
                            <div className="text-[10px] text-[#8E8E93] mt-1">in selected period</div>
                        </div>
                        <div className="bg-[var(--card-dark)] p-6 rounded-[24px] text-center">
                            <div className="text-[#8E8E93] text-xs font-medium uppercase tracking-wide mb-2">Efficiency</div>
                            <div className="text-4xl font-bold text-white tracking-tight">
                                {completionRate}%
                            </div>
                            <div className="text-[10px] text-[#8E8E93] mt-1">all time rate</div>
                        </div>
                    </div>

                    {/* Pending Summary */}
                    <div className="flex gap-4 mb-10">
                        <div className="flex-1 bg-[#1C1C1E] p-4 rounded-[20px] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#DEF254]/10 flex items-center justify-center text-[#DEF254]">
                                    <Flag size={18} fill="currentColor" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-white">
                                        {todos.filter(t => !t.completed && t.priority === 'high').length}
                                    </div>
                                    <div className="text-[10px] text-[#8E8E93] uppercase font-bold">High Priority</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 bg-[#1C1C1E] p-4 rounded-[20px] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                    <AlertCircle size={18} />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-white">
                                        {todos.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date().setHours(0, 0, 0, 0)).length}
                                    </div>
                                    <div className="text-[10px] text-[#8E8E93] uppercase font-bold">Overdue</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recently Completed List */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-[#8E8E93] uppercase tracking-wide px-2">History</h3>
                        {stats.list.length === 0 ? (
                            <div className="text-center text-[#8E8E93] text-sm py-8">No completed tasks in this period.</div>
                        ) : (
                            stats.list.map(todo => (
                                <div key={todo.id} className="flex items-center gap-4 p-4 bg-[var(--card-dark)] rounded-[20px] opacity-60">
                                    <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-black">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-white truncate">{todo.text}</div>
                                        <div className="text-[10px] text-[#8E8E93]">
                                            {new Date(todo.completedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
