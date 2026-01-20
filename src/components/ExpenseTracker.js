'use client';
import { useState, useEffect } from 'react';
import { DollarSign, Tag, AlignLeft, Plus, TrendingDown, Utensils, Car, ShoppingBag, Receipt, PieChart, BarChart3, List, Dumbbell, Zap, Wifi, Smartphone, Home, Briefcase, GraduationCap, Plane, Gift, Heart, CreditCard, Fuel, ShoppingCart, Film, Trash2, X } from 'lucide-react';
import { DataManager } from '@/lib/DataManager';

const CATEGORIES = [
    { id: 'food', label: 'Food', icon: Utensils, color: '#FF9F0A' },
    { id: 'transport', label: 'Transport', icon: Car, color: '#0A84FF' },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: '#BF5AF2' },
    { id: 'bills', label: 'Bills', icon: Receipt, color: '#FF453A' },
    { id: 'other', label: 'Misc', icon: Tag, color: '#8E8E93' },
];

const getSmartIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('gym') || n.includes('fitness') || n.includes('workout')) return Dumbbell;
    if (n.includes('bill') || n.includes('rent') || n.includes('electric')) return Zap;
    if (n.includes('sub') || n.includes('netflix') || n.includes('spotify') || n.includes('prime')) return CreditCard;
    if (n.includes('grocery') || n.includes('market') || n.includes('mart') || n.includes('food')) return ShoppingCart;
    if (n.includes('entertainment') || n.includes('movie') || n.includes('cinema') || n.includes('game')) return Film;
    if (n.includes('fuel') || n.includes('gas') || n.includes('petrol') || n.includes('diesel')) return Fuel;
    if (n.includes('wifi') || n.includes('net') || n.includes('data')) return Wifi;
    if (n.includes('phone') || n.includes('mobile')) return Smartphone;
    if (n.includes('home') || n.includes('house')) return Home;
    if (n.includes('work') || n.includes('office')) return Briefcase;
    if (n.includes('study') || n.includes('course')) return GraduationCap;
    if (n.includes('travel') || n.includes('trip') || n.includes('flight')) return Plane;
    if (n.includes('gift') || n.includes('donation')) return Gift;
    if (n.includes('health') || n.includes('med')) return Heart;
    return Tag;
};

