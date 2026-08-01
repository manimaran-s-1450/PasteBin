/**
 * About Page Controller (js/about.js)
 * Redirects View GitHub Repository button to user's GitHub repository.
 */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGitHubDemoButton);
} else {
  initGitHubDemoButton();
}

function initGitHubDemoButton() {
  const btn = document.getElementById('btn-github-demo');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.open('https://github.com/manimaran-s-1450/PasteBin', '_blank', 'noopener,noreferrer');
  });
}
