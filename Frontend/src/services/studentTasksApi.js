/**
 * Student Tasks API Service
 * Centralized API calls for student tasks
 * Change BACKEND_URL to switch between Node.js and Java
 */

// Switch between 'nodejs' and 'java'
const ACTIVE_BACKEND = 'java';

const BACKEND_URLS = {
  nodejs: 'http://localhost:4000',
  java: 'http://localhost:8081'
};

const BASE_URL = BACKEND_URLS[ACTIVE_BACKEND];
const API_URL = `${BASE_URL}/api/tasks`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Normalize task data from different backends
 * Ensures consistent format regardless of backend
 */
const normalizeTask = (task) => {
  return {
    _id: task._id || task.id,
    id: task._id || task.id,
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'not-started',
    priority: task.priority || 'medium',
    category: task.category || '',
    dueDate: task.dueDate || null,
    progress: task.progress || 0,
    mentorId: task.mentorId || task.mentor?._id || null,
    mentorName: task.mentor?.name || task.mentorName || 'Mentor',
    menteeId: task.menteeId || task.mentee?._id || null,
    menteeName: task.mentee?.name || task.menteeName || '',
    createdAt: task.createdAt || null,
    updatedAt: task.updatedAt || null
  };
};

/**
 * Fetch tasks for a specific student (mentee)
 * @param {string} menteeId - The student's ID
 * @returns {Promise<{success: boolean, tasks: Array, total: number}>}
 */
export const fetchStudentTasks = async (menteeId) => {
  try {
    if (!menteeId) {
      throw new Error('Student ID is required');
    }

    console.log(`[StudentTasksApi] Fetching tasks for mentee: ${menteeId} from ${ACTIVE_BACKEND} backend`);

    const response = await fetch(`${API_URL}/mentee/${menteeId}`, {
      method: 'GET',
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch tasks');
    }

    // Normalize tasks to ensure consistent format
    const normalizedTasks = (data.tasks || []).map(normalizeTask);

    console.log(`[StudentTasksApi] Successfully fetched ${normalizedTasks.length} tasks`);
    return {
      success: data.success,
      tasks: normalizedTasks,
      total: normalizedTasks.length
    };
  } catch (error) {
    console.error('[StudentTasksApi] Error fetching tasks:', error);
    throw error;
  }
};

/**
 * Get all tasks (for mentor view)
 * @returns {Promise<{success: boolean, tasks: Array, total: number}>}
 */
export const fetchAllTasks = async () => {
  try {
    console.log(`[StudentTasksApi] Fetching all tasks from ${ACTIVE_BACKEND} backend`);

    const response = await fetch(API_URL, {
      method: 'GET',
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch tasks');
    }

    // Normalize tasks to ensure consistent format
    const normalizedTasks = (data.tasks || []).map(normalizeTask);

    console.log(`[StudentTasksApi] Successfully fetched ${normalizedTasks.length} tasks`);
    return {
      success: data.success,
      tasks: normalizedTasks,
      total: normalizedTasks.length
    };
  } catch (error) {
    console.error('[StudentTasksApi] Error fetching all tasks:', error);
    throw error;
  }
};

/**
 * Get current active backend
 * @returns {string} 'nodejs' or 'java'
 */
export const getActiveBackend = () => {
  return ACTIVE_BACKEND;
};

/**
 * Get current API URL
 * @returns {string} Full API URL
 */
export const getApiUrl = () => {
  return API_URL;
};
