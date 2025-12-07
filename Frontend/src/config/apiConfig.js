/**
 * API Configuration - Switch between Node.js and Java backends
 * Change TASK_API_URL to switch between implementations
 */

// Set to 'nodejs' or 'java' to switch between backends
const ACTIVE_BACKEND = 'nodejs'; // Change this to 'java' to use Java backend

const API_URLS = {
  nodejs: 'http://localhost:4000/api/tasks',
  java: 'http://localhost:8081/api/tasks'
};

export const TASK_API_URL = API_URLS[ACTIVE_BACKEND];

export const getTasksApiUrl = () => TASK_API_URL;

export const switchBackend = (backend) => {
  if (!API_URLS[backend]) {
    console.error(`Invalid backend: ${backend}. Use 'nodejs' or 'java'`);
    return;
  }
  console.log(`Switched to ${backend} backend: ${API_URLS[backend]}`);
};

export default {
  TASK_API_URL,
  getTasksApiUrl,
  switchBackend,
  ACTIVE_BACKEND
};
