/**
 * Documentation Page Interactive Controller (js/docs.js)
 * Scroll spy active section highlighting & mobile jump selector.
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
 * Scroll Spy Active Link Highlighting
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('.docs-section');
  const navLinks = document.querySelectorAll('.docs-nav-link');

  if (!sections.length || !navLinks.length) return;

  function onScroll() {
    let currentSectionId = '';
    const scrollPos = window.scrollY + 140;

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
        targetElement.scrollIntoView({ behavior: 'smooth' });
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
    alert('Swagger Documentation interface ready for backend integration at /api-docs');
  });
}
