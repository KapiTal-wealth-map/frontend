import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
  
  registerWithLogo: async (formData: FormData) => {
    // Extract file from formData to upload separately to Supabase
    const logoFile = formData.get('logo') as File;
    
    // Create a new formData without the logo for the regular registration
    const apiFormData = new FormData();
    apiFormData.append('companyName', formData.get('companyName') as string);
    apiFormData.append('email', formData.get('email') as string);
    apiFormData.append('password', formData.get('password') as string);
    apiFormData.append('name', formData.get('name') as string);
    
    // If there's a logo, add a placeholder for now
    if (logoFile) {
      apiFormData.append('logoUrl', ''); // Will be updated later
    }
    
    const response = await api.post('/auth/register', apiFormData);
    
    // If registration successful and we have a logo, upload it to Supabase
    if (response.data.success && logoFile) {
      // Update the company with the logo URL after uploading to Supabase
      // This would normally be done in the backend, but since we're using Supabase directly from frontend
      // we'll handle it here
      const companyId = response.data.company?.id;
      if (companyId) {
        // Upload would be implemented with Supabase API
        // and then we'd update the company record with the URL
      }
    }
    
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
  
  sendEmailOTP: async (email: string) => {
    const response = await api.post('/auth/send-email-otp', { email });
    return response.data;
  },
  
  verifyEmailOTP: async (email: string, otp: string) => {
    const response = await api.post('/auth/verify-email-otp', { email, otp });
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
  },
  
  acceptInvite: async (token: string, name: string, password: string) => {
    const response = await api.post('/users/accept-invite', { token, name, password });
    return response.data;
  },
  
  updateProfile: async (profileData: any) => {
    const response = await api.patch('/users/me', profileData);
    return response.data;
  },
  
  deactivateUser: async (userId: string) => {
    const response = await api.patch(`/users/${userId}`, { status: 'inactive' });
    return response.data;
  },
  
  getCompanySettings: async () => {
    const response = await api.get('/users/company-settings');
    return response.data;
  },
  
  updateCompanySettings: async (data: {
    name: string;
    logoUrl: string | null;
    dataAccessSettings: any;
  }) => {
    const response = await api.put('/users/company-settings', data);
    return response.data;
  },
  
  getActivityLogs: async (queryParams: string = '') => {
    const response = await api.get(`/users/activity-logs${queryParams ? `?${queryParams}` : ''}`);
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