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
 */
function initMobileDrawer() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  const closeBtn = document.getElementById('drawer-close-btn');
  const overlay = document.getElementById('drawer-overlay');

  if (!menuBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  menuBtn.onclick = openDrawer;

  if (closeBtn) closeBtn.onclick = closeDrawer;
  if (overlay) overlay.onclick = closeDrawer;

  const drawerLinks = drawer.querySelectorAll('a');
  drawerLinks.forEach(link => {
    link.onclick = closeDrawer;
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
