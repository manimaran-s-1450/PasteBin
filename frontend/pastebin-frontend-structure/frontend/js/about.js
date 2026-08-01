/**
 * About Page Controller (js/about.js)
 */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGitHubDemoButton);
} else {
  initGitHubDemoButton();
}

function initGitHubDemoButton() {
  const btn = document.getElementById('btn-github-demo');
  if (!btn) return;

  btn.addEventListener('click', () => {
    alert('PasteBin Open Source GitHub repository link ready for production deployment.');
  });
}
