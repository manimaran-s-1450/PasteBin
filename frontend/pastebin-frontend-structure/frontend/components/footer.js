/**
 * Footer Component Injector for dynamic pages
 */
export function renderFooter() {
  const container = document.getElementById('footer-container');
  if (!container) return;

  container.innerHTML = `
    <footer class="footer">
      <div class="container footer-content">
        
        <!-- Brand column -->
        <div class="footer-brand">
          <a href="index.html" class="nav-brand">
            <div class="logo-icon small">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </div>
            <span class="logo-text">Paste<span class="logo-highlight">Bin</span></span>
          </a>
          <p class="footer-tagline">The simplest way to share text<br>and code instantly.</p>
        </div>

        <!-- Links Column 1: Product -->
        <div class="footer-col">
          <h4 class="footer-heading">Product</h4>
          <a href="index.html" class="footer-link">Home</a>
          <a href="create.html" class="footer-link">Create Paste</a>
          <a href="history.html" class="footer-link">History</a>
        </div>

        <!-- Links Column 2: Resources -->
        <div class="footer-col">
          <h4 class="footer-heading">Resources</h4>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" class="footer-link">
            <span>GitHub</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
          <a href="docs.html" class="footer-link">
            <span>Swagger API</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>

        <!-- Links Column 3: About -->
        <div class="footer-col">
          <h4 class="footer-heading">About</h4>
          <a href="about.html" class="footer-link">About PasteBin</a>
          <a href="about.html#contact" class="footer-link">Contact</a>
        </div>

        <!-- Links Column 4: Stay Connected -->
        <div class="footer-col">
          <h4 class="footer-heading">Stay connected</h4>
          <div class="social-icons">
            <a href="https://github.com" target="_blank" aria-label="GitHub" class="social-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
            <a href="#" aria-label="Website" class="social-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </a>
          </div>
        </div>

      </div>

      <!-- Copyright Bottom Bar -->
      <div class="footer-bottom">
        <div class="container footer-bottom-inner">
          <p>&copy; 2026 PasteBin. All rights reserved. <span class="heart">💜</span></p>
        </div>
      </div>
    </footer>
  `;
}

window.renderFooter = renderFooter;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderFooter);
} else {
  renderFooter();
}