export default function ExpenseTracker() {
    const [expenses, setExpenses] = useState([]);
    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('food');

    // Custom Categories State
    const [customCategories, setCustomCategories] = useState([]);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [editingId, setEditingId] = useState(null);

    // View State: 'entry' | 'overview'
    const [viewMode, setViewMode] = useState('entry');
    // Filter State: 'day' | 'week' | 'month'
    const [filterPeriod, setFilterPeriod] = useState('week');

    useEffect(() => {
        const loadedExpenses = DataManager.getExpenses();
        const loadedCats = DataManager.getCustomCategories();

        // REHYDRATION: Re-attach icon components based on name
        const rehydratedCats = loadedCats.map(c => ({
            ...c,
            icon: c.iconName ? getSmartIcon(c.iconName) : (getSmartIcon(c.label) || Tag)
        }));

        setExpenses(loadedExpenses);
        setCustomCategories(rehydratedCats);
    }, []);

    const allCategories = [...CATEGORIES, ...customCategories];

    const addExpense = (e) => {
        e.preventDefault();
        if (!amount) return;

        if (editingId) {
            // Update existing expense
            const updatedExpenses = expenses.map(exp =>
                exp.id === editingId
                    ? { ...exp, amount: parseFloat(amount), category: selectedCategory }
                    : exp
            );
            setExpenses(updatedExpenses);
            DataManager.setExpenses(updatedExpenses);
            setEditingId(null);
            setAmount('');
        } else {
            // Create new expense
            const newExpense = {
                id: Date.now(),
                amount: parseFloat(amount),
                desc: 'Expense',
                category: selectedCategory,
                date: new Date().toISOString(),
            };

            const updatedExpenses = [newExpense, ...expenses];
            setExpenses(updatedExpenses);
            DataManager.setExpenses(updatedExpenses);
            setAmount('');
        }
    };

    const deleteExpense = (id) => {
        const updatedExpenses = expenses.filter(e => e.id !== id);
        setExpenses(updatedExpenses);
        DataManager.setExpenses(updatedExpenses);
        if (editingId === id) {
            setEditingId(null);
            setAmount('');
        }
    };

    const prepareEdit = (expense) => {
        setAmount(expense.amount.toString());
        setSelectedCategory(expense.category);
        setEditingId(expense.id);
        setViewMode('entry'); // Switch to entry mode to show form
    };

    const cancelEdit = () => {
        setEditingId(null);
        setAmount('');
    };

    const handleAddCategory = (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        const name = newCategoryName.trim();
        const iconComponent = getSmartIcon(name);

        const newCat = {
            id: `custom-${Date.now()}`,
            label: name,
            icon: iconComponent,
            iconName: name, // Store name to re-derive icon later
            color: '#DEF254',
            isCustom: true
        };

        const updated = [...customCategories, newCat];
        setCustomCategories(updated);

        // Strip icon component before saving
        const toSave = updated.map(({ icon, ...rest }) => rest);
        DataManager.setCustomCategories(toSave);

        setSelectedCategory(newCat.id);
        setNewCategoryName('');
        setIsAddingCategory(false);
    };

    // --- Analytics Logic ---
    const getFilteredExpenses = () => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return expenses.filter(exp => {
            const expDate = new Date(exp.date);
            if (filterPeriod === 'day') {
                return expDate >= startOfDay;
            } else if (filterPeriod === 'week') {
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - 7);
                return expDate >= startOfWeek;
            } else if (filterPeriod === 'month') {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                return expDate >= startOfMonth;
            }
            return true;
        });
    };

    const filteredData = getFilteredExpenses();
    const totalSpent = filteredData.reduce((sum, item) => sum + item.amount, 0);

    // Group by Category
    const categoryBreakdown = allCategories.map(cat => {
        const catTotal = filteredData
            .filter(e => e.category === cat.id)
            .reduce((sum, e) => sum + e.amount, 0);
        return { ...cat, total: catTotal };
    }).sort((a, b) => b.total - a.total); // Sort highest spend first

    return (
        <div className="space-y-4">
            {/* 1. iOS Segmented Control */}
            <div className="bg-[#1C1C1E] p-1 rounded-xl flex mb-6">
                <button
                    onClick={() => setViewMode('entry')}
                    className={`flex-1 py-1.5 rounded-[9px] text-[13px] font-semibold transition-all ${viewMode === 'entry' ? 'bg-[var(--card-dark)] text-white shadow-sm' : 'text-[#8E8E93]'}`}
                >
                    Entry
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
                    <form onSubmit={addExpense} className="mb-8">
                        <div className="flex-1 h-[50px] px-2 flex items-center mb-4">
                            <span className="text-[#DEF254] font-bold mr-2">₹</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="bg-transparent text-[#DEF254] font-bold text-lg w-full placeholder-[var(--text-tertiary)] outline-none"
                            />
                        </div>

                        {/* Category Pills */}
                        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide items-center">
                            {allCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium ${selectedCategory === cat.id
                                        ? 'bg-[#DEF254] text-black shadow-sm'
                                        : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
                                        }`}
                                >
                                    <cat.icon size={14} />
                                    {cat.label}
                                </button>
                            ))}

                            {/* Add Category Button */}
                            {isAddingCategory ? (
                                <div className="flex items-center bg-white/10 rounded-full px-2 py-1 ml-2 animate-in fade-in slide-in-from-left-4">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Name..."
                                        className="bg-transparent border-none outline-none text-white text-sm w-24 px-2"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault(); // Prevent form submission
                                                handleAddCategory(e);
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddCategory}
                                        className="w-6 h-6 rounded-full bg-[#DEF254] flex items-center justify-center text-black"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsAddingCategory(true)}
                                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/10 shrink-0 ml-1"
                                >
                                    <Plus size={16} />
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="space-y-3">
                        {expenses.map((expense) => {
                            const categoryObj = allCategories.find(c => c.id === expense.category);
                            const CategoryIcon = categoryObj?.icon || Tag;
                            const categoryLabel = categoryObj?.label || expense.category; // Fallback to ID if not found

                            return (
                                <div key={expense.id} className="w-full flex items-center justify-between p-6 bg-[var(--card-dark)] rounded-[20px] mb-4 hover:bg-[var(--card-hover)] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[var(--text-primary)]">
                                            <CategoryIcon size={20} />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-[16px] font-medium text-[var(--text-primary)] capitalize">{categoryLabel}</div>
                                            <div className="text-[12px] text-[var(--text-secondary)] font-medium">Recent Transaction</div>
                                        </div>
                                    </div>

                                    <div className="text-[18px] font-bold text-[#DEF254]">
                                        -₹{expense.amount.toFixed(2)}
                                    </div>
                                </div>
                            );
                        })}
                        {expenses.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <Tag size={24} className="text-white" />
                                </div>
                                <p className="text-sm font-medium text-white">No recent transactions.</p>
                            </div>
                        )}
                    </div>

                    {/* FAB / Action Button */}
                    <div className="fixed bottom-8 right-6 flex gap-3 z-50">
                        {editingId && (
                            <button
                                onClick={cancelEdit}
                                className="bg-[#1C1C1E] text-white px-6 py-4 rounded-full shadow-lg hover:bg-[#2C2C2E] active:scale-95 transition-all flex items-center gap-3"
                            >
                                <X size={20} />
                                <span className="font-medium text-sm tracking-wide">Cancel</span>
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                if (editingId) {
                                    addExpense(e); // Trigger update
                                } else {
                                    document.querySelector('input[type="number"]').focus();
                                }
                            }}
                            className={`px-6 py-4 rounded-full shadow-lg active:scale-95 transition-all flex items-center gap-3 ${editingId ? 'bg-[#DEF254] text-black hover:bg-[#cbe040]' : 'bg-[var(--card-dark)] text-[var(--primary)] hover:bg-[#323234]'
                                }`}
                        >
                            {editingId ? <List size={20} /> : <Plus size={20} />}
                            <span className="font-medium text-sm tracking-wide">{editingId ? 'Update Expense' : 'New Expense'}</span>
                        </button>
                    </div>

                    <div className="space-y-3 pb-24">
                        {expenses.map((expense) => {
                            const categoryObj = allCategories.find(c => c.id === expense.category);
                            const CategoryIcon = categoryObj?.icon || Tag;
                            const categoryLabel = categoryObj?.label || expense.category; // Fallback to ID if not found

                            return (
                                <div key={expense.id} className="group relative w-full flex items-center justify-between p-6 bg-[var(--card-dark)] rounded-[20px] mb-4 hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
                                    onClick={() => prepareEdit(expense)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[var(--text-primary)]">
                                            <CategoryIcon size={20} />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-[16px] font-medium text-[var(--text-primary)] capitalize">{categoryLabel}</div>
                                            <div className="text-[12px] text-[var(--text-secondary)] font-medium">Tap to edit</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-[18px] font-bold text-[#DEF254]">
                                            -₹{expense.amount.toFixed(2)}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent edit click
                                                deleteExpense(expense.id);
                                            }}
                                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#FF453A] hover:bg-[#323234] transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {expenses.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <Tag size={24} className="text-white" />
                                </div>
                                <p className="text-sm font-medium text-white">No recent transactions.</p>
                            </div>
                        )}
                    </div>
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

                    {/* Hero Total */}
                    <div className="text-center mb-10">
                        <div className="text-[#8E8E93] text-sm font-medium uppercase tracking-wide mb-2">Total Spent</div>
                        <div className="text-5xl font-bold text-[#DEF254] tracking-tight">
                            ₹{totalSpent.toFixed(0)}
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="space-y-6">
                        {categoryBreakdown.filter(c => c.total > 0).map((cat) => {
                            const percent = totalSpent > 0 ? (cat.total / totalSpent) * 100 : 0;

                            return (
                                <div key={cat.id} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2 text-white font-medium">
                                            <cat.icon size={14} style={{ color: cat.color }} />
                                            {cat.label}
                                        </div>
                                        <div className="text-[#8E8E93]">₹{cat.total.toFixed(0)} <span className="text-[10px] ml-1 opacity-50">({percent.toFixed(0)}%)</span></div>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="h-[6px] w-full bg-[#1C1C1E] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${percent}%`, backgroundColor: cat.color }}
                                        ></div>
                                    </div>
                                </div>
                            )
                        })}
                        {totalSpent === 0 && (
                            <div className="text-center text-[#8E8E93] text-sm py-8">No data for this period.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
