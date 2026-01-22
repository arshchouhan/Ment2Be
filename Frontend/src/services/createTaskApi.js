/**
 * Create Task API Service
 * Centralized API calls for task creation
 */

import { buildApiUrl } from '../utils/apiUrl.js';

const API_URL = buildApiUrl('/tasks');

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Normalize task response from different backends
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
 * Create a new task
 * @param {Object} taskData - Task data to create
 * @returns {Promise<{success: boolean, task: Object, message: string}>}
 */
export const createTask = async (taskData) => {
  try {
    console.log(`[CreateTaskApi] Creating task on ${ACTIVE_BACKEND} backend`);
    console.log('[CreateTaskApi] Task data:', taskData);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(taskData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create task');
    }

    // Normalize the created task
    const normalizedTask = normalizeTask(data.task || data.data || {});

    console.log('[CreateTaskApi] Task created successfully:', normalizedTask);
    return {
      success: true,
      task: normalizedTask,
      message: data.message || 'Task created successfully'
    };
  } catch (error) {
    console.error('[CreateTaskApi] Error creating task:', error);
    throw error;
  }
};

/**
 * Get current active backend
 * @returns {string} 'nodejs' or 'java'
 */
export const getActiveBackend = () => {
  return ACTIVE_BACKEND || 'render';
};

/**
 * Get current API URL
 * @returns {string} Full API URL
 */
export const getApiUrl = () => {
  return API_URL;
};
