import React, { useState, useEffect } from 'react';

/**
 * Documentation Page Component
 * Stripe / Vercel / Supabase / GitHub Docs inspired Developer Portal for PasteBin Pro.
 */

// --- MODULAR SUBCOMPONENTS ---

export interface TechnologyCardProps {
  icon: string;
  name: string;
  category: string;
  description: string;
}

export const TechnologyCard: React.FC<TechnologyCardProps> = ({ icon, name, category, description }) => (
  <div className="bg-[#09090B] border border-slate-800/90 hover:border-purple-500/40 rounded-2xl p-5 flex flex-col gap-2 transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(139,92,246,0.15)] group">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-lg group-hover:bg-purple-600 group-hover:text-white transition-all">
        {icon}
      </div>
      <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
        {category}
      </span>
    </div>
    <div className="text-base font-bold text-white mt-1">{name}</div>
    <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
  </div>
);

export interface ApiEndpointCardProps {
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  url: string;
  description: string;
}

export const ApiEndpointCard: React.FC<ApiEndpointCardProps> = ({ method, url, description }) => {
  const methodStyles = {
    POST: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    GET: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    PUT: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    DELETE: 'bg-red-500/15 text-red-400 border-red-500/30'
  };

  return (
    <div className="bg-[#09090B] border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-purple-500/30 transition-all">
      <div className="flex items-center gap-4">
        <span className={`font-mono text-xs font-extrabold px-3 py-1 rounded-md border min-w-[70px] text-center ${methodStyles[method]}`}>
          {method}
        </span>
        <code className="font-mono text-sm sm:text-base font-semibold text-purple-300">{url}</code>
      </div>
      <span className="text-xs sm:text-sm text-slate-400 font-medium">{description}</span>
    </div>
  );
};

export interface DocumentationSidebarProps {
  activeSection: string;
}

export const DocumentationSidebar: React.FC<DocumentationSidebarProps> = ({ activeSection }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📌' },
    { id: 'tech-stack', label: 'Technology Stack', icon: '⚡' },
    { id: 'rest-api', label: 'REST APIs', icon: '🌐' },
    { id: 'swagger', label: 'Swagger', icon: '📑' },
    { id: 'architecture', label: 'Architecture', icon: '🧱' },
    { id: 'project-structure', label: 'Project Structure', icon: '📂' },
  ];

  return (
    <aside className="sticky top-24 hidden lg:flex flex-col gap-1.5 p-4 rounded-2xl bg-slate-900/65 backdrop-blur-xl border border-slate-800 shadow-xl w-[260px] flex-shrink-0">
      <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 px-3 py-1 mb-1">
        Quick Navigation
      </span>
      {navItems.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_4px_14px_rgba(139,92,246,0.35)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="text-sm">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        );
      })}
    </aside>
  );
};

// --- MAIN DOCUMENTATION PAGE ---

