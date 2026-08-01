/**
 * API Service for interacting with Express Backend via Fetch API
 */

const API_BASE_URL = window.location.origin.includes('3000') 
  ? 'http://localhost:3000/api'
  : '/api';

export async function fetchPastes(page = 1, limit = 10) {
  const response = await fetch(`${API_BASE_URL}/pastes?page=${page}&limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch pastes');
  return response.json();
}

export async function fetchPasteById(id) {
  const response = await fetch(`${API_BASE_URL}/pastes/${id}`);
  if (!response.ok) throw new Error('Failed to fetch paste details');
  return response.json();
}

export async function createPaste(pasteData) {
  const response = await fetch(`${API_BASE_URL}/pastes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pasteData),
  });
  if (!response.ok) throw new Error('Failed to create paste');
  return response.json();
}

export async function updatePaste(id, pasteData) {
  const response = await fetch(`${API_BASE_URL}/pastes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pasteData),
  });
  if (!response.ok) throw new Error('Failed to update paste');
  return response.json();
}

export async function deletePaste(id) {
  const response = await fetch(`${API_BASE_URL}/pastes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete paste');
  return response.json();
}
