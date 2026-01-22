// Central API service for MentorLink platform
import { getApiUrl } from '../utils/apiUrl.js';

const API_URL = getApiUrl();

const apiRequest = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fullUrl = `${API_URL}${endpoint}`;
  console.log(`API Request: ${options.method || 'GET'} ${fullUrl}`);

  try {
    const fetchOptions = {
      ...options,
      headers,
      credentials: 'include',
      mode: 'cors'
    };

    if (options.body && !['GET', 'HEAD'].includes(options.method || 'GET')) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(fullUrl, fetchOptions);
    const responseText = await response.text();
    let data;
    
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error('Failed to parse JSON response:', responseText);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
    }

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.response = { data };
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const authAPI = {
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: userData,
    });
  },

  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export const userAPI = {
  getMe: () => apiRequest('/user/me'),
  
  updateMe: (data) => 
    apiRequest('/user/me', {
      method: 'PATCH',
      body: data,
    }),
};

export const mentorAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/mentors${queryParams ? '?' + queryParams : ''}`);
  },
  
  getById: (id) => apiRequest(`/mentors/${id}`),
  
  getBySkill: (skillId) => apiRequest(`/mentors/skill/${skillId}`),
  
  getCarousel: () => apiRequest('/mentors/carousel'),
};

export const skillsAPI = {
  getAll: () => apiRequest('/skills'),
  
  create: (data) => 
    apiRequest('/skills', {
      method: 'POST',
      body: data,
    }),
    
  getMentorSkills: (mentorId) => apiRequest(`/skills/mentor/${mentorId}`),
  
  addToMentor: (mentorId, skillIds) =>
    apiRequest(`/skills/mentor/${mentorId}/skills`, {
      method: 'POST',
      body: { skillIds },
    }),
    
  removeFromMentor: (mentorId, skillId) =>
    apiRequest(`/skills/mentor/${mentorId}/skills/${skillId}`, {
      method: 'DELETE',
    }),
};

export const sessionAPI = {
  create: (data) =>
    apiRequest('/sessions', {
      method: 'POST',
      body: data,
    }),
    
  getByRole: (role) => apiRequest(`/sessions?role=${role}`),
  
  getById: (id) => apiRequest(`/sessions/${id}`),
  
  updateStatus: (id, status) =>
    apiRequest(`/sessions/${id}/status`, {
      method: 'PATCH',
      body: { status },
    }),
};

export const paymentAPI = {
  create: (data) =>
    apiRequest('/payments', {
      method: 'POST',
      body: data,
    }),
    
  getById: (id) => apiRequest(`/payments/${id}`),
  
  updateStatus: (id, status, providerTxnId) =>
    apiRequest(`/payments/${id}/status`, {
      method: 'PATCH',
      body: { status, providerTxnId },
    }),
    
  getBySession: (sessionId) => apiRequest(`/payments/session/${sessionId}`),
};

export const reviewAPI = {
  create: (data) =>
    apiRequest('/reviews', {
      method: 'POST',
      body: data,
    }),
    
  getByMentor: (mentorId) => apiRequest(`/reviews?mentor=${mentorId}`),
  
  getById: (id) => apiRequest(`/reviews/${id}`),
};

export default {
  auth: authAPI,
  user: userAPI,
  mentors: mentorAPI,
  skills: skillsAPI,
  sessions: sessionAPI,
  payments: paymentAPI,
  reviews: reviewAPI,
};
