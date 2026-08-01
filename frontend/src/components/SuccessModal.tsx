import React, { useState, useEffect } from 'react';

/**
 * SuccessModal Component
 * --------------------------------------------------------------------------
 * Purpose:
 * Premium SaaS success modal displayed after creating a new paste.
 * Features vector SVG icons, refined low-ambient glow, hero code display,
 * metadata badges, and visual button hierarchy.
 * 
 * TODO: Backend Integration:
 * The `pasteCode` prop (default: "GT5WAQFI") will be dynamically populated 
 * from the Express backend API response (`res.data.paste_code`).
 * --------------------------------------------------------------------------
 */

export interface SuccessModalProps {
  isOpen: boolean;
  pasteCode?: string;
  language?: string;
  visibility?: string;
  onClose: () => void;
  onCreateAnother: () => void;
  onViewPaste?: () => void;
  onGoToHistory?: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  pasteCode = 'GT5WAQFI',
  language = 'JavaScript',
  visibility = 'Public',
  onClose,
  onCreateAnother,
  onViewPaste,
  onGoToHistory
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shareUrl = `http://localhost:3000/paste/${pasteCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pasteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Check out my code paste on PasteBin: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl transition-all duration-300 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      
      {/* Soft Low-Ambient Radial Background Glow */}
      <div className="absolute w-[300px] h-[300px] bg-purple-600/10 blur-[80px] rounded-full pointer-events-none -z-10" />

      {/* Modal Container Card */}
      <div className="relative w-full max-w-lg bg-[#0D0F1D]/98 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden space-y-6 text-white text-center">
        
        {/* Top Accent Gradient Border Line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-600 via-purple-400 to-pink-500" />

        {/* Close Button (✕) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-700/60 cursor-pointer focus:outline-none"
          aria-label="Close modal"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Animated Success Vector SVG Circular Badge */}
        <div className="pt-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-[2px] shadow-[0_0_18px_rgba(139,92,246,0.35)] mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-[#0D0B18] rounded-full flex items-center justify-center text-purple-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
        </div>

        {/* Header Title & Subtitle */}
        <div className="space-y-1.5">
          <h2 id="modal-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Paste Created Successfully
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed max-w-sm mx-auto">
            Your code snippet has been securely created and is ready to share.
          </p>
        </div>

        {/* HERO SECTION: GENERATED PASTE CODE */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-purple-400">
            YOUR UNIQUE PASTE CODE
          </span>

          <div 
            onClick={handleCopyCode}
            className="relative bg-purple-950/30 backdrop-blur-xl border border-purple-500/35 rounded-2xl p-4 sm:p-4.5 shadow-[0_4px_16px_rgba(139,92,246,0.15)] hover:shadow-[0_4px_24px_rgba(139,92,246,0.25)] hover:border-purple-400 transition-all duration-300 flex items-center justify-between group cursor-pointer"
            title="Click to copy code"
          >
            <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-[0.2em] text-purple-200 mx-auto select-all">
              {pasteCode}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 group-hover:bg-purple-600/40 text-purple-300 flex items-center justify-center transition-all flex-shrink-0">
              {copiedCode ? (
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* PASTE INFORMATION BADGES ROW (VECTOR ICONS) */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="px-3 py-1 rounded-full bg-purple-950/50 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            <span>{language}</span>
          </span>

          <span className="px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span>{visibility}</span>
          </span>

          <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-bold flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Just Now</span>
          </span>
        </div>

        {/* QUICK ACTIONS & VISUAL HIERARCHY (VECTOR SVG ICONS) */}
        <div className="space-y-3 pt-2">
          
          <div className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-slate-400 text-left">
            Quick Actions
          </div>

          {/* Primary Action Button (Largest, Gradient Glow) */}
          <button
            onClick={handleCopyCode}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white font-extrabold text-sm shadow-[0_4px_18px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_24px_rgba(139,92,246,0.45)] hover:scale-[1.01] transition-all cursor-pointer border-none flex items-center justify-center gap-2"
          >
            {copiedCode ? (
              <>
                <svg className="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>Copy Code</span>
              </>
            )}
          </button>

          {/* Secondary Actions (WhatsApp & View Paste) */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleShareWhatsApp}
              className="py-3 px-4 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/30 border border-emerald-500/35 text-emerald-300 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>Share via WhatsApp</span>
            </button>

            <button
              onClick={() => {
                if (onViewPaste) onViewPaste();
                onClose();
              }}
              className="py-3 px-4 rounded-xl bg-purple-600/15 hover:bg-purple-600/30 border border-purple-500/35 text-purple-300 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>View Paste</span>
            </button>
          </div>

          {/* Outline Actions Grid (Copy Link, History, Create Another) */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={() => {
                if (onGoToHistory) onGoToHistory();
                onClose();
              }}
              className="py-2.5 px-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>History</span>
            </button>

            <button
              onClick={() => {
                onCreateAnother();
                onClose();
              }}
              className="py-2.5 px-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Create</span>
            </button>
          </div>

        </div>

        {/* SUBTLE GLASS HELP BANNER */}
        <div className="bg-purple-950/20 border border-purple-500/20 rounded-2xl p-3 text-xs text-purple-300/90 flex items-center justify-center gap-2 leading-relaxed">
          <svg className="w-4 h-4 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>Save this paste code. You'll need it later to retrieve or edit your paste.</span>
        </div>

      </div>
    </div>
  );
};

export default SuccessModal;
