import { getCurrentUser, logoutUser } from '../js/auth.js';

export function renderNavbar() {
  const container = document.getElementById('navbar-container');
  if (!container) return;

  const currentPath = window.location.pathname;

  const isHome = currentPath.includes('index') || currentPath === '/' || currentPath.endsWith('/frontend/');
  const isCreate = currentPath.includes('create');
  const isReceive = currentPath.includes('view');
  const isHistory = currentPath.includes('history');
  const isDocs = currentPath.includes('docs');
  const isAbout = currentPath.includes('about');

  const user = getCurrentUser();

  const userAuthHtml = user ? `
    <div class="user-profile-badge" style="display: flex; align-items: center; gap: 0.5rem; background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.35); padding: 0.35rem 0.85rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; color: #C084FC;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      <span>${user.username}</span>
      <button id="btn-nav-logout" type="button" title="Logout" style="background: none; border: none; color: #EF4444; cursor: pointer; display: flex; align-items: center; margin-left: 0.3rem; padding: 0.2rem;" aria-label="Logout">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
      </button>
    </div>
  ` : `
    <a href="login.html" class="btn btn-secondary" style="padding: 0.4rem 0.85rem; font-size: 0.85rem; text-decoration: none;">Login</a>
    <a href="signup.html" class="btn btn-primary" style="padding: 0.4rem 0.85rem; font-size: 0.85rem; text-decoration: none; background: #8B5CF6; color: white;">Sign Up</a>
  `;

  const drawerAuthHtml = user ? `
    <div style="padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between;">
      <span style="font-size: 0.9rem; font-weight: 600; color: #C084FC;">👤 ${user.username}</span>
      <button id="btn-drawer-logout" type="button" style="background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.4); color: #EF4444; padding: 0.25rem 0.6rem; border-radius: 8px; font-size: 0.75rem; cursor: pointer;">Logout</button>
    </div>
  ` : `
    <div style="display: flex; gap: 0.5rem; padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 0.5rem;">
      <a href="login.html" style="flex: 1; text-align: center; padding: 0.4rem; background: rgba(255,255,255,0.08); border-radius: 8px; color: white; text-decoration: none; font-size: 0.85rem;">Login</a>
      <a href="signup.html" style="flex: 1; text-align: center; padding: 0.4rem; background: #8B5CF6; border-radius: 8px; color: white; text-decoration: none; font-size: 0.85rem;">Sign Up</a>
    </div>
  `;

  container.innerHTML = `
    <header class="navbar-wrapper">
      <div class="container navbar-container">
        
        <!-- Brand Logo -->
        <a href="index.html" class="nav-brand">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </div>
          <span class="logo-text">Paste<span class="logo-highlight">Bin</span></span>
        </a>

        <!-- Navigation Links (Desktop Horizontal) -->
        <nav id="nav-links" class="nav-links">
          <a href="index.html" class="nav-link ${isHome ? 'active' : ''}">Home</a>
          <a href="create.html" class="nav-link ${isCreate ? 'active' : ''}">Create Paste</a>
          <a href="view.html" class="nav-link ${isReceive ? 'active' : ''}">Receive Paste</a>
          <a href="history.html" class="nav-link ${isHistory ? 'active' : ''}">History</a>
          <a href="docs.html" class="nav-link ${isDocs ? 'active' : ''}">Documentation</a>
          <a href="about.html" class="nav-link ${isAbout ? 'active' : ''}">About</a>
        </nav>

        <!-- Right Side Actions -->
        <div class="nav-actions" style="display: flex; align-items: center; gap: 0.75rem;">
          ${userAuthHtml}

          <!-- Theme Toggle Pill -->
          <div class="theme-pill" id="theme-toggle-btn" role="button" tabindex="0" aria-label="Toggle Theme">
            <button class="theme-btn light-btn" title="Light Mode" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="m4.93 4.93 1.41 1.41"></path>
                <path d="m17.66 17.66 1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
                <path d="m6.34 17.66-1.41 1.41"></path>
                <path d="m19.07 4.93-1.41 1.41"></path>
              </svg>
            </button>
            <button class="theme-btn dark-btn active" title="Dark Mode" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </button>
          </div>

          <!-- Mobile Hamburger Button -->
          <button id="mobile-menu-btn" class="mobile-menu-btn" type="button" aria-label="Open Navigation Menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" x2="20" y1="6" y2="6"></line>
              <line x1="4" x2="20" y1="12" y2="12"></line>
              <line x1="4" x2="20" y1="18" y2="18"></line>
            </svg>
          </button>
        </div>

      </div>
    </header>

    <!-- Mobile Slide-out Drawer Backdrop Overlay -->
    <div id="nav-drawer-backdrop" class="nav-drawer-backdrop" aria-hidden="true"></div>

    <!-- Mobile Slide-out Drawer Container -->
    <aside id="nav-drawer" class="nav-drawer" aria-label="Mobile Navigation">
      <div class="nav-drawer-header">
        <a href="index.html" class="nav-brand">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </div>
          <span class="logo-text">Paste<span class="logo-highlight">Bin</span></span>
        </a>
        <button id="nav-drawer-close" class="nav-drawer-close" type="button" aria-label="Close Navigation">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="nav-drawer-body">
        ${drawerAuthHtml}
        <nav class="nav-drawer-links">
          <a href="index.html" class="nav-drawer-link ${isHome ? 'active' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Home
          </a>
          <a href="create.html" class="nav-drawer-link ${isCreate ? 'active' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Create Paste
          </a>
          <a href="view.html" class="nav-drawer-link ${isReceive ? 'active' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Receive Paste
          </a>
          <a href="history.html" class="nav-drawer-link ${isHistory ? 'active' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            History
          </a>
          <a href="docs.html" class="nav-drawer-link ${isDocs ? 'active' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            Documentation
          </a>
          <a href="about.html" class="nav-drawer-link ${isAbout ? 'active' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            About
          </a>
        </nav>
      </div>
    </aside>
  `;

  // Attach logout listener
  const logoutBtn = document.getElementById('btn-nav-logout');
  const drawerLogoutBtn = document.getElementById('btn-drawer-logout');
  if (logoutBtn) logoutBtn.addEventListener('click', () => logoutUser());
  if (drawerLogoutBtn) drawerLogoutBtn.addEventListener('click', () => logoutUser());

  if (window.initMobileDrawer) {
    window.initMobileDrawer();
  }
}

window.renderNavbar = renderNavbar;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderNavbar);
} else {
  renderNavbar();
}
