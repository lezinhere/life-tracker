'use client';
import { useState, useEffect } from 'react';
import { Search, User, Menu, PenTool, Activity, Wallet } from 'lucide-react';
import TodoModule from '@/components/TodoModule';
import HabitTracker from '@/components/HabitTracker';
import ExpenseTracker from '@/components/ExpenseTracker';

// 3D Icon Colors
const ICON_STYLES = {
  focus: { bg: 'linear-gradient(135deg, #FF9966, #FF5E62)', shadow: 'rgba(255, 94, 98, 0.4)' },
  tasks: { bg: 'linear-gradient(135deg, #56CCF2, #2F80ED)', shadow: 'rgba(47, 128, 237, 0.4)' },
  wallet: { bg: 'linear-gradient(135deg, #F2C94C, #F2994A)', shadow: 'rgba(242, 153, 74, 0.4)' },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('focus'); // focus, tasks, wallet

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] relative pb-20">

      {/* 1. Header Section - Airy Context */}
      <div className="pt-[max(env(safe-area-inset-top),48px)] px-8 pb-4 relative z-10">
        <div className="flex justify-between items-center mb-12">
          {/* Subtle Avatar */}
          <div className="w-10 h-10 rounded-full bg-[var(--card-dark)] overflow-hidden flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
            <span className="text-white font-medium text-xs">LZ</span>
          </div>
          {/* Subtle Menu */}
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors">
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Demoted Header - Reduced Opacity & Weight */}
        <p className="!text-sm font-normal text-white/40 mb-1 tracking-wide">
          What are you doing today?
        </p>
      </div>

      {/* 2. PREMIUM LINE TABS (Navigation) */}
      <div className="px-8 mb-12 relative z-10">
        <div className="flex justify-center gap-10">

          {/* Tab 1: Focus */}
          <button
            onClick={() => setActiveTab('focus')}
            className={`flex items-center gap-2 pb-2 transition-all duration-300 relative ${activeTab === 'focus' ? 'text-[var(--primary)]' : 'text-white/30 hover:text-white/60'}`}
          >
            <Activity size={18} strokeWidth={activeTab === 'focus' ? 2 : 1.5} />
            <span className={`text-sm tracking-wide ${activeTab === 'focus' ? 'font-semibold' : 'font-medium'}`}>Focus</span>
            {activeTab === 'focus' && (
              <div className="absolute bottom-[-8px] left-0 w-full h-[2px] bg-[var(--primary)]"></div>
            )}
          </button>

          {/* Tab 2: Tasks */}
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 pb-2 transition-all duration-300 relative ${activeTab === 'tasks' ? 'text-[var(--primary)]' : 'text-white/30 hover:text-white/60'}`}
          >
            <PenTool size={18} strokeWidth={activeTab === 'tasks' ? 2 : 1.5} />
            <span className={`text-sm tracking-wide ${activeTab === 'tasks' ? 'font-semibold' : 'font-medium'}`}>Tasks</span>
            {activeTab === 'tasks' && (
              <div className="absolute bottom-[-8px] left-0 w-full h-[2px] bg-[var(--primary)]"></div>
            )}
          </button>

          {/* Tab 3: Wallet */}
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex items-center gap-2 pb-2 transition-all duration-300 relative ${activeTab === 'wallet' ? 'text-[var(--primary)]' : 'text-white/30 hover:text-white/60'}`}
          >
            <Wallet size={18} strokeWidth={activeTab === 'wallet' ? 2 : 1.5} />
            <span className={`text-sm tracking-wide ${activeTab === 'wallet' ? 'font-semibold' : 'font-medium'}`}>Wallet</span>
            {activeTab === 'wallet' && (
              <div className="absolute bottom-[-8px] left-0 w-full h-[2px] bg-[var(--primary)]"></div>
            )}
          </button>

        </div>
      </div>

      {/* 3. Content Section */}
      <div className="flex flex-col relative z-20 px-8">
        {/* NEW SECTION HERO - Clean & Bold */}
        <h2 className="text-3xl font-medium text-[var(--text-primary)] mb-10 leading-tight tracking-tight">
          {activeTab === 'focus' && "Habits"}
          {activeTab === 'tasks' && "Tasks"}
          {activeTab === 'wallet' && "Wallet"}
        </h2>

        <div className="pb-32">
          {activeTab === 'focus' && <HabitTracker />}
          {activeTab === 'tasks' && <TodoModule />}
          {activeTab === 'wallet' && <ExpenseTracker />}
        </div>
      </div>

    </div>
  );
}
