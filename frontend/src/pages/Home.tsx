import React from 'react';
import GlassCard from '../components/GlassCard';

/**
 * Home Component (Landing Page)
 * --------------------------------------------------------------------------
 * Purpose:
 * Primary landing page introducing PasteBin Pro with hero CTA buttons,
 * feature cards, statistics grid, and quick navigation.
 * --------------------------------------------------------------------------
 */

export interface HomeProps {
  onNavigate: (page: 'create' | 'view' | 'history' | 'docs' | 'about') => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 py-10 px-4 max-w-[1280px] mx-auto">
      
      {/* HERO SECTION */}
      <section className="relative text-center py-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-purple-600/20 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="relative z-10 max-w-[800px] mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
            ✨ Next-Gen Code Sharing
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Share Code Snippets <br />
            <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Instantly & Securely
            </span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl font-medium max-w-xl mx-auto">
            A premium developer platform for creating, retrieving, editing, and managing code pastes with syntax highlighting.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('create')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-base shadow-[0_4px_20px_rgba(139,92,246,0.45)] hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center gap-3 border-none cursor-pointer"
            >
              <span>Create New Paste</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>

            <button
              onClick={() => onNavigate('view')}
              className="px-8 py-4 rounded-xl bg-slate-900 border border-slate-700 text-white font-extrabold text-base hover:bg-slate-800 transition-all flex items-center gap-3 cursor-pointer"
            >
              <span>Receive Paste</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white">Powerful Features</h2>
          <p className="text-slate-400 text-sm">Everything you need for seamless developer collaboration</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <GlassCard className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center text-xl">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-white">Create Pastes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create and publish your pastes instantly with custom expiration timers and visibility controls.
            </p>
          </GlassCard>

          <GlassCard className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center text-xl">
              ✏️
            </div>
            <h3 className="text-lg font-bold text-white">Edit & Update</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Update your code content anytime and keep your pastes up to date.
            </p>
          </GlassCard>

          <GlassCard className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center text-xl">
              📜
            </div>
            <h3 className="text-lg font-bold text-white">History Dashboard</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Manage, organize, search and edit all your created pastes from one place.
            </p>
          </GlassCard>

          <GlassCard className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center text-xl">
              🔑
            </div>
            <h3 className="text-lg font-bold text-white">Unique Share Code</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate a unique code for every paste and share securely with colleagues.
            </p>
          </GlassCard>

        </div>
      </section>

    </div>
  );
};

export default Home;
