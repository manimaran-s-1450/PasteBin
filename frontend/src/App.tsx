import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CreatePaste from './pages/CreatePaste';
import ViewPaste from './pages/ViewPaste';
import EditPaste from './pages/EditPaste';
import History from './pages/History';
import Documentation from './pages/Documentation';
import About from './pages/About';
import { PasteItem } from './services/api';

/**
 * Main Application Component (App.tsx)
 * --------------------------------------------------------------------------
 * Purpose:
 * Top-level application container managing active page routing state,
 * rendering shared header Navbar and Footer, and displaying requested pages.
 * --------------------------------------------------------------------------
 */

export type PageRoute = 'home' | 'create' | 'view' | 'history' | 'docs' | 'about' | 'edit';

export default function App() {
  const [activePage, setActivePage] = useState<PageRoute>('home');
  const [selectedPaste, setSelectedPaste] = useState<PasteItem | null>(null);

  const handleNavigate = (page: PageRoute) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditPaste = (paste: PasteItem) => {
    setSelectedPaste(paste);
    setActivePage('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090B] text-white selection:bg-purple-600 selection:text-white">
      
      {/* Shared Header Navigation */}
      <Navbar activePage={activePage} onNavigate={handleNavigate} />

      {/* Main Page Workspace */}
      <div className="flex-1">
        {activePage === 'home' && <Home onNavigate={handleNavigate} />}
        {activePage === 'create' && <CreatePaste onNavigate={handleNavigate} />}
        {activePage === 'view' && <ViewPaste />}
        {activePage === 'edit' && <EditPaste pasteToEdit={selectedPaste} onNavigate={handleNavigate} />}
        {activePage === 'history' && <History onEditPaste={handleEditPaste} />}
        {activePage === 'docs' && <Documentation />}
        {activePage === 'about' && <About />}
      </div>

      {/* Shared Footer */}
      <Footer onNavigate={handleNavigate} />

    </div>
  );
}
