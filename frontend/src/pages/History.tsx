import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { getMyPastes, getAllPastes, deletePaste, PasteItem } from '../services/api';
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

  useEffect(() => {
    let isMounted = true;

    async function fetchPastes() {
      setLoading(true);
      try {
        const token = localStorage.getItem('pastebin_jwt_token_v1');
        const res = token ? await getMyPastes() : await getAllPastes();
        if (isMounted && res && res.success && res.data) {
          setPastes(res.data);
        }
      } catch (err) {
        console.error('[History Component] Error fetching pastes:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchPastes();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await deletePaste(id);
      if (res && res.success) {
        setPastes((prev) => prev.filter((item) => String(item.id) !== String(id) && (item as any).paste_code !== id));
      }
    } catch (err) {
      console.error('[History Component] Delete error:', err);
      setPastes((prev) => prev.filter((item) => String(item.id) !== String(id) && (item as any).paste_code !== id));
    }
  };

  const filteredPastes = pastes.filter((p) => {
    const code = (p as any).paste_code || p.id || '';
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (p.title || 'Untitled').toLowerCase().includes(searchLower) ||
      code.toLowerCase().includes(searchLower) ||
      p.language.toLowerCase().includes(searchLower);
    const matchesLang = filterLang === 'All' || p.language === filterLang;
    return matchesSearch && matchesLang;
  });

  return (
    <div className="py-10 px-4 max-w-[1100px] mx-auto space-y-8">
      
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
          Manage, organize, search and edit your personal pastes.
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
            <span>Loading history pastes from backend...</span>
          </GlassCard>
        ) : filteredPastes.length === 0 ? (
          <GlassCard className="text-center py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-2xl font-bold">
              📄
            </div>
            <h3 className="text-xl font-extrabold text-white">No Pastes Yet</h3>
            <p className="text-slate-400 text-sm max-w-sm">You haven't created any pastes yet.</p>
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
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/30 text-purple-300 font-bold">
                        {pasteCodeDisplay}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Language: <strong className="text-purple-300">{paste.language}</strong></span>
                      <span>•</span>
                      <span>Created: {formattedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onEditPaste && (
                      <button
                        onClick={() => onEditPaste(paste)}
                        className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border-none cursor-pointer"
                      >
                        ✏️ Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(paste.id)}
                      className="px-3.5 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-bold border border-red-500/30 transition-all cursor-pointer"
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
