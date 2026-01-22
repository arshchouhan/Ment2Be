/**
 * Centralized API URL utility
 * Single source of truth for all API endpoints
 * Uses environment variables with fallback to Vite config
 */

/**
 * Get the base API URL for all API calls
 * Respects VITE_API_URL environment variable
 * Falls back to VITE_BACKEND_URL or constructed URL
 * @returns {string} The base API URL (e.g., 'https://k23dx.onrender.com/api')
 */
export const getApiUrl = () => {
  // Priority 1: Explicit API URL environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Priority 2: Backend URL environment variable
  if (import.meta.env.VITE_BACKEND_URL) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
    return `${backendUrl}/api`;
  }

  // Fallback: Use backend selector
  const backend = import.meta.env.VITE_BACKEND || (import.meta.env.PROD ? 'render' : 'nodejs');
  
  const backends = {
    nodejs: 'http://localhost:4000/api',
    java: 'http://localhost:8081/api',
    render: 'https://k23dx.onrender.com/api'
  };

  const url = backends[backend] || backends.render;
  return url;
};

/**
 * Get the base backend URL (without /api)
 * Useful for Socket.IO and other non-API endpoints
 * @returns {string} The base backend URL (e.g., 'https://k23dx.onrender.com')
 */
export const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  }

  const backend = import.meta.env.VITE_BACKEND || (import.meta.env.PROD ? 'render' : 'nodejs');
  
  const backends = {
    nodejs: 'http://localhost:4000',
    java: 'http://localhost:8081',
    render: 'https://k23dx.onrender.com'
  };

  return backends[backend] || backends.render;
};

/**
 * Build a full endpoint URL
 * @param {string} endpoint - The API endpoint (e.g., '/users/me', 'bookings/123')
 * @returns {string} The full URL (e.g., 'https://k23dx.onrender.com/api/users/me')
 */
export const buildApiUrl = (endpoint) => {
  const apiUrl = getApiUrl().replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${apiUrl}${path}`;
};

// Log configuration on import (helpful for debugging)
if (import.meta.env.DEV) {
  console.log('[API Config] API URL:', getApiUrl());
  console.log('[API Config] Backend URL:', getBackendUrl());
  console.log('[API Config] VITE_BACKEND:', import.meta.env.VITE_BACKEND);
}
