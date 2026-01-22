import { getApiUrl } from '../utils/apiUrl.js';

const API_BASE_URL = getApiUrl();

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  console.log('Auth token:', token ? 'Present' : 'Missing');
  return token;
};

// Create headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Handle API response
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.log('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      errorData
    });
    
    if (response.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    if (response.status === 403) {
      throw new Error('Access denied. Your session may have expired.');
    }
    
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const messageService = {
  // Get all conversations for the authenticated user
  getConversations: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      const result = await handleResponse(response);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  // Get messages for a specific conversation
  getConversationMessages: async (participantId, limit = 50, skip = 0) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/messages/conversations/${participantId}/messages?limit=${limit}&skip=${skip}`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      );
      
      const result = await handleResponse(response);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      throw error;
    }
  },

  // Send a new message
  sendMessage: async (receiverId, content, messageType = 'normal', relatedBooking = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          receiverId,
          content,
          messageType,
          relatedBooking
        })
      });
      
      const result = await handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Mark messages as read
  markMessagesAsRead: async (senderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/conversations/${senderId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      
      const result = await handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // Get unread message count
  getUnreadCount: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/unread-count`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      const result = await handleResponse(response);
      return result.data?.unreadCount || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  // Get users that can be messaged
  getMessageableUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/messageable-users`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      const result = await handleResponse(response);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching messageable users:', error);
      throw error;
    }
  },

  getStudentConnections: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/connections/my-connections?status=connected`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const result = await handleResponse(response);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching student connections:', error);
      throw error;
    }
  },

  getMentorConnections: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/connections/mentor-connections?status=connected`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const result = await handleResponse(response);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching mentor connections:', error);
      throw error;
    }
  },

  // Get confirmed sessions for the current user
  getConfirmedSessions: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings?status=confirmed`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      const result = await handleResponse(response);
      return result.bookings || [];
    } catch (error) {
      console.error('Error fetching confirmed sessions:', error);
      throw error;
    }
  }
};
