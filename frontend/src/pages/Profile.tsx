import React, { useState, useEffect } from 'react';
import { PageRoute } from '../App';
import { getMyPastes, getReceivedPastes, PasteItem } from '../services/api';

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

  const [myPastes, setMyPastes] = useState<PasteItem[]>([]);
  const [receivedPastes, setReceivedPastes] = useState<PasteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'my' | 'received'>('my');

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('pastebin_user_profile_v1');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.warn('Profile state sync error', e);
    }

    async function loadData() {
      setLoading(true);
      try {
        const [myRes, recRes] = await Promise.allSettled([
          getMyPastes(),
          getReceivedPastes()
        ]);

        if (myRes.status === 'fulfilled' && myRes.value && myRes.value.success && myRes.value.data) {
          setMyPastes(myRes.value.data);
        }
        if (recRes.status === 'fulfilled' && recRes.value && recRes.value.success && recRes.value.data) {
          setReceivedPastes(recRes.value.data);
        }
      } catch (e) {
        console.warn('Error loading profile paste stats:', e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
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
    <main className="max-w-[1000px] mx-auto px-4 py-12">
      
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

      {/* Account Stats Grid (My Pastes vs Received Pastes) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        
        <div 
          onClick={() => setActiveTab('my')}
          className={`bg-[#111827]/70 backdrop-blur-xl border rounded-2xl p-6 flex items-center gap-4 cursor-pointer transition-all ${
            activeTab === 'my' ? 'border-purple-500 bg-purple-950/20 shadow-[0_0_20px_rgba(139,92,246,0.25)]' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center text-xl font-bold">
            📄
          </div>
          <div>
            <div className="text-2xl font-black text-white">{loading ? '...' : myPastes.length}</div>
            <div className="text-xs font-semibold text-slate-400">My Pastes</div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('received')}
          className={`bg-[#111827]/70 backdrop-blur-xl border rounded-2xl p-6 flex items-center gap-4 cursor-pointer transition-all ${
            activeTab === 'received' ? 'border-indigo-500 bg-indigo-950/20 shadow-[0_0_20px_rgba(99,102,241,0.25)]' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xl font-bold">
            📥
          </div>
          <div>
            <div className="text-2xl font-black text-white">{loading ? '...' : receivedPastes.length}</div>
            <div className="text-xs font-semibold text-slate-400">Received Pastes</div>
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

      </div>

      {/* Tabs & Items View */}
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 mb-8 space-y-6">
        
        {/* Tab Buttons */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-none cursor-pointer transition-all ${
              activeTab === 'my'
                ? 'bg-purple-600 text-white shadow-[0_4px_15px_rgba(139,92,246,0.3)]'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            My Created Pastes ({myPastes.length})
          </button>

          <button
            onClick={() => setActiveTab('received')}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-none cursor-pointer transition-all ${
              activeTab === 'received'
                ? 'bg-indigo-600 text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)]'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            Received Pastes History ({receivedPastes.length})
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading user pastes...</div>
        ) : activeTab === 'my' ? (
          myPastes.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-slate-400 text-sm">You haven't created any pastes yet.</p>
              <button
                onClick={() => onNavigate('create')}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs border-none cursor-pointer"
              >
                Create Your First Paste
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myPastes.map((p) => {
                const code = (p as any).paste_code || p.id;
                const date = p.createdAt || (p as any).created_at ? new Date(p.createdAt || (p as any).created_at).toLocaleDateString() : 'Recent';
                return (
                  <div key={p.id} className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">{p.title || 'Untitled Paste'}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="font-mono text-purple-300">#{code}</span>
                        <span>•</span>
                        <span>{p.language}</span>
                        <span>•</span>
                        <span>{date}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('history')}
                      className="px-3.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold border border-purple-500/30 cursor-pointer"
                    >
                      View in History
                    </button>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          receivedPastes.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No received pastes recorded yet. Enter a paste code on the Receive Paste page to start building your history.
            </div>
          ) : (
            <div className="space-y-3">
              {receivedPastes.map((p) => {
                const code = (p as any).paste_code || p.id;
                const date = p.createdAt || (p as any).created_at ? new Date(p.createdAt || (p as any).created_at).toLocaleDateString() : 'Recent';
                return (
                  <div key={p.id} className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">{p.title || 'Received Paste'}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="font-mono text-indigo-300">#{code}</span>
                        <span>•</span>
                        <span>{p.language}</span>
                        <span>•</span>
                        <span>Received: {date}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('view')}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold border border-indigo-500/30 cursor-pointer"
                    >
                      Open Snippet
                    </button>
                  </div>
                );
              })}
            </div>
          )
        )}

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
