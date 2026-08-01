import { registerUser, getApiBaseUrl, checkGoogleOAuthRedirect } from './auth.js';

function showToast(message, type = 'info') {
  const existingToast = document.querySelector('.pastebin-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = `pastebin-toast toast-${type}`;
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 99999;
    background: ${type === 'error' ? '#EF4444' : type === 'success' ? '#10B981' : '#8B5CF6'};
    color: white; padding: 12px 20px; border-radius: 14px; font-weight: 600;
    font-size: 0.9rem; box-shadow: 0 10px 30px rgba(0,0,0,0.3); transition: all 0.3s ease;
    backdrop-filter: blur(10px); display: flex; align-items: center; gap: 0.5rem;
  `;
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

document.addEventListener('DOMContentLoaded', () => {
  checkGoogleOAuthRedirect();

  const urlParams = new URLSearchParams(window.location.search);
  const errorMsg = urlParams.get('error');
  if (errorMsg) {
    showToast(decodeURIComponent(errorMsg), 'error');
  }

  const form = document.getElementById('signup-form');
  const toggleBtn = document.getElementById('toggle-password-btn');
  const passwordInput = document.getElementById('signup-password');
  const submitBtn = document.getElementById('btn-signup-submit');

  const googleBtn = document.getElementById('btn-social-google');
  const githubBtn = document.getElementById('btn-social-github');

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    });
  }

  // Real Google OAuth 2.0 Flow
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      showToast('Redirecting to Google Sign-In...', 'info');
      window.location.href = `${getApiBaseUrl()}/auth/google`;
    });
  }

  // GitHub Social Demo
  if (githubBtn) {
    githubBtn.addEventListener('click', () => {
      showToast('GitHub OAuth placeholder. Please use Google Sign-In or Email/Password.', 'info');
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('signup-fullname')?.value.trim() || '';
      const username = document.getElementById('signup-username').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = passwordInput.value;
      const confirmPassword = document.getElementById('signup-confirm-password')?.value || '';

      if (confirmPassword && password !== confirmPassword) {
        showToast('Passwords do not match. Please verify.', 'error');
        return;
      }

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span>Creating Account...</span>`;
        }

        showToast('Registering user account...', 'info');
        await registerUser(username, email, password, fullName, confirmPassword);
        showToast('Account created successfully! Redirecting to Home...', 'success');

        setTimeout(() => {
          window.location.href = 'index.html';
        }, 800);
      } catch (err) {
        showToast(err.message || 'Registration failed. Please try again.', 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Create Account</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12" 5 19 12 12 19"></polyline></svg>`;
        }
      }
    });
  }
});
