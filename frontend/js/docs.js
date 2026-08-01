/**
 * Documentation Page Interactive Controller (js/docs.js)
 * Scroll spy active section highlighting & sidebar click handling.
 */

function initDocsPage() {
  initScrollSpy();
  initMobileJumpSelector();
  initSwaggerDemoButton();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDocsPage);
} else {
  initDocsPage();
}

/**
 * Scroll Spy & Sidebar Click Link Highlighting
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('.docs-section');
  const navLinks = document.querySelectorAll('.docs-nav-link');

  if (!sections.length || !navLinks.length) return;

  let isClickScrolling = false;
  let clickTimeout = null;

  // 1. Click Listener for Immediate Purple Active Bar Feedback
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetSec = document.querySelector(href);
        if (targetSec) {
          e.preventDefault();
          
          // Immediately set purple active bar on clicked link
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');

          // Prevent scroll listener from overriding active state during smooth scroll
          isClickScrolling = true;
          if (clickTimeout) clearTimeout(clickTimeout);

          const targetTop = targetSec.getBoundingClientRect().top + window.pageYOffset - 100;
          window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });

          clickTimeout = setTimeout(() => {
            isClickScrolling = false;
          }, 800);
        }
      }
    });
  });

  // 2. Scroll Spy Listener
  function onScroll() {
    if (isClickScrolling) return;

    let currentSectionId = '';
    const scrollPos = window.scrollY + 160;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href === `#${currentSectionId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }

  window.addEventListener('scroll', onScroll);
  onScroll();
}

/**
 * Mobile Section Jump Selector
 */
function initMobileJumpSelector() {
  const select = document.getElementById('docs-mobile-select');
  if (!select) return;

  select.addEventListener('change', (e) => {
    const targetHash = e.target.value;
    if (targetHash) {
      const targetElement = document.querySelector(targetHash);
      if (targetElement) {
        const targetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
      }
    }
  });
}

/**
 * Swagger Demo Button Click Feedback
 */
function initSwaggerDemoButton() {
  const btn = document.getElementById('btn-swagger-demo');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const swaggerUrl = window.location.origin.includes('3000') || window.location.origin.includes('vercel.app')
      ? 'http://localhost:5000/api-docs'
      : '/api-docs';
    window.open(swaggerUrl, '_blank');
  });
}
