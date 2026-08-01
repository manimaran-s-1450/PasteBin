/**
 * Professional Navbar Component Injector for all pages (index.html, create.html, view.html, edit.html, history.html, docs.html, about.html, login.html, signup.html, profile.html)
 * Includes Profile Avatar (placed BEFORE Theme Toggle), Glass Dropdown, Mobile Drawer, Theme Toggle & Protected Routes Modals
 */
import { getCurrentUser, isLoggedIn, clearAuthSession } from '../js/auth.js';
import { showToast, toggleTheme } from '../js/theme.js';

export function renderNavbar() {
  const currentPath = window.location.pathname;

  const isHome = currentPath.includes('index') || currentPath === '/' || currentPath.endsWith('/frontend/') || currentPath.endsWith('/');
  const isCreate = currentPath.includes('create');
  const isReceive = currentPath.includes('view');
  const isHistory = currentPath.includes('history');
  const isDocs = currentPath.includes('docs');
  const isAbout = currentPath.includes('about');
  const isProfile = currentPath.includes('profile');

  const authenticated = isLoggedIn();
  const user = authenticated ? getCurrentUser() : null;

  const displayName = user ? (user.fullName || user.username || user.name || 'User') : 'Guest User';
  const email = user ? (user.email || 'user@pastebin.com') : 'Sign in to sync your pastes across devices.';
  const avatarUrl = user ? (user.avatarUrl || user.profilePicture || user.picture || null) : null;
  const initials = displayName ? displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'GU';

  const container = document.getElementById('navbar-container');

  const navbarHtml = `
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
          <a href="${authenticated ? 'create.html' : '#'}" class="nav-link protected-link ${isCreate ? 'active' : ''}" data-feature="Create Paste">Create Paste</a>
          <a href="view.html" class="nav-link ${isReceive ? 'active' : ''}">Receive Paste</a>
          <a href="${authenticated ? 'history.html' : '#'}" class="nav-link protected-link ${isHistory ? 'active' : ''}" data-feature="History">History</a>
          <a href="docs.html" class="nav-link ${isDocs ? 'active' : ''}">Documentation</a>
          <a href="about.html" class="nav-link ${isAbout ? 'active' : ''}">About</a>
        </nav>

        <!-- Right Side Actions: Profile Avatar -> Theme Toggle -> Hamburger Menu -->
        <div class="nav-actions">
          
          <!-- Profile Avatar & Glass Dropdown (Immediately BEFORE Theme Toggle) -->
          <div class="nav-profile-wrapper" id="nav-profile-wrapper">
            <button class="nav-profile-btn ${authenticated ? '' : 'guest'}" id="nav-profile-btn" type="button" aria-label="User Profile" aria-expanded="false">
              ${authenticated ? (avatarUrl ? `<img src="${avatarUrl}" alt="${displayName}" class="profile-avatar-img" />` : `<div class="profile-avatar-fallback">${initials}</div>`) : `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              `}
            </button>

            <!-- Profile Dropdown Card -->
            <div class="nav-profile-dropdown" id="nav-profile-dropdown" aria-hidden="true">
              <div class="dropdown-header">
                <div class="dropdown-avatar-box ${authenticated ? '' : 'guest'}">
                  ${authenticated ? (avatarUrl ? `<img src="${avatarUrl}" alt="${displayName}" class="dropdown-avatar-img" />` : `<div class="dropdown-avatar-fallback">${initials}</div>`) : `
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  `}
                </div>
                <div class="dropdown-user-info">
                  <h4 class="dropdown-user-name">${displayName}</h4>
                  <p class="dropdown-user-email">${email}</p>
                </div>
              </div>

              <div class="dropdown-divider"></div>

              ${authenticated ? `
                <div class="dropdown-menu-list">
                  <a href="profile.html" class="dropdown-menu-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span>My Profile</span>
                  </a>
                  <a href="history.html" class="dropdown-menu-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span>My Pastes</span>
                  </a>
                  <a href="create.html" class="dropdown-menu-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Create Paste</span>
                  </a>
                  <button type="button" class="dropdown-menu-item" id="dropdown-btn-settings">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    <span>Account Settings</span>
                  </button>
                  <button type="button" class="dropdown-menu-item" id="dropdown-btn-theme">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                    <span>Toggle Theme</span>
                  </button>
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-menu-list">
                  <button type="button" class="dropdown-menu-item danger" id="dropdown-btn-signout">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              ` : `
                <div class="dropdown-menu-list">
                  <a href="login.html" class="dropdown-menu-item primary-accent">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                    <span>Sign In</span>
                  </a>
                  <a href="signup.html" class="dropdown-menu-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>
                    <span>Create Account</span>
                  </a>
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-menu-list">
                  <button type="button" class="dropdown-menu-item" id="dropdown-btn-why-signin">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    <span>Why Sign In?</span>
                  </button>
                </div>
              `}
            </div>
          </div>

          <!-- Theme Toggle Pill -->
          <div class="theme-pill" id="theme-toggle-btn" role="button" tabindex="0" aria-label="Toggle Theme">
            <button class="theme-btn light-btn" title="Light Mode" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>
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

    <!-- Mobile Drawer Backdrop & Container -->
    <div id="nav-drawer-backdrop" class="nav-drawer-backdrop" aria-hidden="true"></div>
    <aside id="nav-drawer" class="nav-drawer" aria-label="Mobile Navigation">
      <div class="nav-drawer-header">
        <a href="index.html" class="nav-brand">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
          </div>
          <span class="logo-text">Paste<span class="logo-highlight">Bin</span></span>
        </a>
        <button id="nav-drawer-close" class="nav-drawer-close" type="button" aria-label="Close Navigation">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="nav-drawer-body">
        <nav class="nav-drawer-links">
          <a href="index.html" class="nav-drawer-link ${isHome ? 'active' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Home
          </a>
          <a href="${authenticated ? 'create.html' : '#'}" class="nav-drawer-link protected-link ${isCreate ? 'active' : ''}" data-feature="Create Paste">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Create Paste
          </a>
          <a href="view.html" class="nav-drawer-link ${isReceive ? 'active' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Receive Paste
          </a>
          <a href="${authenticated ? 'history.html' : '#'}" class="nav-drawer-link protected-link ${isHistory ? 'active' : ''}" data-feature="History">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            History
          </a>
          <a href="docs.html" class="nav-drawer-link ${isDocs ? 'active' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            Documentation
          </a>
          <a href="about.html" class="nav-drawer-link ${isAbout ? 'active' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            About
          </a>

          ${authenticated ? `
            <a href="profile.html" class="nav-drawer-link ${isProfile ? 'active' : ''}">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              My Profile
            </a>
            <a href="history.html" class="nav-drawer-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              My Pastes
            </a>
            <button type="button" class="nav-drawer-link" id="drawer-btn-signout" style="width: 100%; border: none; background: transparent; cursor: pointer; color: #EF4444;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Sign Out
            </button>
          ` : `
            <a href="login.html" class="nav-drawer-link" style="color: var(--accent-color); font-weight: 700;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
              Sign In
            </a>
            <a href="signup.html" class="nav-drawer-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>
              Create Account
            </a>
          `}
        </nav>
      </div>
    </aside>
  `;

  if (container) {
    container.innerHTML = navbarHtml;
  } else {
    // For pages with static header, inject profile wrapper before theme pill
    const navActions = document.querySelector('.nav-actions');
    if (navActions && !document.getElementById('nav-profile-wrapper')) {
      const themePill = document.getElementById('theme-toggle-btn');
      const profileDiv = document.createElement('div');
      profileDiv.className = 'nav-profile-wrapper';
      profileDiv.id = 'nav-profile-wrapper';
      profileDiv.innerHTML = `
        <button class="nav-profile-btn ${authenticated ? '' : 'guest'}" id="nav-profile-btn" type="button" aria-label="User Profile" aria-expanded="false">
          ${authenticated ? (avatarUrl ? `<img src="${avatarUrl}" alt="${displayName}" class="profile-avatar-img" />` : `<div class="profile-avatar-fallback">${initials}</div>`) : `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          `}
        </button>
        <div class="nav-profile-dropdown" id="nav-profile-dropdown" aria-hidden="true">
          <div class="dropdown-header">
            <div class="dropdown-avatar-box ${authenticated ? '' : 'guest'}">
              ${authenticated ? (avatarUrl ? `<img src="${avatarUrl}" alt="${displayName}" class="dropdown-avatar-img" />` : `<div class="dropdown-avatar-fallback">${initials}</div>`) : `
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              `}
            </div>
            <div class="dropdown-user-info">
              <h4 class="dropdown-user-name">${displayName}</h4>
              <p class="dropdown-user-email">${email}</p>
            </div>
          </div>

          <div class="dropdown-divider"></div>

          ${authenticated ? `
            <div class="dropdown-menu-list">
              <a href="profile.html" class="dropdown-menu-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span>My Profile</span>
              </a>
              <a href="history.html" class="dropdown-menu-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>My Pastes</span>
              </a>
              <a href="create.html" class="dropdown-menu-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span>Create Paste</span>
              </a>
              <button type="button" class="dropdown-menu-item" id="dropdown-btn-settings">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                <span>Account Settings</span>
              </button>
              <button type="button" class="dropdown-menu-item" id="dropdown-btn-theme">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                <span>Toggle Theme</span>
              </button>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-menu-list">
              <button type="button" class="dropdown-menu-item danger" id="dropdown-btn-signout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                <span>Sign Out</span>
              </button>
            </div>
          ` : `
            <div class="dropdown-menu-list">
              <a href="login.html" class="dropdown-menu-item primary-accent">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                <span>Sign In</span>
              </a>
              <a href="signup.html" class="dropdown-menu-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>
                <span>Create Account</span>
              </a>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-menu-list">
              <button type="button" class="dropdown-menu-item" id="dropdown-btn-why-signin">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <span>Why Sign In?</span>
              </button>
            </div>
          `}
        </div>
      `;
      if (themePill) {
        navActions.insertBefore(profileDiv, themePill);
      } else {
        navActions.appendChild(profileDiv);
      }
    }
  }

  initProfileDropdownHandlers();
  initProtectedLinkHandlers();

  if (window.initMobileDrawer) {
    window.initMobileDrawer();
  }
}

