import axios from 'axios';

// Fallback to localhost if the environment variable is not provided
export const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/**
 * Normalize the auth response regardless of nesting shape.
 *
 * Backend contract: { success: true, data: { token, _id, name, email, role } }
 * Fallback: { token, _id, name, email } (flat)
 *
 * @param {Object} responseData - The Axios response.data object
 * @returns {{ token: string, user: Object }}
 */
export function extractAuth(responseData) {
  const auth = responseData?.data ?? responseData;
  const token = auth?.token;
  const user = { ...auth };
  delete user.token; // keep user object clean
  return { token, user };
}

// ─── Request Interceptor ───────────────────────────────────────────────────
// Attaches the JWT only when it is a real token (not null, undefined, or the
// literal string "undefined" that would result from a previous storage bug).
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const isValidToken = token && token !== 'undefined' && token !== 'null';
    if (isValidToken) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────
// Only redirects to /login on 401 when the client actually had a valid token
// stored. If no token existed, the 401 is expected (unauthenticated request)
// and the caller handles it — preventing auth pages from being force-redirected.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    const token = localStorage.getItem('token');
    const hasValidToken = token && token !== 'undefined' && token !== 'null';

    if (status === 401 && hasValidToken) {
      // A protected request returned 401 despite a stored token — session is
      // expired or revoked on the server. Clear auth state and redirect.
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.clear();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;

