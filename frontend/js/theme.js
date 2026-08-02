/**
 * Theme & Interactive 3D Parallax Controller
 */

const THEME_KEY = 'pastebin_theme';

function getTheme() {
  return localStorage.getItem(THEME_KEY) || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark');
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  updateThemePillUI(theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
}

window.getTheme = getTheme;
window.setTheme = setTheme;
window.toggleTheme = toggleTheme;

function updateThemePillUI(theme) {
  const pills = document.querySelectorAll('#theme-toggle-btn, .theme-pill');
  pills.forEach(pill => {
    const lightBtn = pill.querySelector('.light-btn');
    const darkBtn = pill.querySelector('.dark-btn');
    if (theme === 'dark') {
      if (lightBtn) lightBtn.classList.remove('active');
      if (darkBtn) darkBtn.classList.add('active');
      pill.classList.remove('light');
    } else {
      if (darkBtn) darkBtn.classList.remove('active');
      if (lightBtn) lightBtn.classList.add('active');
      pill.classList.add('light');
    }
  });
}

/**
 * Global Document Click Event Delegation for Guaranteed Theme Toggle Execution
 */
document.addEventListener('click', (e) => {
  const toggleBtn = e.target.closest('#theme-toggle-btn, .theme-pill, #dropdown-btn-theme');
  if (toggleBtn) {
    toggleTheme();
  }
});

/**
 * Generate Glowing Ambient Particles Background
 */
function createAmbientParticles() {
  const container = document.getElementById('particles-container');
  if (!container) return;

  container.innerHTML = '';
  const particleCount = 20;

  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = Math.random() * 4 + 2; // 2px - 6px
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = Math.random() * 10 + 12; // 12s - 22s

    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${left}%`;
    p.style.top = `${top}%`;
    p.style.animationDelay = `-${delay}s`;
    p.style.animationDuration = `${duration}s`;

    container.appendChild(p);
  }
}

/**
 * Mouse 3D Tilt Parallax Effect for Hero Workspace
 */
function init3DTilt() {
  const heroSection = document.querySelector('.hero-section');
  const editor = document.getElementById('code-editor-3d');
  const float1 = document.getElementById('float-1');
  const float2 = document.getElementById('float-2');
  const float3 = document.getElementById('float-3');
  const float4 = document.getElementById('float-4');

  if (!heroSection || !editor) return;

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Calculate smooth rotation angles
    const rotateY = -14 + (x / rect.width) * 12;
    const rotateX = 10 - (y / rect.height) * 12;

    // Apply 3D transform to code window
    editor.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) rotateZ(2deg) translateZ(10px)`;

    // Parallax shift for floating cards
    if (float1) float1.style.transform = `translate3d(${x * 0.03}px, ${y * 0.03}px, 20px)`;
    if (float2) float2.style.transform = `translate3d(${x * -0.02}px, ${y * 0.02}px, 15px)`;
    if (float3) float3.style.transform = `translate3d(${x * 0.02}px, ${y * -0.02}px, 25px)`;
    if (float4) float4.style.transform = `translate3d(${x * -0.03}px, ${y * -0.03}px, 30px)`;
  });

  heroSection.addEventListener('mouseleave', () => {
    editor.style.transform = 'rotateY(-14deg) rotateX(10deg) rotateZ(2deg)';
    if (float1) float1.style.transform = 'none';
    if (float2) float2.style.transform = 'none';
    if (float3) float3.style.transform = 'none';
    if (float4) float4.style.transform = 'none';
  });
}

/**
 * Code Editor Header Copy Button Interactive Feedback
 */
function initCopyBtn() {
  const copyBtn = document.getElementById('hero-copy-btn');
  const codeContent = document.getElementById('hero-code-content');

  if (!copyBtn || !codeContent) return;

  copyBtn.addEventListener('click', () => {
    const textToCopy = codeContent.innerText || codeContent.textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('Copied code snippet to clipboard!', 'success');
      
      copyBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span style="color: #10B981;">Copied!</span>
      `;

      setTimeout(() => {
        copyBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>Copy</span>
        `;
      }, 2000);
    }).catch(() => {
      showToast('Copied code snippet to clipboard!', 'success');
    });
  });
}

/**
 * Responsive Mobile Navigation Drawer Logic
 * Dynamically creates the mobile drawer from existing nav links.
 */
