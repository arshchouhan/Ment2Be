/**
 * Backend Configuration
 * Single source of truth for API base URL
 * Reads from Vite environment variables with intelligent defaults
 */

// Priority order for API URL resolution:
// 1. VITE_API_URL (explicit API endpoint)
// 2. VITE_BACKEND_URL + /api (base URL + api path)
// 3. VITE_BACKEND selector (nodejs/java/render with hardcoded fallbacks)
// 4. Default to render backend in production, nodejs in development

const API_BASE_URL = (() => {
  // Priority 1: Explicit API URL
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Priority 2: Backend URL with /api
  if (import.meta.env.VITE_BACKEND_URL) {
    const url = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
    return `${url}/api`;
  }

  // Priority 3: Backend selector with fallbacks
  const backend = import.meta.env.VITE_BACKEND || (import.meta.env.PROD ? 'render' : 'nodejs');
  
  const backendUrls = {
    nodejs: 'http://localhost:4000/api',
    java: 'http://localhost:8081/api',
    render: 'https://k23dx.onrender.com/api'
  };

  return backendUrls[backend] || backendUrls.render; // Default to render for safety
})();

// Export single constant as primary export
export { API_BASE_URL };

// Legacy exports for backward compatibility
export const getApiUrl = () => API_BASE_URL;

export const getBackendConfig = () => {
  const base = API_BASE_URL.replace(/\/api\/?$/, '');
  return {
    name: API_BASE_URL.includes('render') ? 'Render' : 
           API_BASE_URL.includes(':8081') ? 'Java' : 'Node.js',
    url: base,
    apiUrl: API_BASE_URL
  };
};

export const getBackendName = () => getBackendConfig().name;

// Log configuration in development
if (import.meta.env.DEV) {
  console.log(`[Backend Config] API URL: ${API_BASE_URL}`);
}

export default {
  API_BASE_URL,
  getApiUrl,
  getBackendConfig,
  getBackendName
};
