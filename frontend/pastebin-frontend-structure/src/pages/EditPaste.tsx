import React, { useState, useEffect, useId } from 'react';
import { getPasteById, updatePaste, PasteItem } from '../services/api';

/**
 * Edit Paste Page Component (src/pages/EditPaste.tsx)
 * --------------------------------------------------------------------------
 * Purpose:
 * Pre-fills existing paste data from Express + MySQL backend via GET /api/pastes/:code,
 * allows user edits, and saves updates via PUT /api/pastes/:code.
 * Reuses existing Dark Glassmorphic design system and editor layout.
 * --------------------------------------------------------------------------
 */

const DEFAULT_SAMPLE_PASTE = {
  id: 'PASTE-1001',
  code: 'gt6DlQ94',
  title: 'Binary Search Implementation',
  language: 'JavaScript',
  expiresIn: 'never',
  visibility: 'public',
  content: `// Binary Search Implementation in JavaScript
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid; // Target index found
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1; // Target element not found
}`
};

const EXT_MAP: Record<string, string> = {
  'JavaScript': 'js',
  'TypeScript': 'ts',
  'Python': 'py',
  'Java': 'java',
  'C': 'c',
  'C++': 'cpp',
  'HTML': 'html',
  'CSS': 'css',
  'SQL': 'sql',
  'JSON': 'json',
  'Plain Text': 'txt'
};

export interface EditPasteProps {
  pasteCode?: string;
  pasteToEdit?: PasteItem | null;
  onNavigate?: (page: string) => void;
}

