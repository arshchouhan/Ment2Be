// Task Service - Handles all task-related API calls to Java backend

import { buildApiUrl } from '../utils/apiUrl.js';

const API_BASE_URL = buildApiUrl('/tasks');

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Create a new task
 */
export const createTask = async (taskData) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(taskData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create task');
    }

    return data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Get all tasks for the current mentor
 */
export const getAllTasks = async () => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch tasks');
    }

    return data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

/**
 * Get task by ID
 */
export const getTaskById = async (taskId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${taskId}`, {
      method: 'GET',
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch task');
    }

    return data;
  } catch (error) {
    console.error('Error fetching task:', error);
    throw error;
  }
};

/**
 * Get tasks for a specific mentee
 */
export const getTasksByMentee = async (menteeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/mentee/${menteeId}`, {
      method: 'GET',
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch tasks');
    }

    return data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

/**
 * Get tasks by status
 */
export const getTasksByStatus = async (status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/status/${status}`, {
      method: 'GET',
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch tasks');
    }

    return data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

/**
 * Update a task
 */
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${taskId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(taskData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update task');
    }

    return data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (taskId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete task');
    }

    return data;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export default {
  createTask,
  getAllTasks,
  getTaskById,
  getTasksByMentee,
  getTasksByStatus,
  updateTask,
  deleteTask
};
