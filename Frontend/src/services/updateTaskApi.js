/**
 * Update Task API Service
 * Centralized API calls for task updates
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
 * Update task status
 * @param {string} taskId - The task ID to update
 * @param {string} status - New status (not-started, in-progress, pending-review, completed)
 * @returns {Promise<{success: boolean, task: Object, message: string}>}
 */
export const updateTaskStatus = async (taskId, status) => {
  try {
    console.log(`[UpdateTaskApi] Updating task ${taskId} status to ${status} on ${ACTIVE_BACKEND} backend`);

    const response = await fetch(`${API_URL}/${taskId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify({ status })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update task');
    }

    // Normalize the updated task
    const normalizedTask = normalizeTask(data.task || data.data || {});

    console.log('[UpdateTaskApi] Task updated successfully:', normalizedTask);
    return {
      success: true,
      task: normalizedTask,
      message: data.message || 'Task updated successfully'
    };
  } catch (error) {
    console.error('[UpdateTaskApi] Error updating task:', error);
    throw error;
  }
};

/**
 * Update task progress
 * @param {string} taskId - The task ID to update
 * @param {number} progress - Progress percentage (0-100)
 * @returns {Promise<{success: boolean, task: Object, message: string}>}
 */
export const updateTaskProgress = async (taskId, progress) => {
  try {
    console.log(`[UpdateTaskApi] Updating task ${taskId} progress to ${progress}% on ${ACTIVE_BACKEND} backend`);

    const response = await fetch(`${API_URL}/${taskId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify({ progress })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update task');
    }

    // Normalize the updated task
    const normalizedTask = normalizeTask(data.task || data.data || {});

    console.log('[UpdateTaskApi] Task progress updated successfully:', normalizedTask);
    return {
      success: true,
      task: normalizedTask,
      message: data.message || 'Task progress updated successfully'
    };
  } catch (error) {
    console.error('[UpdateTaskApi] Error updating task progress:', error);
    throw error;
  }
};

/**
 * Update entire task
 * @param {string} taskId - The task ID to update
 * @param {Object} updateData - Data to update
 * @returns {Promise<{success: boolean, task: Object, message: string}>}
 */
export const updateTask = async (taskId, updateData) => {
  try {
    console.log(`[UpdateTaskApi] Updating task ${taskId} on ${ACTIVE_BACKEND} backend`);
    console.log('[UpdateTaskApi] Update data:', updateData);

    const response = await fetch(`${API_URL}/${taskId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(updateData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update task');
    }

    // Normalize the updated task
    const normalizedTask = normalizeTask(data.task || data.data || {});

    console.log('[UpdateTaskApi] Task updated successfully:', normalizedTask);
    return {
      success: true,
      task: normalizedTask,
      message: data.message || 'Task updated successfully'
    };
  } catch (error) {
    console.error('[UpdateTaskApi] Error updating task:', error);
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
