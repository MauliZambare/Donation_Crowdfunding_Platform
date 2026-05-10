  /**
 * API Error Handling Utility
 * Provides consistent error extraction and handling across the app
 */

/**
 * Extracts a user-friendly error message from various error formats
 * @param {Error} error - The error object from API call
 * @param {string} fallback - Fallback message if no specific message found
 * @returns {string} User-friendly error message
 */
export function extractErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const backendMessage = error?.response?.data?.message;
  const backendDetails = error?.response?.data?.details;
  const backendCode = error?.response?.data?.errorCode;
  const status = error?.response?.status;

  if (backendMessage && backendDetails) {
    return `${backendMessage}: ${backendDetails}${backendCode ? ` (${backendCode})` : ""}`;
  }
  if (backendMessage) {
    return `${backendMessage}${backendCode ? ` (${backendCode})` : ""}`;
  }
  if (error?.message) {
    return status ? `${error.message} (HTTP ${status})` : error.message;
  }
  return fallback;
}

/**
 * Check if error is a network error (no response received)
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export function isNetworkError(error) {
  return !error?.response && error?.message?.includes("Network Error");
}

/**
 * Check if error indicates server is unavailable
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export function isServerError(error) {
  const status = error?.response?.status;
  return status >= 500 && status < 600;
}

/**
 * Check if error indicates authentication failure
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export function isAuthError(error) {
  const status = error?.response?.status;
  return status === 401 || status === 403;
}

/**
 * Check if error indicates resource not found
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export function isNotFoundError(error) {
  return error?.response?.status === 404;
}

/**
 * Check if error indicates validation failure
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export function isValidationError(error) {
  return error?.response?.status === 400 || error?.response?.status === 422;
}

/**
 * Handle authentication errors by clearing tokens and redirecting
 * @param {Function} onLogout - Optional callback to handle logout
 */
export function handleAuthError(onLogout) {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  if (typeof onLogout === "function") {
    onLogout();
  }
  window.location.href = "/login";
}

/**
 * Get error title based on HTTP status
 * @param {number} status - HTTP status code
 * @returns {string}
 */
export function getErrorTitle(status) {
  const titles = {
    400: "Bad Request",
    401: "Authentication Failed",
    403: "Access Denied",
    404: "Not Found",
    422: "Validation Error",
    429: "Too Many Requests",
    500: "Server Error",
    502: "Service Unavailable",
    503: "Service Unavailable",
  };
  return titles[status] || "Error";
}

export default {
  extractErrorMessage,
  isNetworkError,
  isServerError,
  isAuthError,
  isNotFoundError,
  isValidationError,
  handleAuthError,
  getErrorTitle,
};