function initProfileDropdownHandlers() {
  const profileBtn = document.getElementById('nav-profile-btn');
  const dropdown = document.getElementById('nav-profile-dropdown');
  if (!profileBtn || !dropdown) return;

  function toggleDropdown(e) {
    if (e) e.stopPropagation();
    const isOpen = dropdown.classList.contains('open');
    if (isOpen) {
      closeDropdown();
    } else {
      dropdown.classList.add('open');
      dropdown.setAttribute('aria-hidden', 'false');
      profileBtn.setAttribute('aria-expanded', 'true');
    }
  }

  function closeDropdown() {
    dropdown.classList.remove('open');
    dropdown.setAttribute('aria-hidden', 'true');
    profileBtn.setAttribute('aria-expanded', 'false');
  }

  profileBtn.onclick = toggleDropdown;

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !profileBtn.contains(e.target)) {
      closeDropdown();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDropdown();
  });

  const signOutBtn = document.getElementById('dropdown-btn-signout');
  const drawerSignOutBtn = document.getElementById('drawer-btn-signout');
  const handleSignOut = () => {
    closeDropdown();
    clearAuthSession();
    if (typeof showToast === 'function') showToast('Signed out successfully');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 400);
  };

  if (signOutBtn) signOutBtn.onclick = handleSignOut;
  if (drawerSignOutBtn) drawerSignOutBtn.onclick = handleSignOut;

  const settingsBtn = document.getElementById('dropdown-btn-settings');
  if (settingsBtn) {
    settingsBtn.onclick = () => {
      closeDropdown();
      if (typeof showToast === 'function') showToast('Account Settings coming soon');
    };
  }

  const themeBtn = document.getElementById('dropdown-btn-theme');
  if (themeBtn) {
    themeBtn.onclick = () => {
      closeDropdown();
      if (typeof toggleTheme === 'function') toggleTheme();
    };
  }

  const whyBtn = document.getElementById('dropdown-btn-why-signin');
  if (whyBtn) {
    whyBtn.onclick = () => {
      closeDropdown();
      showWhySignInModal();
    };
  }
}

