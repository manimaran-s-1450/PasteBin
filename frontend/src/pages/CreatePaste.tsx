import React, { useState, useId } from 'react';
import GlassCard from '../components/GlassCard';
import SuccessModal from '../components/SuccessModal';
import { createPaste, CreatePastePayload, PasteItem } from '../services/api';

/**
 * CreatePaste Component
 * --------------------------------------------------------------------------
 * Purpose:
 * Allows users to create a new code snippet paste with title, language,
 * expiration timer, visibility, and editor content.
 * Integrates with Express.js backend and displays SuccessModal upon creation.
 * --------------------------------------------------------------------------
 */

export interface CreatePasteProps {
  onNavigate?: (page: 'home' | 'create' | 'view' | 'history' | 'docs' | 'about') => void;
}

export const CreatePaste: React.FC<CreatePasteProps> = ({ onNavigate }) => {
  // Form State
  const [formData, setFormData] = useState<CreatePastePayload>({
    title: '',
    language: 'JavaScript',
    expiresIn: 'never',
    visibility: 'public',
    content: ''
  });

  // UI & Backend Response States
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdPaste, setCreatedPaste] = useState<PasteItem | null>(null);
  const [createdPasteCode, setCreatedPasteCode] = useState('GT5WAQFI');

  // Accessibility & Form Field IDs
  const titleId = useId();
  const languageId = useId();
  const expirationId = useId();
  const contentId = useId();

  // Input Field Change Handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Form Reset Handler (Invoked AFTER modal opens / when user clicks "Create Another")
  const handleResetForm = () => {
    setFormData({
      title: '',
      language: 'JavaScript',
      expiresIn: 'never',
      visibility: 'public',
      content: ''
    });
    setCreatedPaste(null);
    setCreatedPasteCode('GT5WAQFI');
  };

  /**
   * Form Submit Handler
   * --------------------------------------------------------------------------
   * Sends POST /api/pastes request to backend.
   * Upon success:
   * 1. Stores backend response object (`result.data`) into `createdPaste` state.
   * 2. Extracts generated `paste_code` into `createdPasteCode` state.
   * 3. Opens Success Modal displaying code and action buttons.
   * --------------------------------------------------------------------------
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Execute POST request to Express.js backend via API service
      const result = await createPaste(formData);

      if (result && result.success) {
        setCreatedPaste(result.data || null);

        const backendCode = (result.data as any)?.paste_code || result.data?.id || 'GT5WAQFI';
        setCreatedPasteCode(backendCode);

        // Update local state storage for instantaneous synchronization
        try {
          const token = localStorage.getItem('pastebin_jwt_token_v1');
          const storageKey = token ? 'pastebin_history_pastes_v1' : 'pastebin_guest_created_v1';
          const stored = localStorage.getItem(storageKey);
          let list = stored ? JSON.parse(stored) : [];
          list.unshift(result.data);
          localStorage.setItem(storageKey, JSON.stringify(list));
          localStorage.setItem('pastebin_local_history_v1', JSON.stringify(list));
        } catch (e) {}

        setShowSuccessModal(true);
      }
    } catch (err: any) {
      console.error('[CreatePaste Component] Error creating paste:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 px-4 max-w-[960px] mx-auto space-y-8">

      {/* Success Modal Component displaying backend response data */}
      <SuccessModal
        isOpen={showSuccessModal}
        pasteCode={createdPasteCode}
        language={createdPaste?.language || formData.language}
        visibility={createdPaste?.visibility || (formData.visibility === 'public' ? 'Public' : 'Private')}
        onClose={() => setShowSuccessModal(false)}
        onCreateAnother={() => {
          handleResetForm();
          setShowSuccessModal(false);
        }}
        onViewPaste={() => onNavigate && onNavigate('view')}
        onGoToHistory={() => onNavigate && onNavigate('history')}
      />

      {/* HERO HEADER */}
      <section className="text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center gap-3">
          <span>Create New <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Paste</span></span>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-[0_4px_18px_rgba(139,92,246,0.45)] flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Create and share your code snippet securely with customizable visibility settings.
        </p>
      </section>

      {/* CREATE FORM CARD */}
      <GlassCard>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Title Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor={titleId} className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span className="text-purple-400">✏️</span> Paste Title
            </label>
            <input
              type="text"
              id={titleId}
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter your paste title..."
              required
              className="w-full px-4 py-3 bg-[#09090B] border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          {/* Grid: Language & Expiration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div className="flex flex-col gap-2">
              <label htmlFor={languageId} className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span className="text-purple-400">⚡</span> Programming Language
              </label>
              <select
                id={languageId}
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#09090B] border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500 cursor-pointer"
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
              <label htmlFor={expirationId} className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span className="text-purple-400">🕒</span> Expires In
              </label>
              <select
                id={expirationId}
                name="expiresIn"
                value={formData.expiresIn}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#09090B] border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="never">Never</option>
                <option value="1h">1 Hour</option>
                <option value="24h">24 Hours</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
              </select>
            </div>

          </div>

          {/* Code Content TextArea */}
          <div className="flex flex-col gap-2">
            <label htmlFor={contentId} className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span className="text-purple-400">📄</span> Code Content
            </label>
            <textarea
              id={contentId}
              name="content"
              rows={10}
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Paste or write your code snippet here..."
              required
              className="w-full p-4 bg-[#090D1A] border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-purple-500 leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-[0_4px_18px_rgba(139,92,246,0.45)] hover:from-purple-500 hover:to-indigo-500 transition-all border-none cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Paste'}
            </button>
          </div>

        </form>
      </GlassCard>

    </div>
  );
};

export default CreatePaste;
