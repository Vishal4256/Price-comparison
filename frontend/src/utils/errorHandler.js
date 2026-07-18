/**
 * Centralized API Error Extraction
 * 
 * Safely parses nested error structures from Axios and normalizes 
 * them into a single string for the UI.
 * 
 * Handles:
 * - Backend standard structure: { error: { message: "..." } }
 * - Legacy/Fallbacks: { message: "..." } or { error: "..." }
 * - Network Errors (Timeout, 500, 404, 401, 429)
 * 
 * @param {Error} error Axios error object
 * @param {String} defaultMessage Fallback if parsing fails completely
 * @returns {String} Normalized error string
 */
export function getApiError(error, defaultMessage = 'An unexpected error occurred. Please try again.') {
    // 1. Check if we have a response from the server (handled by Express)
    if (error.response) {
        const { status, data } = error.response;

        // Specific HTTP Status Code Interceptions
        if (status === 401) return 'Session expired or invalid credentials. Please log in again.';
        if (status === 403) return 'You do not have permission to perform this action.';
        if (status === 404) return 'The requested resource could not be found.';
        if (status === 429) return 'Too many requests. Please wait a moment and try again.';
        if (status >= 500) return 'The server encountered an issue. Please try again later.';

        // Safely extract the custom message from the payload
        if (data) {
            // New Backend Contract: { error: { message: "..." } }
            if (data.error && data.error.message) {
                return data.error.message;
            }
            // Fallback for strings: { error: "..." }
            if (typeof data.error === 'string') {
                return data.error;
            }
            // Older standard: { message: "..." }
            if (data.message) {
                return data.message;
            }
        }
    } 
    // 2. Check if the request was made but no response was received (Network error/Timeout)
    else if (error.request) {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            return 'The connection timed out. Please check your internet and try again.';
        }
        return 'Network error. Please check your connection to the server.';
    }

    // 3. Something happened in setting up the request that triggered an Error
    if (error.message) {
        return error.message;
    }

    // 4. Absolute Fallback
    return defaultMessage;
}
