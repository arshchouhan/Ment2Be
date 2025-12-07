/**
 * Backend Configuration Service
 * Allows easy switching between Node.js and Java backends
 */

// Set the active backend: 'nodejs' or 'java'
// Use Vite's import.meta.env instead of process.env
const ACTIVE_BACKEND = import.meta.env.VITE_BACKEND || 'java';

// Backend URLs
const BACKENDS = {
  nodejs: {
    name: 'Node.js Backend',
    url: 'http://localhost:4000',
    apiUrl: 'http://localhost:4000/api'
  },
  java: {
    name: 'Java Spring Boot Backend',
    url: 'http://localhost:8081',
    apiUrl: 'http://localhost:8081/api'
  }
};

// Get current backend configuration
export const getBackendConfig = () => {
  const backend = BACKENDS[ACTIVE_BACKEND];
  if (!backend) {
    console.warn(`Unknown backend: ${ACTIVE_BACKEND}, defaulting to nodejs`);
    return BACKENDS.nodejs;
  }
  return backend;
};

// Get API URL
export const getApiUrl = () => {
  return getBackendConfig().apiUrl;
};

// Get backend name
export const getBackendName = () => {
  return getBackendConfig().name;
};

// Switch backend at runtime (for testing)
export const switchBackend = (backendName) => {
  if (!BACKENDS[backendName]) {
    console.error(`Unknown backend: ${backendName}`);
    return false;
  }
  console.log(`Switched to ${BACKENDS[backendName].name}`);
  return true;
};

// Get all available backends
export const getAvailableBackends = () => {
  return Object.keys(BACKENDS).map(key => ({
    id: key,
    name: BACKENDS[key].name,
    url: BACKENDS[key].url
  }));
};

// Log current backend configuration
console.log(`[Backend Config] Active Backend: ${getBackendName()}`);
console.log(`[Backend Config] API URL: ${getApiUrl()}`);

export default {
  ACTIVE_BACKEND,
  BACKENDS,
  getBackendConfig,
  getApiUrl,
  getBackendName,
  switchBackend,
  getAvailableBackends
};
