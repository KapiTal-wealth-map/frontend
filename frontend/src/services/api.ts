import axios from 'axios';

// Create an axios instance with default config
console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
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

// Property types
export interface Property {
  id: string;
  address: string;
  zipCode: string;
  county: string;
  latitude: number;
  longitude: number;
  price: number;
  beds: number ;
  baths: number ;
  livingSpace: number ;
  zipCodePopulation: number ;
  zipCodeDensity: number ;
  medianHouseholdIncome: number ;
  sizeRank: number ;
  regionName: string ;
  zhvi: number[] ;
  marketValue: number[];
  owner?: Owner ;
}

export interface Owner {
  id: string;
  name: string ;
  netWorth: number ;
  occupation: string ;
  age: number ;
  email: string ;
  phone: string ;
  purchaseDate: string ; // ISO string
}


export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  minSize?: number;
  maxSize?: number;
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  county?: string;
  region?: string;
  zip?: string;
  minEstimatedValue?: number;
  maxEstimatedValue?: number;
  minMedianIncome?: number;
  maxMedianIncome?: number;
  page?: number;
  limit?: number;
}

// Property API calls
export const propertyAPI = {
  getAllProperties: async (page = 1, limit = 10): Promise<{ data: Property[]; total: number }> => {
    const response = await api.get(`/properties?page=${page}&limit=${limit}`);
    return { data: response.data.data, total: response.data.total };
  },

  getPropertyById: async (id: string): Promise<Property> => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  filterProperties: async (filters: PropertyFilters): Promise<Property[]> => {
    const response = await api.get('/properties/filter/search', { params: filters });
    return response.data;
  }
};

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
    logoUrl: string ;
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
    const response = await api.get('/users/notification-preferences');
    return response.data.notificationPreferences;
  },
  
  updatePreferences: async (preferences: any) => {
    const response = await api.put('/users/notification-preferences', { preferences });
    return response.data.notificationPreferences;
  }
};

// Favorite properties API calls
export const favoriteAPI = {
  addFavorite: async (propertyIds: string[]) => {
    const response = await api.post('/properties/favourite', { propertyIds });
    return { status: response.status, message: response.data.message };
  },
  removeFavorite: async (propertyIds: string[]) => {
    const response = await api.delete('/properties/favourite', { data: { propertyIds } });
    return { status: response.status, data: response.data };
  },
  getFavorites: async () => {
    const response = await api.get('/properties/get/favourite');
    return { status: response.status, data: response.data };
  },
}

// Save map view API calls
export const mapViewAPI = {
  saveMapView: async (viewData: any) => {
    const response = await api.post('/properties/map-view', viewData);
    return response.data;
  },
  
  getSavedMapViews: async () => {
    const response = await api.get('/properties/get/map-view');
    return response.data;
  },
  
  deleteSavedMapView: async (viewId: string) => {
    const response = await api.delete(`/properties/map-view/${viewId}`);
    return response.data;
  }
};

export default api;