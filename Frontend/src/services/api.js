const API_URL = 'http://localhost:4000/api';

// Helper function to handle API requests
const apiRequest = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fullUrl = `${API_URL}${endpoint}`;
  console.log(`API Request: ${options.method || 'GET'} ${fullUrl}`, options.body);

  try {
    const fetchOptions = {
      ...options,
      headers,
      credentials: 'include',
      mode: 'cors'
    };

    // Only add body if it's not a GET or HEAD request
    if (options.body && !['GET', 'HEAD'].includes(options.method || 'GET')) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    console.log('Fetch options:', fetchOptions);
    const response = await fetch(fullUrl, fetchOptions);

    console.log('Response status:', response.status, response.statusText);
    
    // First, read the response as text to handle non-JSON responses
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

// Auth API
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

// User API
export const userAPI = {
  getProfile: () => apiRequest('/user/profile'),
  updateProfile: (data) => 
    apiRequest('/user/profile', {
      method: 'PUT',
      body: data
    }),
};

// Skills API
export const skillsAPI = {
  getAll: () => apiRequest('/skills'),
  getById: (id) => apiRequest(`/skills/${id}`),
  create: (data) => 
    apiRequest('/skills', {
      method: 'POST',
      body: data,
    }),
  update: (id, data) =>
    apiRequest(`/skills/${id}`, {
      method: 'PUT',
      body: data,
    }),
  delete: (id) =>
    apiRequest(`/skills/${id}`, {
      method: 'DELETE',
    }),
};

export default {
  auth: authAPI,
  user: userAPI,
  skills: skillsAPI,
};
