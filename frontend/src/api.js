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
// Only redirects to /login on 401 when the failing request was NOT itself
// an auth endpoint. This prevents auth pages from being caught in a redirect
// loop and lets login/register/refresh handle their own 401 errors.
const AUTH_PATHS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    const isAuthEndpoint = AUTH_PATHS.some((path) => requestUrl.includes(path));

    if (status === 401 && !isAuthEndpoint) {
      // Clear session and redirect — only for protected API failures
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.clear();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;

