import { loginUser } from './auth.js';

function showToast(message, type = 'info') {
  const existingToast = document.querySelector('.pastebin-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = `pastebin-toast toast-${type}`;
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 99999;
    background: ${type === 'error' ? '#EF4444' : type === 'success' ? '#22C55E' : '#8B5CF6'};
    color: white; padding: 12px 20px; border-radius: 12px; font-weight: 600;
    font-size: 0.9rem; box-shadow: 0 10px 30px rgba(0,0,0,0.3); transition: all 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identity = document.getElementById('login-identity').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      showToast('Signing in...', 'info');
      await loginUser(identity, password);
      showToast('Logged in successfully!', 'success');
      setTimeout(() => {
        window.location.href = 'history.html';
      }, 1000);
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    }
  });
});