export const Documentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');

  // Scroll spy active section tracking
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'tech-stack', 'rest-api', 'swagger', 'architecture', 'project-structure'];
      const scrollPos = window.scrollY + 140;

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileJump = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetId = e.target.value;
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090B] text-white">
      
      <main className="flex-1 pb-20">
        
        {/* HERO SECTION */}
        <section className="relative py-14 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[260px] bg-purple-600/20 blur-[80px] pointer-events-none rounded-full" />
          <div className="relative z-10 max-w-[760px] mx-auto px-4 flex flex-col items-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 flex items-center justify-center gap-3">
              <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Documentation</span>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-[0_4px_18px_rgba(139,92,246,0.45)] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
            </h1>
            <p className="text-slate-400 text-lg sm:text-xl font-medium max-w-[580px]">
              Developer resources and API reference for PasteBin.
            </p>
          </div>
        </section>

        {/* MAIN DOCUMENTATION WORKSPACE */}
        <section className="px-4">
          <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-10 items-start">
            
            {/* STICKY SIDEBAR (DESKTOP) */}
            <DocumentationSidebar activeSection={activeSection} />

            {/* CONTENT AREA */}
            <div className="flex-1 w-full space-y-12">
              
              {/* Mobile Quick Jump Dropdown */}
              <div className="block lg:hidden w-full mb-6">
                <select
                  onChange={handleMobileJump}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-semibold text-sm outline-none focus:border-purple-500"
                  aria-label="Jump to Documentation Section"
                >
                  <option value="overview">Jump to: Overview</option>
                  <option value="tech-stack">Jump to: Technology Stack</option>
                  <option value="rest-api">Jump to: REST APIs</option>
                  <option value="swagger">Jump to: Swagger API</option>
                  <option value="architecture">Jump to: System Architecture</option>
                  <option value="project-structure">Jump to: Project Structure</option>
                </select>
                   {/* 1. OVERVIEW */}
              <section id="overview" className="scroll-mt-24 space-y-4">
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
                  <span className="text-purple-400">📌</span>
                  <span>Project Overview</span>
                </h2>
                <div className="relative bg-slate-900/75 backdrop-blur-2xl border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),0_0_50px_rgba(139,92,246,0.15)] overflow-hidden space-y-4">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-600 via-purple-400 to-pink-500" />
                  <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-medium">
                    <strong>PasteBin</strong> is a modern platform for securely creating, retrieving, viewing, editing and managing code snippets through a fast, responsive and developer-friendly interface.
                  </p>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
                      ⚡ Fast Response
                    </span>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
                      🔒 Secure Storage
                    </span>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
                      🐬 MySQL Database
                    </span>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
                      🎨 Dark Glassmorphism
                    </span>
                  </div>
                </div>
              </section>

              {/* 2. TECHNOLOGY STACK */}
              <section id="tech-stack" className="scroll-mt-24 space-y-4">
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
                  <span className="text-purple-400">⚡</span>
                  <span>Technology Stack</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <TechnologyCard icon="⚛️" name="React" category="Frontend" description="Component-driven UI library for building dynamic web apps." />
                  <TechnologyCard icon="⚡" name="Vite" category="Bundler" description="Next-generation frontend tooling with instant HMR." />
                  <TechnologyCard icon="📜" name="JavaScript" category="Language" description="Core programming language powering frontend logic." />
                  <TechnologyCard icon="🎨" name="CSS Modules" category="Styling" description="Custom glassmorphism theme system & design tokens." />
                  <TechnologyCard icon="🟢" name="Node.js" category="Runtime" description="Asynchronous event-driven JavaScript runtime engine." />
                  <TechnologyCard icon="🚀" name="Express.js" category="Backend" description="Fast, unopinionated web framework for Node.js APIs." />
                  <TechnologyCard icon="🐬" name="MySQL" category="Database" description="Relational database management for persistent snippet storage." />
                  <TechnologyCard icon="📖" name="Swagger" category="API Spec" description="OpenAPI specification & interactive API documentation." />
                  <TechnologyCard icon="🐙" name="Git & GitHub" category="VCS" description="Distributed version control and source code management." />
                </div>
              </section>

              {/* 3. REST API ENDPOINTS */}
              <section id="rest-api" className="scroll-mt-24 space-y-4">
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
                  <span className="text-purple-400">🌐</span>
                  <span>REST API Endpoints</span>
                </h2>
                <div className="space-y-3">
                  <ApiEndpointCard method="POST" url="/api/pastes" description="Create a new paste." />
                  <ApiEndpointCard method="GET" url="/api/pastes" description="Retrieve all pastes." />
                  <ApiEndpointCard method="GET" url="/api/pastes/:id" description="Retrieve a specific paste." />
                  <ApiEndpointCard method="PUT" url="/api/pastes/:id" description="Update an existing paste." />
                  <ApiEndpointCard method="DELETE" url="/api/pastes/:id" description="Delete an existing paste." />
                </div>
              </section>

              {/* 4. SWAGGER DOCUMENTATION */}
              <section id="swagger" className="scroll-mt-24 space-y-4">
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
                  <span className="text-purple-400">📑</span>
                  <span>Swagger API Documentation</span>
                </h2>
                <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-900/30 via-slate-900/90 to-slate-950 border border-purple-500/40 shadow-[0_10px_30px_rgba(139,92,246,0.15)] flex flex-col items-start gap-4">
                  <h3 className="text-xl font-bold text-white">Swagger API Reference</h3>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                    Explore and test every REST endpoint through the interactive Swagger interface.
                  </p>
                  <button
                    onClick={() => {
                      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
                      const swaggerUrl = isLocal ? 'http://localhost:5000/api-docs/' : 'https://pastebin-production-6477.up.railway.app/api-docs/';
                      window.open(swaggerUrl, '_blank', 'noopener,noreferrer');
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-[0_4px_18px_rgba(139,92,246,0.45)] hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Open Swagger Documentation</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </button>
                </div>
              </section>

              {/* 5. SYSTEM ARCHITECTURE */}
              <section id="architecture" className="scroll-mt-24 space-y-4">
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
                  <span className="text-purple-400">🧱</span>
                  <span>System Architecture</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  
                  {/* Step 1 */}
                  <div className="bg-[#09090B] border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 flex flex-col gap-3 transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(139,92,246,0.15)]">
                    <span className="font-mono text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 w-max">
                      STEP 01
                    </span>
                    <span className="text-3xl mt-1">👤</span>
                    <h3 className="text-lg font-bold text-white">Client Layer</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Developer user interacts with modern web UI controls.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-[#09090B] border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 flex flex-col gap-3 transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(139,92,246,0.15)]">
                    <span className="font-mono text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 w-max">
                      STEP 02
                    </span>
                    <span className="text-3xl mt-1">⚛️</span>
                    <h3 className="text-lg font-bold text-white">React / Vite App</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Component-driven frontend handles dynamic rendering & state.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-[#09090B] border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 flex flex-col gap-3 transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(139,92,246,0.15)]">
                    <span className="font-mono text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 w-max">
                      STEP 03
                    </span>
                    <span className="text-3xl mt-1">🚀</span>
                    <h3 className="text-lg font-bold text-white">Express REST API</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Node.js routes & controllers process requests & payload validation.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-[#09090B] border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 flex flex-col gap-3 transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(139,92,246,0.15)]">
                    <span className="font-mono text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 w-max">
                      STEP 04
                    </span>
                    <span className="text-3xl mt-1">🐬</span>
                    <h3 className="text-lg font-bold text-white">MySQL Database</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Relational DB model persists code snippets & metadata safely.
                    </p>
                  </div>

                </div>
              </section>

              {/* 6. PROJECT STRUCTURE */}
              <section id="project-structure" className="scroll-mt-24 space-y-4">
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
                  <span className="text-purple-400">📂</span>
                  <span>Project Structure</span>
                </h2>
                <div className="bg-[#090D1A] border border-slate-800 rounded-2xl p-6 font-mono text-xs sm:text-sm text-purple-300 leading-relaxed overflow-x-auto shadow-inner">
<pre>{`PasteBin
├── frontend
│   ├── src
│   ├── components
│   ├── pages
│   ├── assets
│   ├── hooks
│   ├── utils
│   └── styles
│
└── backend
    ├── controllers
    ├── models
    ├── routes
    ├── middleware
    ├── config
    ├── swagger
    └── server.js`}</pre>
                </div>
              </section>

            </div>

          </div>
        </section>

      </main>

    </div>
  );
};

export default Documentation;
