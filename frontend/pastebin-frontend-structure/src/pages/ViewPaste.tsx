import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import { getPasteById, PasteItem } from '../services/api';

/**
 * ViewPaste Component (Receive & View Paste)
 * --------------------------------------------------------------------------
 * Purpose:
 * Allows users to fetch and view code snippets using a 8-character paste code.
 * Connects to Express + MySQL backend endpoint GET /api/pastes/:paste_code.
 * Displays formatted code viewer with line numbers and action buttons.
 * --------------------------------------------------------------------------
 */

export const ViewPaste: React.FC = () => {
  const [searchCode, setSearchCode] = useState('');
  const [currentPaste, setCurrentPaste] = useState<PasteItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  /**
   * Fetch Paste Handler
   * Executes GET /api/pastes/:paste_code via API service
   */
  const handleFetchPaste = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeToSearch = searchCode.trim();
    if (!codeToSearch) return;

    setLoading(true);
    setErrorMsg(null);
    setCurrentPaste(null);

    try {
      // Call backend API service endpoint GET /api/pastes/:paste_code
      const res = await getPasteById(codeToSearch);

      if (res && res.success && res.data) {
        setCurrentPaste(res.data);
      } else {
        setErrorMsg('Paste not found.');
      }
    } catch (err: any) {
      console.error('[ViewPaste Component] Error fetching paste:', err);
      setErrorMsg(err?.message || 'Paste not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (currentPaste) {
      navigator.clipboard.writeText(currentPaste.content);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyShareLink = () => {
    const code = (currentPaste as any)?.paste_code || currentPaste?.id || searchCode;
    const shareUrl = `http://localhost:3000/paste/${code}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const lines = currentPaste ? currentPaste.content.split('\n') : [];
  const pasteCodeDisplay = (currentPaste as any)?.paste_code || currentPaste?.id || searchCode;

  return (
    <div className="py-10 px-4 max-w-[960px] mx-auto space-y-8">
      
      {/* HERO HEADER */}
      <section className="text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-3">
          <span>Receive &amp; View <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Paste</span></span>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-[0_4px_18px_rgba(139,92,246,0.45)] flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </div>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Enter a paste code to retrieve code snippets instantly from the backend.
        </p>
      </section>

      {/* SEARCH INPUT BAR */}
      <form onSubmit={handleFetchPaste} className="flex flex-col gap-2 max-w-[600px] mx-auto">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value.toUpperCase().slice(0, 8))}
            placeholder="E.g. GT5WAQFI"
            maxLength={8}
            className="w-full pl-4 pr-16 py-3.5 bg-[#09090B] border border-slate-800 rounded-xl text-white font-mono font-bold tracking-wider focus:outline-none focus:border-purple-500"
          />
          <span className="absolute right-4 text-xs font-mono font-semibold px-2 py-1 rounded-md bg-slate-800/80 text-slate-400">
            {searchCode.length}/8
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>ⓘ Paste codes are 8-character unique identifiers.</span>
          <button
            type="submit"
            disabled={loading || !searchCode.trim()}
            className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-all cursor-pointer border-none disabled:opacity-50"
          >
            {loading ? 'Fetching...' : 'Receive Paste →'}
          </button>
        </div>
      </form>

      {/* FRIENDLY ERROR MESSAGE */}
      {errorMsg && (
        <div className="max-w-[600px] mx-auto p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm font-semibold text-center flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* CODE DISPLAY CARD */}
      {currentPaste && (
        <GlassCard>
          <div className="space-y-6">
            
            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{currentPaste.title}</h2>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/30 text-purple-300 font-bold">
                    {pasteCodeDisplay}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Language: <strong className="text-purple-300">{currentPaste.language}</strong></span>
                  <span>•</span>
                  <span>Created: {new Date(currentPaste.createdAt).toLocaleDateString()}</span>
                  {currentPaste.viewsCount !== undefined && (
                    <>
                      <span>•</span>
                      <span>Views: {currentPaste.viewsCount}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyShareLink}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5 border-none cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                </button>

                <button
                  onClick={handleCopyCode}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 border-none cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            {/* Code Viewer Container */}
            <div className="bg-[#090D1A] border border-slate-800 rounded-xl p-4 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed">
              <div className="table w-full">
                {lines.map((lineText, idx) => (
                  <div key={idx} className="table-row">
                    <span className="table-cell pr-4 text-right text-slate-600 select-none w-8">
                      {idx + 1}
                    </span>
                    <span className="table-cell text-slate-200 whitespace-pre">
                      {lineText}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </GlassCard>
      )}

    </div>
  );
};

export default ViewPaste;
