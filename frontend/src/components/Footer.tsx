import React from 'react';

/**
 * Footer Component
 * --------------------------------------------------------------------------
 * Purpose:
 * Application footer displaying brand identity, quick product navigation links,
 * GitHub links, copyright declaration, and social icon links.
 * --------------------------------------------------------------------------
 */

export interface FooterProps {
  onNavigate: (page: 'home' | 'create' | 'view' | 'history' | 'docs' | 'about') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#09090B] border-t border-slate-800/80 text-slate-400 py-12 px-4">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Column */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </div>
            <span className="text-lg font-bold text-white">PasteBin Pro</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
            A premium SaaS platform to create, view, edit and manage code snippets securely.
          </p>
        </div>

        {/* Product Links */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Product</h4>
          <button onClick={() => onNavigate('home')} className="text-left text-xs text-slate-400 hover:text-white bg-transparent border-none p-0 cursor-pointer">Home</button>
          <button onClick={() => onNavigate('create')} className="text-left text-xs text-slate-400 hover:text-white bg-transparent border-none p-0 cursor-pointer">Create Paste</button>
          <button onClick={() => onNavigate('view')} className="text-left text-xs text-slate-400 hover:text-white bg-transparent border-none p-0 cursor-pointer">Receive Paste</button>
          <button onClick={() => onNavigate('history')} className="text-left text-xs text-slate-400 hover:text-white bg-transparent border-none p-0 cursor-pointer">History</button>
        </div>

        {/* Resources Links */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Resources</h4>
          <button onClick={() => onNavigate('docs')} className="text-left text-xs text-slate-400 hover:text-white bg-transparent border-none p-0 cursor-pointer">Documentation</button>
          <button onClick={() => onNavigate('about')} className="text-left text-xs text-slate-400 hover:text-white bg-transparent border-none p-0 cursor-pointer">About PasteBin</button>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-white">GitHub Repository</a>
        </div>

        {/* Legal & Copyright */}
        <div className="flex flex-col gap-2 justify-between">
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">System</h4>
            <p className="text-xs text-slate-500 mt-1">Status: Operational</p>
          </div>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} PasteBin Pro. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
