import apiClient from '../api/axios';

/**
 * PasteBin API Service Layer (services/api.ts)
 * --------------------------------------------------------------------------
 * Purpose:
 * Centralized service module for handling communication between the React frontend
 * and the Express.js + MySQL backend endpoints.
 * 
 * Backend Contract Specifications:
 * - Base URL: /api/pastes (or http://localhost:5000/api/pastes)
 * - Format: JSON
 * --------------------------------------------------------------------------
 */

// --- TYPES & INTERFACES ---

export interface PasteItem {
  id: string;
  title: string;
  language: string;
  expiresIn: 'never' | '1h' | '24h' | '7d' | '30d';
  visibility: 'public' | 'private';
  content: string;
  createdAt: string;
  viewsCount?: number;
  sizeBytes?: number;
}

export interface CreatePastePayload {
  title: string;
  language: string;
  expiresIn: string;
  visibility: 'public' | 'private';
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
  error?: string;
}

// --- API ENDPOINTS FOR BACKEND INTEGRATION ---

/**
 * Backend API Integration - POST /api/pastes
 * Sends payload to Express backend to create a new paste snippet.
 * Note: `expiresIn` and `visibility` are excluded as backend accepts ONLY { title, language, content }.
 */
export async function createPaste(payload: CreatePastePayload): Promise<ApiResponse<PasteItem>> {
  // Construct backend payload containing ONLY title, language, and content
  const backendPayload = {
    title: payload.title,
    language: payload.language,
    content: payload.content
  };

  try {
    // Execute POST request to Express.js backend via reusable Axios instance
    const response = await apiClient.post('/pastes', backendPayload);
    return response.data;
  } catch (error: any) {
    console.error('[API Error] POST /api/pastes failed:', error);
    // Rethrow error for UI components to handle error states
    throw error.response?.data || error;
  }
}

/**
 * Backend API Integration - GET /api/pastes
 * Fetches all public pastes from Express + MySQL backend for the History dashboard.
 */
export async function getAllPastes(): Promise<ApiResponse<PasteItem[]>> {
  try {
    const response = await apiClient.get('/pastes');
    return response.data;
  } catch (error: any) {
    console.error('[API Error] GET /api/pastes failed:', error);
    throw error.response?.data || error;
  }
}

/**
 * Backend API Integration - GET /api/pastes/:paste_code
 * Fetches a single paste by unique paste code (or ID) from Express + MySQL backend.
 */
export async function getPasteById(id: string): Promise<ApiResponse<PasteItem>> {
  try {
    const response = await apiClient.get(`/pastes/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('[API Error] GET /api/pastes/:id failed:', error);
    throw error.response?.data || error;
  }
}

/**
 * Backend API Integration - PUT /api/pastes/:id
 * Updates an existing code paste in Express + MySQL backend.
 */
export async function updatePaste(id: string, payload: UpdatePastePayload): Promise<ApiResponse<PasteItem>> {
  // Construct backend payload containing ONLY title, language, and content
  const backendPayload = {
    title: payload.title,
    language: payload.language,
    content: payload.content
  };

  try {
    const response = await apiClient.put(`/pastes/${id}`, backendPayload);
    return response.data;
  } catch (error: any) {
    console.error('[API Error] PUT /api/pastes/:id failed:', error);
    throw error.response?.data || error;
  }
}

/**
 * Backend API Integration - DELETE /api/pastes/:id
 * Deletes a paste snippet by paste code or ID from Express + MySQL backend.
 */
export async function deletePaste(id: string): Promise<ApiResponse<boolean>> {
  try {
    const response = await apiClient.delete(`/pastes/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('[API Error] DELETE /api/pastes/:id failed:', error);
    throw error.response?.data || error;
  }
}
