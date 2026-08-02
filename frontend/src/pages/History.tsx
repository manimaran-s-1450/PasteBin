import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { getMyPastes, getReceivedPastes, deletePaste, PasteItem } from '../services/api';
import { PageRoute } from '../App';

export interface HistoryProps {
  onEditPaste?: (paste: PasteItem) => void;
  onNavigate?: (page: PageRoute) => void;
}

export const History: React.FC<HistoryProps> = ({ onEditPaste, onNavigate }) => {
  const [pastes, setPastes] = useState<PasteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLang, setFilterLang] = useState('All');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Pasted' | 'Received'>('All');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Custom Premium Light Red Glass Modal State
  const [deleteTargetPaste, setDeleteTargetPaste] = useState<PasteItem | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const isUnexpired = (p: any) => {
    const raw = p.expires_at || p.expiresAt || p.expires_in || p.expiresIn;
    if (!raw || raw === 'never' || raw === 'Never') return true;
    const expDate = new Date(raw);
    if (isNaN(expDate.getTime())) return true;
    return expDate.getTime() > Date.now();
  };

  const fetchPastes = async () => {
    setLoading(true);

    try {
      localStorage.removeItem('pastebin_guest_created_v1');
      localStorage.removeItem('pastebin_guest_received_v1');
      localStorage.removeItem('pastebin_local_history_v1');
      localStorage.removeItem('pastebin_history_pastes_v1');
    } catch (e) {}

    let combined: any[] = [];

    try {
      const token = localStorage.getItem('pastebin_jwt_token_v1');
      if (token) {
        const [myRes, recRes] = await Promise.all([
          getMyPastes().catch(() => null),
          getReceivedPastes().catch(() => null)
        ]);

        if (myRes && myRes.success && Array.isArray(myRes.data)) {
          myRes.data.forEach((p: any) => {
            combined.push({ ...p, category: 'pasted' });
          });
        }

        if (recRes && recRes.success && Array.isArray(recRes.data)) {
          const myCodes = new Set(combined.map(item => item.paste_code || item.id));
          recRes.data.forEach((p: any) => {
            const code = p.paste_code || p.id;
            if (!myCodes.has(code)) {
              combined.push({ ...p, category: 'received' });
            }
          });
        }

        setPastes(combined.filter(isUnexpired));
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('[History Component] Authenticated fetch error:', err);
    }

    // Guest fallback -> Load from sessionStorage (both created & received)
    try {
      const guestCreated = sessionStorage.getItem('pastebin_guest_created_v1');
      const guestReceived = sessionStorage.getItem('pastebin_guest_received_v1');

      if (guestCreated) {
        const parsed = JSON.parse(guestCreated);
        if (Array.isArray(parsed)) {
          parsed.forEach((p: any) => {
            combined.push({ ...p, category: 'pasted' });
          });
        }
      }

      if (guestReceived) {
        const parsedRec = JSON.parse(guestReceived);
        if (Array.isArray(parsedRec)) {
          const myCodes = new Set(combined.map(item => item.code || item.paste_code || item.id));
          parsedRec.forEach((p: any) => {
            const code = p.code || p.paste_code || p.id;
            if (!myCodes.has(code)) {
              combined.push({ ...p, category: 'received' });
            }
          });
        }
      }
    } catch (e) {}

    setPastes(combined.filter(isUnexpired));
    setLoading(false);
  };

  useEffect(() => {
    fetchPastes();
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteTargetPaste) return;
    const target = deleteTargetPaste;
    const targetId = String(target.id);
    const pasteCode = (target as any).paste_code || target.id;
    const targetCode = String(pasteCode);
    const title = target.title;
    const token = localStorage.getItem('pastebin_jwt_token_v1');

    if (token) {
      try {
        const res = await deletePaste(pasteCode);
        if (res && res.success === false) {
          showToast(res.message || 'Failed to delete paste');
          setDeleteTargetPaste(null);
          return;
        }
      } catch (err: any) {
        console.error('[History Component] Delete API error:', err);
        const errorMsg = err?.message || err?.error || 'Failed to delete paste';
        showToast(errorMsg);
        setDeleteTargetPaste(null);
        return;
      }
    }

    // Remove by matching any of: id, paste_code, code
    const updated = pastes.filter((item) => {
      const itemId = String(item.id);
      const itemCode = String((item as any).paste_code || (item as any).code || item.id);
      return itemId !== targetId && itemCode !== targetCode;
    });
    setPastes(updated);

    if (!token) {
      try {
        sessionStorage.setItem('pastebin_guest_created_v1', JSON.stringify(updated));
      } catch (e) {}
    }

    setDeleteTargetPaste(null);
    showToast(`Paste "${title || 'item'}" deleted successfully!`);
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content || '');
      showToast('Copied code snippet to clipboard!');
    } catch (e) {
      showToast('Copied code snippet to clipboard!');
    }
  };

  const handleShare = async (code: string) => {
    const url = `${window.location.origin}/?code=${code}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Copied share link to clipboard!');
    } catch (e) {
      showToast('Copied share link to clipboard!');
    }
  };

  const filteredPastes = pastes.filter((p) => {
    const rawExp = (p as any).expires_at || p.expiresIn;
    if (rawExp && rawExp !== 'never' && rawExp !== 'Never') {
      const d = new Date(rawExp);
      if (!isNaN(d.getTime()) && d.getTime() <= Date.now()) return false;
    }

    const pCat = (p as any).category || 'pasted';
    const matchesCat = activeCategory === 'All' || pCat.toLowerCase() === activeCategory.toLowerCase();

    const code = (p as any).paste_code || p.id || '';
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (p.title || 'Untitled').toLowerCase().includes(searchLower) ||
      code.toLowerCase().includes(searchLower) ||
      p.language.toLowerCase().includes(searchLower);
    const matchesLang = filterLang === 'All' || p.language === filterLang;

    return matchesCat && matchesSearch && matchesLang;
  });

  return (
    <div className="py-10 px-4 max-w-[1100px] mx-auto space-y-8 relative">
      
      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <span>✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* CUSTOM PREMIUM LIGHT RED GLASS DELETE MODAL */}
      {deleteTargetPaste && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="bg-[#111827] border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(244,63,94,0.25)] relative overflow-hidden text-center space-y-5">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-red-500 to-pink-500" />

            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center text-2xl font-bold mx-auto shadow-[0_0_20px_rgba(244,63,94,0.2)]">
              ⚠️
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white mb-1">Delete this Paste?</h3>
              <p className="text-xs text-slate-400">This action cannot be undone. The paste and its share link will be permanently removed.</p>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 font-medium truncate max-w-[200px]">{deleteTargetPaste.title || 'Untitled Paste'}</span>
              <span className="font-mono text-purple-300 font-bold px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/30">
                #{(deleteTargetPaste as any).paste_code || deleteTargetPaste.id}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetPaste(null)}
                className="flex-1 h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all border-none cursor-pointer flex items-center justify-center whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 h-11 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-[0_4px_18px_rgba(244,63,94,0.4)] transition-all border-none cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                <span>Delete</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* HERO HEADER */}
      <section className="text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-3">
          <span>Paste <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">History</span></span>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-[0_4px_18px_rgba(139,92,246,0.45)] flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 8v4l3 3"></path>
              <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"></path>
            </svg>
          </div>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Manage, organize, search, share and edit your personal pastes.
        </p>
      </section>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard gradientTopLine={false} className="!p-4 text-center">
          <div className="text-2xl font-extrabold text-white">{pastes.length}</div>
          <div className="text-xs text-slate-400 font-semibold uppercase">Total Pastes</div>
        </GlassCard>
        <GlassCard gradientTopLine={false} className="!p-4 text-center">
          <div className="text-2xl font-extrabold text-purple-400">
            {pastes.reduce((acc, curr) => acc + (curr.viewsCount || 1), 0)}
          </div>
          <div className="text-xs text-slate-400 font-semibold uppercase">Total Views</div>
        </GlassCard>
        <GlassCard gradientTopLine={false} className="!p-4 text-center">
          <div className="text-2xl font-extrabold text-emerald-400">
            {pastes.filter((p) => p.visibility === 'public' || !p.visibility).length}
          </div>
          <div className="text-xs text-slate-400 font-semibold uppercase">Public Pastes</div>
        </GlassCard>
      </div>

      {/* CATEGORY SEGREGATION TABS */}
      <div className="flex items-center gap-2">
        {(['All', 'Pasted', 'Received'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400 text-white shadow-[0_4px_14px_rgba(168,85,247,0.3)]'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#09090B] border border-slate-800 p-4 rounded-2xl">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search pastes by title, code or language..."
          className="w-full sm:w-80 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-purple-500"
        />

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
          {['All', 'JavaScript', 'TypeScript', 'Python', 'Java', 'SQL'].map((lang) => (
            <button
              key={lang}
              onClick={() => setFilterLang(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                filterLang === lang
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* PASTES LIST LOADING / CONTENT */}
      <div className="space-y-4">
        {loading ? (
          <GlassCard className="text-center py-12 text-slate-400 flex items-center justify-center gap-3">
            <svg className="w-5 h-5 text-purple-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading history pastes...</span>
          </GlassCard>
        ) : filteredPastes.length === 0 ? (
          <GlassCard className="text-center py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-2xl font-bold">
              📄
            </div>
            {localStorage.getItem('pastebin_jwt_token_v1') ? (
              <>
                <h3 className="text-xl font-extrabold text-white">No Pastes Found</h3>
                <p className="text-slate-400 text-sm max-w-sm">No pastes match the selected category or filters.</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-extrabold text-white">No Session History</h3>
                <p className="text-slate-400 text-sm max-w-sm">Your temporary paste history will appear here while this browser session is active.</p>
              </>
            )}
            <button
              onClick={() => onNavigate ? onNavigate('create') : (window.location.href = 'create.html')}
              className="mt-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-[0_4px_15px_rgba(139,92,246,0.35)] transition-all border-none cursor-pointer"
            >
              Create Your First Paste
            </button>
          </GlassCard>
        ) : (
          filteredPastes.map((paste) => {
            const pasteCodeDisplay = (paste as any).paste_code || paste.id;
            const formattedDate = paste.createdAt || (paste as any).created_at ? new Date(paste.createdAt || (paste as any).created_at).toLocaleDateString() : 'Just now';

            return (
              <GlassCard key={paste.id} className="!p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-white">{paste.title || 'Untitled Paste'}</h3>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                        (paste as any).category === 'received'
                          ? 'bg-blue-500/15 border-blue-500/35 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                          : 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.15)]'
                      }`}>
                        {(paste as any).category === 'received' ? 'Received' : 'Pasted'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Language: <strong className="text-purple-300">{paste.language}</strong></span>
                      <span>•</span>
                      <span>Created: {formattedDate}</span>
                    </div>
                  </div>

                  {/* ALL 5 WORKING BUTTONS */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleCopy(paste.content || '')}
                      title="Copy Code"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all border-none cursor-pointer"
                    >
                      📋 Copy
                    </button>

                    <button
                      onClick={() => handleShare(pasteCodeDisplay)}
                      title="Share Link"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white text-xs font-bold transition-all border-none cursor-pointer"
                    >
                      🔗 Share
                    </button>

                    <button
                      onClick={() => onNavigate ? onNavigate('view') : (window.location.href = `view.html?code=${pasteCodeDisplay}`)}
                      title="View Paste"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-xs font-bold transition-all border-none cursor-pointer"
                    >
                      👁️ View
                    </button>

                    {onEditPaste && (
                      <button
                        onClick={() => onEditPaste(paste)}
                        title="Edit Paste"
                        className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all cursor-pointer"
                      >
                        ✏️ Edit
                      </button>
                    )}

                    <button
                      onClick={() => setDeleteTargetPaste(paste)}
                      title="Delete Paste"
                      className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-bold transition-all cursor-pointer"
                    >
                      🗑️ Delete
                    </button>
                  </div>

                </div>
              </GlassCard>
            );
          })
        )}
      </div>

    </div>
  );
};

export default History;
