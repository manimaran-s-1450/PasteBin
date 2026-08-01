import axios from 'axios';

/**
 * ============================================================================
 * PasteBin Reusable Axios Client Instance (src/api/axios.ts)
 * ============================================================================
 * 
 * Purpose:
 * Configures a pre-configured, reusable Axios HTTP client instance to communicate
 * with the PasteBin Express.js + MySQL backend REST API server.
 * 
 * Why Use a Reusable Axios Instance?
 * 1. Centralized Configuration: Defines base URL, default headers, and timeouts in one location.
 * 2. Avoids Hardcoding: Prevents repeating `http://localhost:5000/api` in every single component or service.
 * 3. Scalability: Enables adding global request/response interceptors (e.g. JWT Auth headers, error logging) in the future.
 * 4. DRY Principle: Enforces consistent request behavior and headers across all API calls.
 * 
 * How it is Shared Across the Application:
 * Exported as the default export. Service modules (such as `src/services/api.ts`) 
 * and custom React hooks will import this `apiClient` to execute HTTP requests:
 *   - `apiClient.get('/pastes')`
 *   - `apiClient.post('/pastes', payload)`
 *   - `apiClient.get('/pastes/:id')`
 *   - `apiClient.put('/pastes/:id', payload)`
 *   - `apiClient.delete('/pastes/:id')`
 * ============================================================================
 */

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5000/api'
      : 'https://pastebin-production-6477.up.railway.app/api';
  }
  return 'https://pastebin-production-6477.up.railway.app/api';
};

const apiClient = axios.create({
  // Express.js Backend Base API URL
  baseURL: getApiBaseUrl(),

  // Default headers sent with every JSON request
  headers: {
    'Content-Type': 'application/json',
  },

  // Request timeout in milliseconds (10 seconds)
  timeout: 10000,
});

export default apiClient;
