import React from 'react';

/**
 * About Page Component
 * GitHub / Vercel / Notion / Supabase inspired About Portal for PasteBin Pro.
 */

export interface AboutCardProps {
  icon: string;
  title: string;
  description: string;
  pill?: string;
}

export const AboutCard: React.FC<AboutCardProps> = ({ icon, title, description, pill }) => (
  <div className="bg-[#09090B] border border-slate-800/90 hover:border-purple-500/40 rounded-2xl p-5 flex flex-col gap-2 transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(139,92,246,0.15)] group">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-lg group-hover:bg-purple-600 group-hover:text-white transition-all">
        {icon}
      </div>
      {pill && (
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
          {pill}
        </span>
      )}
    </div>
    <div className="text-base font-bold text-white mt-1">{title}</div>
    <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
  </div>
);

export const About: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090B] text-white">
      
      <main className="flex-1 pb-20">
        
        {/* HERO SECTION */}
        <section className="relative py-14 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[260px] bg-purple-600/20 blur-[80px] pointer-events-none rounded-full" />
          <div className="relative z-10 max-w-[760px] mx-auto px-4 flex flex-col items-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 flex items-center justify-center gap-3">
              <span>About <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">PasteBin</span></span>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-[0_4px_18px_rgba(139,92,246,0.45)] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
            </h1>
            <p className="text-slate-400 text-lg sm:text-xl font-medium max-w-[600px]">
              A modern platform built for securely creating, sharing and managing code snippets with a clean developer experience.
            </p>
          </div>
        </section>

        {/* MAIN ABOUT WORKSPACE */}
        <section className="px-4">
          <div className="max-w-[1100px] mx-auto space-y-14">
            
            {/* 1. OUR MISSION */}
            <section className="space-y-4">
              <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
                <span className="text-purple-400">🎯</span>
                <span>Our Mission</span>
              </h2>
              <div className="relative bg-slate-900/75 backdrop-blur-2xl border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),0_0_50px_rgba(139,92,246,0.15)] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-600 via-purple-400 to-pink-500" />
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-medium">
                  <strong>PasteBin</strong> aims to provide developers with a fast, secure and intuitive platform for sharing and managing code snippets without unnecessary complexity.
                </p>
              </div>
            </section>

            {/* 2. WHY PASTEBIN */}
            <section className="space-y-4">
              <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
                <span className="text-purple-400">🌟</span>
                <span>Why PasteBin</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <AboutCard icon="⚡" title="Fast Code Sharing" description="Instantly create and publish code snippets with one click." />
                <AboutCard icon="🔒" title="Secure Storage" description="Public and private visibility settings with expiration timers." />
                <AboutCard icon="📱" title="Responsive Experience" description="Fully optimized interface across mobile, tablet and desktop." />
                <AboutCard icon="💻" title="Developer Friendly" description="Clean dark mode glassmorphism UI with syntax highlighting." />
              </div>
            </section>

            {/* 3. CORE FEATURES */}
            <section className="space-y-4">
              <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
                <span className="text-purple-400">🚀</span>
                <span>Core Features</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <AboutCard icon="➕" title="Create Paste" description="Custom titles, programming language selectors, and auto-expirations." />
                <AboutCard icon="📥" title="Retrieve Paste" description="Fetch and view code snippets instantly using unique share codes." />
                <AboutCard icon="👁️" title="View Paste" description="Clean reading layout with copy-to-clipboard and raw text toggle." />
                <AboutCard icon="✏️" title="Edit Paste" description="Pre-filled edit form to quickly update existing code snippets." />
                <AboutCard icon="📜" title="History Dashboard" description="Organize, filter, search, and manage all your saved pastes." />
                <AboutCard icon="🎨" title="Syntax Highlighting" description="Line numbers and syntax themes for JavaScript, Python, C++, SQL." />
                <AboutCard icon="📱" title="Responsive Design" description="Flawless glassmorphism layout from 320px to 1920px viewports." />
                <AboutCard icon="🌐" title="REST API Support" description="Clean RESTful endpoint design ready for Swagger integration." />
              </div>
            </section>



            {/* 6. SECURITY & PERFORMANCE */}
            <section className="space-y-4">
              <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
                <span className="text-purple-400">🛡️</span>
                <span>Security & Performance</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <AboutCard icon="📱" title="Responsive Design" description="Dynamic layout calculations avoiding rigid pixel overflows." />
                <AboutCard icon="🌐" title="RESTful Architecture" description="Standard HTTP method mappings and stateless request handling." />
                <AboutCard icon="🧩" title="Modular Components" description="Decoupled UI architecture for maintainability and extensibility." />
                <AboutCard icon="♻️" title="Reusable UI" description="Consistent GlassCard design system tokens across all pages." />
                <AboutCard icon="🔐" title="Secure API Design" description="Protected routes and private link token verification." />
                <AboutCard icon="⚡" title="Fast Performance" description="Lightweight bundle size with instant local state updates." />
              </div>
            </section>

            {/* 7. FUTURE ROADMAP */}
            <section className="space-y-4">
              <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
                <span className="text-purple-400">🗺️</span>
                <span>Future Roadmap</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <AboutCard icon="🔑" title="User Authentication" description="JWT & OAuth login for personal paste management." pill="Planned" />
                <AboutCard icon="🕒" title="Version History" description="Track and restore historical code revisions." pill="Planned" />
                <AboutCard icon="👥" title="Real-time Collaboration" description="Live multiplayer code editing sessions." pill="Planned" />
                <AboutCard icon="🎨" title="Theme Customization" description="Custom syntax highlighter color themes." pill="Planned" />
                <AboutCard icon="☁️" title="Cloud Storage" description="S3-compatible persistent asset backups." pill="Planned" />
                <AboutCard icon="🏢" title="Team Workspaces" description="Shared organization spaces for engineering teams." pill="Planned" />
              </div>
            </section>

            {/* 8. OPEN SOURCE PROJECT */}
            <section className="space-y-4">
              <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
                <span className="text-purple-400">🐙</span>
                <span>Open Source Project</span>
              </h2>
              <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-900/30 via-slate-900/90 to-slate-950 border border-purple-500/40 shadow-[0_10px_30px_rgba(139,92,246,0.15)] flex flex-col items-start gap-4">
                <h3 className="text-xl font-bold text-white">PasteBin Open Source Architecture</h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                  PasteBin is designed with modern web development practices and follows a modular architecture that makes future enhancements and maintenance easier.
                </p>
                <button
                  onClick={() => alert('PasteBin Open Source GitHub repository link ready for production deployment.')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-[0_4px_18px_rgba(139,92,246,0.45)] hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center gap-2"
                >
                  <span>View GitHub Repository</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </button>
              </div>
            </section>

          </div>
        </section>

      </main>

    </div>
  );
};

export default About;