export const EditPaste: React.FC<EditPasteProps> = ({ pasteCode, pasteToEdit, onNavigate }) => {
  const [formData, setFormData] = useState(DEFAULT_SAMPLE_PASTE);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const titleId = useId();
  const languageId = useId();
  const expirationId = useId();
  const contentId = useId();

  const targetCode = pasteCode || (pasteToEdit as any)?.paste_code || pasteToEdit?.id || 'gt6DlQ94';

  /**
   * Load existing paste data from Express + MySQL backend on component mount
   */
  useEffect(() => {
    let isMounted = true;

    async function loadBackendPaste() {
      if (!targetCode) return;
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await getPasteById(targetCode);
        if (isMounted && res && res.success && res.data) {
          const p = res.data;
          setFormData({
            id: String(p.id),
            code: (p as any).paste_code || String(p.id),
            title: p.title || '',
            language: p.language || 'JavaScript',
            expiresIn: p.expiresIn || 'never',
            visibility: p.visibility || 'public',
            content: p.content || ''
          });
        } else if (isMounted) {
          setErrorMsg('Paste not found.');
        }
      } catch (err: any) {
        console.error('[EditPaste Component] Error loading paste:', err);
        if (isMounted) {
          setErrorMsg(err?.message || 'Paste not found.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (pasteToEdit) {
      setFormData({
        id: String(pasteToEdit.id),
        code: (pasteToEdit as any).paste_code || String(pasteToEdit.id),
        title: pasteToEdit.title || '',
        language: pasteToEdit.language || 'JavaScript',
        expiresIn: pasteToEdit.expiresIn || 'never',
        visibility: pasteToEdit.visibility || 'public',
        content: pasteToEdit.content || ''
      });
    } else {
      loadBackendPaste();
    }

    return () => {
      isMounted = false;
    };
  }, [targetCode, pasteToEdit]);

  // Compute file extension display name
  const ext = EXT_MAP[formData.language] || 'txt';
  const displayFileName = formData.title.trim()
    ? (formData.title.trim().toLowerCase().endsWith(`.${ext}`)
        ? formData.title.trim()
        : `${formData.title.trim()}.${ext}`)
    : `untitled.${ext}`;

  // Calculate line numbers for editor workspace
  const lines = formData.content.split('\n');
  const lineCount = Math.max(lines.length, 12);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Form Field Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVisibilitySelect = (val: string) => {
    setFormData(prev => ({ ...prev, visibility: val }));
  };

  // Cursor Position Calculation
  const handleTextareaCursor = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const pos = target.selectionStart || 0;
    const textBefore = target.value.substring(0, pos);
    const splitLines = textBefore.split('\n');
    const currentLine = splitLines.length;
    const currentCol = splitLines[splitLines.length - 1].length + 1;
    setCursorPos({ line: currentLine, col: currentCol });
  };

  // Tab key indent handling
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newContent = formData.content.substring(0, start) + '  ' + formData.content.substring(end);
      setFormData(prev => ({ ...prev, content: newContent }));

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  /**
   * Form Submit Handler
   * Executes PUT /api/pastes/:paste_code request via updatePaste service
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      showToast('Code content cannot be empty.');
      return;
    }

    setUpdating(true);
    try {
      // Real API PUT request to Express + MySQL backend
      const res = await updatePaste(formData.code || formData.id, {
        title: formData.title,
        language: formData.language,
        content: formData.content
      });

      if (res && res.success && res.data) {
        const p = res.data;
        setFormData(prev => ({
          ...prev,
          title: p.title || prev.title,
          language: p.language || prev.language,
          content: p.content || prev.content
        }));
        showToast('Paste updated successfully!');
      } else {
        showToast('Failed to update paste.');
      }
    } catch (err: any) {
      console.error('[EditPaste Component] Error updating paste:', err);
      showToast(err?.message || 'Failed to update paste.');
    } finally {
      setUpdating(false);
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_SAMPLE_PASTE);
    showToast('Form reset to original values.');
  };

  const handleCancel = () => {
    showToast('Editing cancelled.');
    if (onNavigate) onNavigate('history');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090B] text-white">
      
      {/* Toast Banner */}
      {toastMessage && (
        <div 
          className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-slate-900/90 border border-violet-500/40 text-white shadow-2xl backdrop-blur-md flex items-center gap-3 transition-all animate-bounce"
          role="status"
          aria-live="polite"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Edit Section */}
      <main className="flex-1 pb-16">
        
        {/* HERO SECTION */}
        <section className="relative py-14 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-purple-600/20 blur-[80px] pointer-events-none rounded-full" />
          <div className="relative z-10 max-w-[720px] mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 flex items-center justify-center gap-3">
              <span>Edit <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Paste</span></span>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-[0_4px_18px_rgba(139,92,246,0.45)] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </div>
            </h1>
            <p className="text-slate-400 text-lg sm:text-xl font-medium max-w-[580px] mx-auto">
              Update your existing code snippet in the backend.
            </p>
          </div>
        </section>

        {/* ERROR / NOT FOUND MESSAGE */}
        {errorMsg && (
          <div className="max-w-[600px] mx-auto mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm font-semibold text-center flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* MAIN EDIT FORM CARD */}
        <section className="px-4">
          <div className="max-w-[960px] mx-auto">
            <div className="relative bg-slate-900/75 backdrop-blur-2xl border border-purple-500/30 rounded-3xl p-6 sm:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),0_0_50px_rgba(139,92,246,0.25)] overflow-hidden">
              
              {/* Decorative Gradient Top Line */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-600 via-purple-400 to-pink-500" />

              <form onSubmit={handleSubmit} className="flex flex-col gap-7">
                
                {/* 1. PASTE TITLE */}
                <div className="flex flex-col gap-2">
                  <label htmlFor={titleId} className="inline-flex items-center gap-2 text-sm font-bold text-slate-100">
                    <svg className="w-4 h-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    <span>Paste Title</span>
                  </label>
                  <input 
                    type="text" 
                    id={titleId}
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    disabled={loading || updating}
                    placeholder="e.g. Binary Search Implementation"
                    required
                    className="w-full px-4 py-3 bg-[#09090B] border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500 transition-all disabled:opacity-50"
                  />
                </div>

                {/* 2. GRID: LANGUAGE & EXPIRATION */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  <div className="flex flex-col gap-2">
                    <label htmlFor={languageId} className="inline-flex items-center gap-2 text-sm font-bold text-slate-100">
                      <svg className="w-4 h-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                      </svg>
                      <span>Programming Language</span>
                    </label>
                    <select
                      id={languageId}
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      disabled={loading || updating}
                      className="w-full px-4 py-3 bg-[#09090B] border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500 cursor-pointer disabled:opacity-50"
                    >
                      <option value="JavaScript">JavaScript</option>
                      <option value="TypeScript">TypeScript</option>
                      <option value="Python">Python</option>
                      <option value="Java">Java</option>
                      <option value="C++">C++</option>
                      <option value="SQL">SQL</option>
                      <option value="HTML">HTML</option>
                      <option value="CSS">CSS</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor={expirationId} className="inline-flex items-center gap-2 text-sm font-bold text-slate-100">
                      <svg className="w-4 h-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span>Expires In</span>
                    </label>
                    <select
                      id={expirationId}
                      name="expiresIn"
                      value={formData.expiresIn}
                      onChange={handleInputChange}
                      disabled={loading || updating}
                      className="w-full px-4 py-3 bg-[#09090B] border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500 cursor-pointer disabled:opacity-50"
                    >
                      <option value="never">Never</option>
                      <option value="1h">1 Hour</option>
                      <option value="24h">24 Hours</option>
                      <option value="7d">7 Days</option>
                      <option value="30d">30 Days</option>
                    </select>
                  </div>

                </div>

                {/* 3. VISIBILITY SELECTION CARDS */}
                <div className="flex flex-col gap-2">
                  <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-100">
                    <svg className="w-4 h-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>Paste Visibility</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div 
                      onClick={() => !loading && !updating && handleVisibilitySelect('public')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        formData.visibility === 'public'
                          ? 'bg-purple-950/40 border-purple-500/80 shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                          : 'bg-[#09090B] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-white">🌐 Public</span>
                        {formData.visibility === 'public' && <span className="text-purple-400 font-bold text-xs">✓ Active</span>}
                      </div>
                      <p className="text-xs text-slate-400">Visible to anyone with the paste code or search.</p>
                    </div>

                    <div 
                      onClick={() => !loading && !updating && handleVisibilitySelect('private')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        formData.visibility === 'private'
                          ? 'bg-purple-950/40 border-purple-500/80 shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                          : 'bg-[#09090B] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-white">🔒 Private</span>
                        {formData.visibility === 'private' && <span className="text-purple-400 font-bold text-xs">✓ Active</span>}
                      </div>
                      <p className="text-xs text-slate-400">Accessible only via secret link or paste code.</p>
                    </div>

                  </div>
                </div>

                {/* 4. CODE EDITOR WORKSPACE */}
                <div className="flex flex-col gap-2">
                  <label htmlFor={contentId} className="inline-flex items-center gap-2 text-sm font-bold text-slate-100">
                    <svg className="w-4 h-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 18 22 12 16 6"></polyline>
                      <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                    <span>Code Content</span>
                  </label>

                  <div className="bg-[#090D1A] border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
                    
                    {/* Header Toolbar */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                          <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                          <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                        </div>
                        <span className="text-slate-600 text-xs px-2">|</span>
                        <div className="text-xs font-mono text-slate-300 font-medium">
                          <span>{displayFileName}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
                        {formData.language}
                      </span>
                    </div>

                    {/* Editor Body */}
                    <div className="flex min-h-[300px] max-h-[500px]">
                      {/* Line Numbers */}
                      <div className="w-12 py-3 bg-slate-950/50 text-slate-600 font-mono text-xs text-right pr-3 select-none flex flex-col gap-1 border-r border-slate-800/80">
                        {lineNumbers.map((num) => (
                          <span key={num}>{num}</span>
                        ))}
                      </div>

                      {/* Textarea */}
                      <textarea
                        id={contentId}
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        onKeyUp={handleTextareaCursor}
                        onClick={handleTextareaCursor}
                        onKeyDown={handleKeyDown}
                        disabled={loading || updating}
                        className="flex-1 p-3 bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-relaxed outline-none resize-y min-h-[300px] disabled:opacity-50"
                        placeholder="// Type or paste code here..."
                        spellCheck={false}
                        required
                      />
                    </div>

                    {/* Statusbar Footer */}
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                      <span className="text-emerald-400 font-medium">● UTF-8</span>
                      <div className="flex items-center gap-3">
                        <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
                        <span>|</span>
                        <span>{formData.content.length} chars</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 5. ACTION BUTTONS ROW */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
                  
                  {/* Reset Button */}
                  <button 
                    type="button" 
                    onClick={handleReset}
                    disabled={loading || updating}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/40 text-slate-200 font-semibold text-sm hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <polyline points="1 4 1 10 7 10"></polyline>
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                    </svg>
                    <span>Reset</span>
                  </button>

                  {/* Cancel Button */}
                  <button 
                    type="button" 
                    onClick={handleCancel}
                    disabled={loading || updating}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/40 text-slate-200 font-semibold text-sm hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    <span>Cancel</span>
                  </button>

                  {/* Update Paste Button */}
                  <button 
                    type="submit" 
                    disabled={loading || updating}
                    className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-[0_4px_18px_rgba(139,92,246,0.45)] hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <span>{updating ? 'Updating...' : 'Update Paste'}</span>
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>

                </div>

              </form>

            </div>
          </div>
        </section>

      </main>

    </div>
  );
};

export default EditPaste;
