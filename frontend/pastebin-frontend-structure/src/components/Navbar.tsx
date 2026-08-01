import React, { useState } from 'react';

/**
 * Navbar Component
 * --------------------------------------------------------------------------
 * Purpose:
 * Header navigation bar for PasteBin Pro.
 * Provides desktop horizontal menu, theme switcher pill, brand logo,
 * and mobile slide-out navigation drawer.
 * --------------------------------------------------------------------------
 */

export interface NavbarProps {
  activePage: 'home' | 'create' | 'view' | 'history' | 'docs' | 'about' | 'edit';
  onNavigate: (page: 'home' | 'create' | 'view' | 'history' | 'docs' | 'about' | 'edit') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'create', label: 'Create Paste' },
    { id: 'view', label: 'Receive Paste' },
    { id: 'history', label: 'History' },
    { id: 'docs', label: 'Documentation' },
    { id: 'about', label: 'About' },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-[#09090B]/85 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-[1280px] mx-auto px-4 h-18 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <button 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-3 bg-transparent border-none p-0 cursor-pointer text-left focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)]">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Paste<span className="text-purple-400">Bin</span>
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center justify-center gap-8 flex-1 max-w-[680px]">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`text-sm font-semibold relative py-1 border-none bg-transparent cursor-pointer transition-all ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-[2.5px] bg-purple-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Side Actions: Realistic Theme Toggle Pill */}
        <div className="flex items-center gap-3">
          
          {/* Theme Switcher Pill */}
          <div 
            onClick={toggleTheme}
            className="flex items-center gap-1 bg-[#111827] border border-slate-800 p-1 rounded-full cursor-pointer shadow-inner"
            role="button"
            tabIndex={0}
            aria-label="Toggle Theme"
          >
            <button
              type="button"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                theme === 'light'
                  ? 'bg-amber-100 text-amber-600 shadow-[0_2px_8px_rgba(245,158,11,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Light Mode"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
              </svg>
            </button>
            
            <button
              type="button"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-purple-900 to-indigo-950 text-purple-300 shadow-[0_2px_14px_rgba(167,139,250,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Dark Mode"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </button>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 border-none bg-transparent"
            aria-label="Toggle Navigation Drawer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

        </div>

      </div>

      {/* Mobile Slide-Out Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-2xl border-b border-slate-800 p-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left border-none ${
                activePage === item.id
                  ? 'bg-purple-600 text-white font-bold'
                  : 'text-slate-300 bg-slate-800/40 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

    </header>
  );
};

export default Navbar;
