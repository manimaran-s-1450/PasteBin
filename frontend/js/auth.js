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
}

const getApiBaseUrl = () => (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'http://localhost:5000/api'
  : 'https://pastebin-production-6477.up.railway.app/api';

export async function loginUser(emailOrUsername, password) {
  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrUsername, password })
  });

  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.message || 'Login failed. Please check your credentials.');
  }

  setAuthSession(resData.data.token, resData.data.user);
  return resData.data;
}

export async function registerUser(username, email, password) {
  const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });

  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.message || 'Registration failed.');
  }

  setAuthSession(resData.data.token, resData.data.user);
  return resData.data;
}

export function logoutUser() {
  clearAuthSession();
  window.location.href = 'index.html';
}
