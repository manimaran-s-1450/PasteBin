/**
 * PasteBin Authentication Service & Session Manager
 */

const AUTH_TOKEN_KEY = 'pastebin_jwt_token_v1';
const AUTH_USER_KEY = 'pastebin_user_profile_v1';

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || null;
}

export function getCurrentUser() {
  const stored = localStorage.getItem(AUTH_USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
}

export function isLoggedIn() {
  return !!getAuthToken();
}

export function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export function setAuthSession(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  try {
    sessionStorage.removeItem('pastebin_guest_created_v1');
    sessionStorage.removeItem('pastebin_guest_received_v1');
  } catch (e) {}
}

export function getApiBaseUrl() {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }
  return 'https://pastebin-production-6477.up.railway.app/api';
}

/**
 * Handle Google OAuth Redirect Token Check
 */
export function checkGoogleOAuthRedirect() {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('auth_token');
  const userJson = urlParams.get('auth_user');

  if (token && userJson) {
    try {
      const user = JSON.parse(decodeURIComponent(userJson));
      setAuthSession(token, user);
      
      // Clean URL params
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      // If on login/signup page, redirect to home
      if (cleanUrl.includes('login.html') || cleanUrl.includes('signup.html')) {
        window.location.href = 'index.html';
      }
    } catch (e) {
      console.error('Google OAuth URL parse error:', e);
    }
  }
}

// Auto-run check on module load
checkGoogleOAuthRedirect();

export async function loginUser(emailOrUsername, password, remember_me = false) {
  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrUsername, password, remember_me })
  });

  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.message || 'Login failed. Please check your credentials.');
  }

  setAuthSession(resData.data.token, resData.data.user);
  return resData.data;
}

export async function registerUser(username, email, password, full_name = '', confirm_password = '') {
  const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, full_name, confirm_password })
  });

  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.message || 'Registration failed.');
  }

  setAuthSession(resData.data.token, resData.data.user);
  return resData.data;
}

export async function fetchProfile() {
  const token = getAuthToken();
  if (!token) return null;

  const response = await fetch(`${getApiBaseUrl()}/auth/profile`, {
    method: 'GET',
    headers: { ...getAuthHeaders() }
  });

  const resData = await response.json();
  if (response.ok && resData.success) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(resData.data));
    return resData.data;
  }
  return null;
}

export function logoutUser() {
  clearAuthSession();
  window.location.href = 'index.html';
}
