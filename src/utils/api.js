// src/utils/api.js - JWT Version (MUCH SIMPLER!)

import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const API_BASE_URL ='https://yourlaundry.pythonanywhere.com/api'
// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export const tokenManager = {
  getAccessToken: () => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
  setTokens: (access, refresh) => {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// Request Interceptor: Attach JWT token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenManager.getRefreshToken();

      if (!refreshToken) {
        tokenManager.clearTokens();
        // Don't redirect here - let React Router handle it
        return Promise.reject(error);
      }
      try {
        // Try to refresh the token
        const response = await axios.post(
          `${API_BASE_URL.replace('/api', '')}/api/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        tokenManager.setTokens(access, refreshToken);
        
        // Update authorization header
        apiClient.defaults.headers.common.Authorization = `Bearer ${access}`;
        originalRequest.headers.Authorization = `Bearer ${access}`;

        processQueue(null, access);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        tokenManager.clearTokens();
        // Don't redirect here - let React Router handle it
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Endpoints
export const api = {
  // Authentication
  auth: {
    login: async (credentials) => {
      const response = await apiClient.post('/auth/login/', credentials);
      const { tokens } = response.data;
      tokenManager.setTokens(tokens.access, tokens.refresh);
      return response;
    },
    logout: async () => {
      const refresh = tokenManager.getRefreshToken();
      try {
        await apiClient.post('/auth/logout/', { refresh });
      } finally {
        tokenManager.clearTokens();
      }
    },
    register: async (data) => {
      const response = await apiClient.post('/auth/register/', data);
      const { tokens } = response.data;
      tokenManager.setTokens(tokens.access, tokens.refresh);
      return response;
    },
    checkAuth: () => {
      return !!tokenManager.getAccessToken();
    },
  },

  // Clients
  clients: {
    list: (params) => apiClient.get('/clients/', { params }),
    create: (data) => apiClient.post('/clients/', data),
    get: (id) => apiClient.get(`/clients/${id}/`),
    update: (id, data) => apiClient.put(`/clients/${id}/`, data),
    delete: (id) => apiClient.delete(`/clients/${id}/`),
    orders: (id) => apiClient.get(`/clients/${id}/orders/`),
  },

  // Services
  services: {
    list: (params) => apiClient.get('/services/', { params }),
    create: (data) => apiClient.post('/services/', data),
    get: (id) => apiClient.get(`/services/${id}/`),
    update: (id, data) => apiClient.put(`/services/${id}/`, data),
    delete: (id) => apiClient.delete(`/services/${id}/`),
  },

  // Orders
  orders: {
    list: (params) => apiClient.get('/orders/', { params }),
    create: (data) => apiClient.post('/orders/', data),
    get: (id) => apiClient.get(`/orders/${id}/`),
    update: (id, data) => apiClient.put(`/orders/${id}/`, data),
    updateStatus: (id, status) => apiClient.patch(`/orders/${id}/update_status/`, { status }),
    recalculate: (id) => apiClient.post(`/orders/${id}/recalculate_total/`),
    outstandingDemands: () => apiClient.get('/orders/outstanding_demands/'),
    salesReport: (params) => apiClient.get('/orders/sales_report/', { params }),
  },

  // Payments
  payments: {
    list: (params) => apiClient.get('/payments/', { params }),
    create: (data) => apiClient.post('/payments/', data),
    get: (id) => apiClient.get(`/payments/${id}/`),
    recent: () => apiClient.get('/payments/recent/'),
  },

  // Inventory
  inventory: {
    list: (params) => apiClient.get('/inventory/', { params }),
    create: (data) => apiClient.post('/inventory/', data),
    get: (id) => apiClient.get(`/inventory/${id}/`),
    update: (id, data) => apiClient.put(`/inventory/${id}/`, data),
    delete: (id) => apiClient.delete(`/inventory/${id}/`),
    lowStock: () => apiClient.get('/inventory/low_stock/'),
    restock: (id, quantity) => apiClient.post(`/inventory/${id}/restock/`, { quantity }),
    consume: (id, quantity) => apiClient.post(`/inventory/${id}/consume/`, { quantity }),
  },

  // Staff
  staff: {
    list: (params) => apiClient.get('/staff/', { params }),
    drivers: () => apiClient.get('/staff/drivers/'),
  },
};

export default apiClient;