function initProtectedLinkHandlers() {
  const protectedLinks = document.querySelectorAll('.protected-link');
  protectedLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (!isLoggedIn()) {
        e.preventDefault();
        const feature = link.getAttribute('data-feature') || 'continue using this feature';
        showAuthRequiredModal(feature);
      }
    });
  });
}

export function showAuthRequiredModal(featureName = 'continue using this feature') {
  let modal = document.getElementById('auth-required-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'auth-required-modal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-card auth-modal-card">
        <div class="modal-header">
          <h3 class="modal-title">Sign in Required</h3>
          <button type="button" class="modal-close-btn" id="close-auth-modal-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body auth-modal-body">
          <div class="auth-modal-icon-box">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <h4 class="auth-modal-heading">Unlock PasteBin Features</h4>
          <p class="auth-modal-subtext">Please sign in with your account to ${featureName}. Your pastes will automatically sync safely across all your devices.</p>
        </div>
        <div class="modal-footer auth-modal-footer">
          <button type="button" class="btn btn-secondary" id="cancel-auth-modal-btn">Cancel</button>
          <a href="login.html" class="btn btn-primary" id="confirm-auth-modal-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/></svg>
            <span>Continue to Sign In</span>
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#close-auth-modal-btn');
    const cancelBtn = modal.querySelector('#cancel-auth-modal-btn');
    const hideModal = () => modal.classList.remove('open');
    closeBtn.onclick = hideModal;
    cancelBtn.onclick = hideModal;
    modal.onclick = (e) => { if (e.target === modal) hideModal(); };
  }
  modal.classList.add('open');
}

