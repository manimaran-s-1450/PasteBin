import apiClient from '../api/axios';

/**
 * PasteBin API Service Layer (services/api.ts)
 * --------------------------------------------------------------------------
 * Purpose:
 * Centralized service module for handling communication between the React frontend
 * and the Express.js + MySQL backend endpoints.
 * --------------------------------------------------------------------------
 */

export interface PasteItem {
  id: string;
  paste_code?: string;
  title: string;
  language: string;
  expiresIn?: 'never' | '1h' | '24h' | '7d' | '30d';
  visibility?: 'public' | 'private';
  content?: string;
  createdAt?: string;
  created_at?: string;
  viewsCount?: number;
  sizeBytes?: number;
}

export interface CreatePastePayload {
  title: string;
  language: string;
  expiresIn?: string;
  visibility?: 'public' | 'private';
  content: string;
}

export interface UpdatePastePayload {
  title?: string;
  language?: string;
  expiresIn?: string;
  visibility?: 'public' | 'private';
  content?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}

function getAuthHeader() {
  const token = localStorage.getItem('pastebin_jwt_token_v1');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Backend API Integration - POST /api/pastes
 */
export async function createPaste(payload: CreatePastePayload): Promise<ApiResponse<PasteItem>> {
  const backendPayload = {
    title: payload.title,
    language: payload.language,
    content: payload.content
  };

  try {
    const response = await apiClient.post('/pastes', backendPayload, { headers: getAuthHeader() });
    return response.data;
  } catch (error: any) {
    console.error('[API Error] POST /api/pastes failed:', error);
    throw error.response?.data || error;
  }
}

/**
 * Backend API Integration - GET /api/pastes/my
 * Fetches ONLY the authenticated user's created pastes.
 */
export async function getMyPastes(): Promise<ApiResponse<PasteItem[]>> {
  try {
    const response = await apiClient.get('/pastes/my', { headers: getAuthHeader() });
    return response.data;
  } catch (error: any) {
    console.error('[API Error] GET /api/pastes/my failed:', error);
    throw error.response?.data || error;
  }
}

/**
 * Backend API Integration - GET /api/pastes/received
 * Fetches history list of pastes received/viewed by the authenticated user.
 */
export async function getReceivedPastes(): Promise<ApiResponse<PasteItem[]>> {
  try {
    const response = await apiClient.get('/pastes/received', { headers: getAuthHeader() });
    return response.data;
  } catch (error: any) {
    console.error('[API Error] GET /api/pastes/received failed:', error);
    throw error.response?.data || error;
  }
}

/**
 * Backend API Integration - GET /api/pastes
 * Fetches all public pastes.
 */
export async function getAllPastes(): Promise<ApiResponse<PasteItem[]>> {
  try {
    const response = await apiClient.get('/pastes', { headers: getAuthHeader() });
    return response.data;
  } catch (error: any) {
    console.error('[API Error] GET /api/pastes failed:', error);
    throw error.response?.data || error;
  }
}

/**
 * Backend API Integration - GET /api/pastes/:paste_code
 */
export async function getPasteById(id: string): Promise<ApiResponse<PasteItem>> {
  try {
    const response = await apiClient.get(`/pastes/${id}`, { headers: getAuthHeader() });
    return response.data;
  } catch (error: any) {
    console.error('[API Error] GET /api/pastes/:id failed:', error);
    throw error.response?.data || error;
  }
}

/**
 * Backend API Integration - PUT /api/pastes/:id
 */
export async function updatePaste(id: string, payload: UpdatePastePayload): Promise<ApiResponse<PasteItem>> {
  const backendPayload = {
    title: payload.title,
    language: payload.language,
    visibility: payload.visibility,
    expires_in: payload.expiresIn,
    content: payload.content
  };

  try {
    const response = await apiClient.put(`/pastes/${id}`, backendPayload, { headers: getAuthHeader() });
    return response.data;
  } catch (error: any) {
    console.error('[API Error] PUT /api/pastes/:id failed:', error);
    throw error.response?.data || error;
  }
}

/**
 * Backend API Integration - DELETE /api/pastes/:id
 * Sends paste_code when available, fallback to numeric id if paste_code does not exist.
 */
export async function deletePaste(identifier: string | { paste_code?: string; id?: string }): Promise<ApiResponse<boolean>> {
  const code = typeof identifier === 'object'
    ? (identifier.paste_code || identifier.id || '')
    : identifier;

  try {
    const response = await apiClient.delete(`/pastes/${encodeURIComponent(code)}`, { headers: getAuthHeader() });
    return response.data;
  } catch (error: any) {
    console.error('[API Error] DELETE /api/pastes/:id failed:', error);
    throw error.response?.data || error;
  }
}
