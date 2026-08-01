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
  const lightBtn = document.querySelector('.theme-btn.light-btn');
  const darkBtn = document.querySelector('.theme-btn.dark-btn');
  if (!lightBtn || !darkBtn) return;

  if (theme === 'dark') {
    lightBtn.classList.remove('active');
    darkBtn.classList.add('active');
  } else {
    darkBtn.classList.remove('active');
    lightBtn.classList.add('active');
  }
}

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
    if (float3) float3.style.transform = `translate3d(${x * 0.025}px, ${y * -0.025}px, 25px)`;
    if (float4) float4.style.transform = `translate3d(${x * -0.03}px, ${y * -0.02}px, 18px)`;
  });

  heroSection.addEventListener('mouseleave', () => {
    // Reset to default 3D pose smoothly
    editor.style.transform = 'rotateY(-14deg) rotateX(10deg) rotateZ(2deg) translateZ(0)';
    if (float1) float1.style.transform = '';
    if (float2) float2.style.transform = '';
    if (float3) float3.style.transform = '';
    if (float4) float4.style.transform = '';
  });
}

/**
 * Interactive Copy URL Button inside 3D Hero Editor
 */
function initCopyBtn() {
  const copyBtn = document.getElementById('editor-copy-btn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    const sampleUrl = 'https://pastebin.dev/abc123';
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(sampleUrl);
      }
      const label = copyBtn.querySelector('span');
      if (label) {
        const originalText = label.textContent;
        label.textContent = 'Copied!';
        copyBtn.style.backgroundColor = '#22C55E';

        setTimeout(() => {
          label.textContent = originalText;
          copyBtn.style.backgroundColor = '';
        }, 2000);
      }
    } catch (err) {
      console.warn('Copy to clipboard failed', err);
    }
  });
}

/**
 * Mobile Navigation Drawer Controller
 */
export function initMobileDrawer() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('nav-drawer');
  const backdrop = document.getElementById('nav-drawer-backdrop');
  const closeBtn = document.getElementById('nav-drawer-close');

  function openDrawer() {
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.removeEventListener('click', openDrawer);
    mobileMenuBtn.addEventListener('click', openDrawer);
  }
  if (closeBtn) {
    closeBtn.removeEventListener('click', closeDrawer);
    closeBtn.addEventListener('click', closeDrawer);
  }
  if (backdrop) {
    backdrop.removeEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);
  }

  const drawerLinks = document.querySelectorAll('.nav-drawer-link, .nav-drawer-footer a');
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

window.initMobileDrawer = initMobileDrawer;

function initUI() {
  const currentTheme = getTheme();
  setTheme(currentTheme);

  // Initialize Particles
  createAmbientParticles();

  // Theme Toggle listener
  const themePill = document.getElementById('theme-toggle-btn');
  if (themePill) {
    themePill.addEventListener('click', toggleTheme);
  }

  // Mobile Drawer listener
  initMobileDrawer();

  // Init 3D Tilt Interaction & Copy Button
  init3DTilt();
  initCopyBtn();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUI);
} else {
  initUI();
}
