import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (expired token)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (companyName: string, email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { companyName, email, password, name });
    return response.data;
  },
  
  verifyMFA: async (email: string, code: string) => {
    const response = await api.post('/auth/verify-mfa', { email, code });
    return response.data;
  },
  
  setupMFA: async () => {
    const response = await api.get('/auth/setup-mfa');
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

// User management API calls
export const userAPI = {
  inviteUser: async (email: string, role: string) => {
    const response = await api.post('/users/invite', { email, role });
    return response.data;
  },
  
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  updateUserRole: async (userId: string, role: string) => {
    const response = await api.put(`/users/${userId}/role`, { role });
    return response.data;
  }
};

// Notification preferences API calls
export const notificationAPI = {
  getPreferences: async () => {
    const response = await api.get('/notifications/preferences');
    return response.data;
  },
  
  updatePreferences: async (preferences: any) => {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
  }
};

export default api;