export function showWhySignInModal() {
  let modal = document.getElementById('why-signin-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'why-signin-modal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-card auth-modal-card">
        <div class="modal-header">
          <h3 class="modal-title">Why Sign In to PasteBin?</h3>
          <button type="button" class="modal-close-btn" id="close-why-modal-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body auth-modal-body">
          <ul class="why-signin-list">
            <li>
              <div class="why-icon">⚡</div>
              <div>
                <strong>Sync Across Devices</strong>
                <p>Access all your pastes anytime on desktop, tablet, or phone.</p>
              </div>
            </li>
            <li>
              <div class="why-icon">🔒</div>
              <div>
                <strong>Secure Google Authentication</strong>
                <p>1-click sign in with enterprise-grade OAuth security.</p>
              </div>
            </li>
            <li>
              <div class="why-icon">📜</div>
              <div>
                <strong>Manage Paste History</strong>
                <p>View, edit, update, or delete your previous pastes easily.</p>
              </div>
            </li>
          </ul>
        </div>
        <div class="modal-footer auth-modal-footer">
          <button type="button" class="btn btn-secondary" id="cancel-why-modal-btn">Close</button>
          <a href="login.html" class="btn btn-primary">Sign In Now</a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#close-why-modal-btn');
    const cancelBtn = modal.querySelector('#cancel-why-modal-btn');
    const hideModal = () => modal.classList.remove('open');
    closeBtn.onclick = hideModal;
    cancelBtn.onclick = hideModal;
    modal.onclick = (e) => { if (e.target === modal) hideModal(); };
  }
  modal.classList.add('open');
}

window.renderNavbar = renderNavbar;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderNavbar);
} else {
  renderNavbar();
}