function initMobileDrawer() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  if (!menuBtn) return;

  // If a pre-built drawer already exists just wire it up
  let drawer = document.getElementById('mobile-drawer');
  let overlay = document.getElementById('drawer-overlay');

  if (!drawer) {
    // Build the overlay backdrop
    overlay = document.createElement('div');
    overlay.id = 'drawer-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 998;
      background: rgba(0,0,0,0.65); backdrop-filter: blur(4px);
      display: none; opacity: 0; transition: opacity 0.25s ease;
    `;
    document.body.appendChild(overlay);

    const getVioletIcon = (label) => {
      const text = label.toLowerCase();
      if (text.includes('home')) return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
      if (text.includes('create')) return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
      if (text.includes('receive')) return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
      if (text.includes('history')) return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
      if (text.includes('doc')) return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>';
      if (text.includes('about')) return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
      if (text.includes('profile')) return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle></svg>';
    };

    // Collect nav links from the existing static navbar
    const navLinks = document.querySelectorAll('.nav-links .nav-link, nav .nav-link');
    let linksHtml = '';
    navLinks.forEach(link => {
      const isActive = link.classList.contains('active');
      const text = link.textContent.trim();
      linksHtml += `
        <a href="${link.getAttribute('href') || '#'}"
           class="mobile-drawer-link${isActive ? ' active' : ''}"
           ${link.dataset.feature ? `data-feature="${link.dataset.feature}"` : ''}>
          ${getVioletIcon(text)}
          <span>${text}</span>
        </a>`;
    });

    // Build the slide-out panel
    drawer = document.createElement('aside');
    drawer.id = 'mobile-drawer';
    drawer.style.cssText = `
      position: fixed; top: 0; right: 0; height: 100vh; width: min(300px, 85vw);
      z-index: 99995; background: #0d0d14;
      border-left: 1px solid rgba(139,92,246,0.2);
      box-shadow: -8px 0 40px rgba(0,0,0,0.7);
      display: flex; flex-direction: column;
      transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
      overflow-y: auto; padding-top: 4.5rem;
    `;
    drawer.innerHTML = `
      <nav style="display:flex;flex-direction:column;gap:6px;padding:1.25rem;">
        ${linksHtml || `
          <a href="index.html" class="mobile-drawer-link">${getVioletIcon('Home')}<span>Home</span></a>
          <a href="create.html" class="mobile-drawer-link">${getVioletIcon('Create Paste')}<span>Create Paste</span></a>
          <a href="view.html" class="mobile-drawer-link">${getVioletIcon('Receive Paste')}<span>Receive Paste</span></a>
          <a href="history.html" class="mobile-drawer-link">${getVioletIcon('History')}<span>History</span></a>
          <a href="docs.html" class="mobile-drawer-link">${getVioletIcon('Documentation')}<span>Documentation</span></a>
          <a href="about.html" class="mobile-drawer-link">${getVioletIcon('About')}<span>About</span></a>
        `}
      </nav>
    `;

    // Inject styles for drawer links
    if (!document.getElementById('mobile-drawer-styles')) {
      const style = document.createElement('style');
      style.id = 'mobile-drawer-styles';
      style.textContent = `
        #mobile-drawer .mobile-drawer-link {
          display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem;
          border-radius: 12px; font-size: 0.9rem; font-weight: 600;
          color: #cbd5e1; text-decoration: none;
          transition: background 0.18s, color 0.18s;
          border: none; background: rgba(30, 41, 59, 0.4); cursor: pointer;
        }
        #mobile-drawer .mobile-drawer-link:hover,
        #mobile-drawer .mobile-drawer-link.active {
          background: rgba(139,92,246,0.22); color: #fff; border: 1px solid rgba(139,92,246,0.35);
        }
        #mobile-drawer .mobile-drawer-link.active {
          color: #fff; font-weight: 700;
        }
        #mobile-drawer.drawer-open {
          transform: translateX(0) !important;
        }
        #drawer-overlay.drawer-open {
          display: block !important; opacity: 1 !important;
        }
        #mobile-menu-btn {
          position: relative; z-index: 100000 !important;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(drawer);
  }

  function openDrawer() {
    drawer.classList.add('drawer-open');
    overlay.classList.add('drawer-open');
    if (overlay.style) { overlay.style.display = 'block'; setTimeout(() => { overlay.style.opacity = '1'; }, 10); }
    document.body.style.overflow = 'hidden';
    menuBtn.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    drawer.classList.remove('drawer-open');
    overlay.classList.remove('drawer-open');
    if (overlay.style) { overlay.style.opacity = '0'; setTimeout(() => { overlay.style.display = 'none'; }, 260); }
    document.body.style.overflow = '';
    menuBtn.setAttribute('aria-expanded', 'false');
  }

  // Toggle open/close on menu button click
  menuBtn.onclick = (e) => {
    e.stopPropagation();
    if (drawer.classList.contains('drawer-open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  };

  overlay.onclick = closeDrawer;

  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });
}

window.initMobileDrawer = initMobileDrawer;

function initUI() {
  const currentTheme = getTheme();
  setTheme(currentTheme);

  // Initialize Particles
  createAmbientParticles();

  // Mobile Drawer listener
  initMobileDrawer();

  // Init 3D Tilt Interaction & Copy Button
  init3DTilt();
  initCopyBtn();
}

export function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item ${type === 'success' ? 'toast-success' : ''}`;
  toast.innerHTML = `
    <div class="toast-icon">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </div>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 2800);
}

window.showToast = showToast;
export { toggleTheme, getTheme, setTheme };

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUI);
} else {
  initUI();
}
