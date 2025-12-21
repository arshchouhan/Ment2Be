/**
 * API Configuration - Switch between Node.js and Java backends
 * Change ACTIVE_BACKEND to switch between implementations
 */

// Set to 'nodejs', 'java', or 'render' to switch between backends
const ACTIVE_BACKEND = 'nodejs'; // ✅ Using Render backend

// Base URLs for different backends
const BASE_URLS = {
  nodejs: 'http://localhost:4000',
  java: 'http://localhost:8081',
  render: 'https://k23dx.onrender.com'
};

// API URLs for different services
const API_URLS = {
  nodejs: {
    tasks: 'http://localhost:4000/api/tasks',
    forum: 'http://localhost:4000/api/forum'
  },
  java: {
    tasks: 'http://localhost:8081/api/tasks',
    forum: 'http://localhost:8081/api/forum'
  },
  render: {
    tasks: 'https://k23dx.onrender.com/api/tasks',
    forum: 'https://k23dx.onrender.com/api/forum'
  }
};

// Export base URL for general use
export const API_BASE_URL = BASE_URLS[ACTIVE_BACKEND];

// Export specific service URLs
export const TASK_API_URL = API_URLS[ACTIVE_BACKEND].tasks;
export const FORUM_API_URL = API_URLS[ACTIVE_BACKEND].forum;

export const getTasksApiUrl = () => TASK_API_URL;
export const getForumApiUrl = () => FORUM_API_URL;

export const switchBackend = (backend) => {
  if (!API_URLS[backend]) {
    console.error(`Invalid backend: ${backend}. Use 'nodejs' or 'java'`);
    return;
  }
  console.log(`Switched to ${backend} backend`);
  console.log(`  Tasks API: ${API_URLS[backend].tasks}`);
  console.log(`  Forum API: ${API_URLS[backend].forum}`);
};

export default {
  API_BASE_URL,
  TASK_API_URL,
  FORUM_API_URL,
  getTasksApiUrl,
  getForumApiUrl,
  switchBackend,
  ACTIVE_BACKEND
};
