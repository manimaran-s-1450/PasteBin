import React, { useState, useEffect } from 'react';
import { PageRoute } from '../App';

export interface ProfileProps {
  onNavigate: (page: PageRoute) => void;
}

export const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<{
    fullName?: string;
    username?: string;
    email?: string;
    avatarUrl?: string;
  } | null>(null);
  const [createdCount, setCreatedCount] = useState<number>(0);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('pastebin_user_profile_v1');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      const historyRaw = localStorage.getItem('pastebin_local_history_v1');
      if (historyRaw) {
        const pastes = JSON.parse(historyRaw);
        setCreatedCount(pastes.length);
      }
    } catch (e) {
      console.warn('Profile state sync error', e);
    }
  }, []);

  const displayName = user?.fullName || user?.username || 'John Smith';
  const email = user?.email || 'john@gmail.com';
  const avatarUrl = user?.avatarUrl || null;
  const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handleSignOut = () => {
    localStorage.removeItem('pastebin_jwt_token_v1');
    localStorage.removeItem('pastebin_user_profile_v1');
    onNavigate('home');
  };

  return (
    <main className="max-w-[900px] mx-auto px-4 py-12">
      
      {/* Profile Hero Glass Card */}
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 md:p-10 mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-pink-500" />
        
        <div className="flex flex-col items-center text-center gap-5">
          
          {/* Circular Glass Avatar */}
          <div className="w-24 h-24 rounded-full border-2 border-purple-500 bg-purple-950/40 flex items-center justify-center text-3xl font-extrabold text-white shadow-[0_0_30px_rgba(139,92,246,0.35)] overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          {/* User Details */}
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-1">{displayName}</h1>
            <p className="text-slate-400 font-medium text-sm md:text-base mb-3">{email}</p>
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-300">
              <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Google OAuth Verified</span>
            </div>
          </div>

        </div>
      </div>

      {/* Account Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        
        <div className="bg-[#111827]/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center text-xl font-bold">
            📄
          </div>
          <div>
            <div className="text-2xl font-black text-white">{createdCount}</div>
            <div className="text-xs font-semibold text-slate-400">Total Pastes</div>
          </div>
        </div>

        <div className="bg-[#111827]/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xl font-bold">
            🛡️
          </div>
          <div>
            <div className="text-2xl font-black text-white">Active</div>
            <div className="text-xs font-semibold text-slate-400">Account Status</div>
          </div>
        </div>

        <div className="bg-[#111827]/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xl font-bold">
            📅
          </div>
          <div>
            <div className="text-2xl font-black text-white">Aug 2026</div>
            <div className="text-xs font-semibold text-slate-400">Joined Date</div>
          </div>
        </div>

      </div>

      {/* Quick Action Bar */}
      <div className="bg-[#111827]/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Account Management</h3>
          <p className="text-xs text-slate-400">Manage your pastes or sign out of your session.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => onNavigate('home')}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all border-none cursor-pointer"
          >
            ← Home
          </button>
          
          <button
            onClick={() => onNavigate('history')}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-[0_4px_15px_rgba(139,92,246,0.3)] transition-all border-none cursor-pointer"
          >
            My Pastes
          </button>

          <button
            onClick={handleSignOut}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-bold text-sm transition-all cursor-pointer"
          >
            🚪 Sign Out
          </button>
        </div>
      </div>

    </main>
  );
};

export default Profile;
