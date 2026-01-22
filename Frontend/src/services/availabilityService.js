/**
 * Availability Service - Handles all availability related API calls
 * Uses centralized API URL configuration
 */

import { getApiUrl } from '../utils/apiUrl.js';

const API_URL = `${getApiUrl()}/mentor-availability`;

console.log(`🔧 [Availability Service] API URL: ${API_URL}`);

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Save mentor availability
 * @param {Object} availabilityData - { date, timeSlots, duration }
 * @returns {Promise<{success: boolean, data: Object, message: string}>}
 */
export const saveAvailability = async (availabilityData) => {
  try {
    console.log(`📤 [${ACTIVE_BACKEND.toUpperCase()}] Saving availability:`, availabilityData);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(availabilityData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to save availability');
    }

    console.log(`✅ [${ACTIVE_BACKEND.toUpperCase()}] Availability saved successfully`);
    return data;
  } catch (error) {
    console.error(`❌ [${ACTIVE_BACKEND.toUpperCase()}] Error saving availability:`, error);
    throw error;
  }
};

/**
 * Get available slots for a mentor on a specific date
 * @param {string} mentorId - Mentor ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<{success: boolean, availableSlots: Array, duration: number}>}
 */
export const getAvailableSlots = async (mentorId, date) => {
  try {
    console.log(`📥 [${ACTIVE_BACKEND.toUpperCase()}] Fetching available slots for mentor ${mentorId} on ${date}`);
    
    const response = await fetch(`${API_URL}/mentor/${mentorId}?date=${date}`, {
      method: 'GET',
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch available slots');
    }

    console.log(`✅ [${ACTIVE_BACKEND.toUpperCase()}] Found ${data.availableSlots?.length || 0} available slots`);
    return data;
  } catch (error) {
    console.error(`❌ [${ACTIVE_BACKEND.toUpperCase()}] Error fetching available slots:`, error);
    throw error;
  }
};

/**
 * Get all availability for authenticated mentor (their own dashboard)
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export const getAllAvailability = async () => {
  try {
    console.log(`📥 [${ACTIVE_BACKEND.toUpperCase()}] Fetching all availability for logged-in mentor`);
    
    const response = await fetch(`${API_URL}/my-availability`, {
      method: 'GET',
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch availability');
    }

    console.log(`✅ [${ACTIVE_BACKEND.toUpperCase()}] Retrieved ${data.data?.length || 0} availability records`);
    return data;
  } catch (error) {
    console.error(`❌ [${ACTIVE_BACKEND.toUpperCase()}] Error fetching availability:`, error);
    throw error;
  }
};

/**
 * Delete availability
 * @param {string} availabilityId - Availability ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteAvailability = async (availabilityId) => {
  try {
    console.log(`🗑️ [${ACTIVE_BACKEND.toUpperCase()}] Deleting availability ${availabilityId}`);
    
    const response = await fetch(`${API_URL}/${availabilityId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete availability');
    }

    console.log(`✅ [${ACTIVE_BACKEND.toUpperCase()}] Availability deleted successfully`);
    return data;
  } catch (error) {
    console.error(`❌ [${ACTIVE_BACKEND.toUpperCase()}] Error deleting availability:`, error);
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
// Re-exported from apiUrl.js above

/**
 * Switch backend (for testing purposes)
 * @param {string} backend - 'nodejs' or 'java'
 */
export const switchBackend = (backend) => {
  if (!BACKEND_URLS[backend]) {
    console.error(`Invalid backend: ${backend}. Use 'nodejs' or 'java'`);
    return;
  }
  console.log(`🔄 Switched to ${backend.toUpperCase()} backend`);
  console.log(`  API URL: ${BACKEND_URLS[backend]}/api/mentor-availability`);
};

export default {
  saveAvailability,
  getAvailableSlots,
  getAllAvailability,
  deleteAvailability,
  getActiveBackend,
  getApiUrl,
  switchBackend
};
