// src/utils/api.js
import axios from 'axios';

// API Base URL - Configure based on environment
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const API_BASE_URL = 'https://yourlaundry.pythonanywhere.com/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Essential for CSRF cookies and session auth
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get CSRF token from cookie
 */
function getCSRFTokenFromCookie() {
  const name = 'csrftoken';
  let cookieValue = null;

  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

/**
 * Fetch CSRF token from Django backend
 */
export async function getCsrfToken() {
  try {
    await axios.get(`${API_BASE_URL.replace('/api', '')}/api/csrf/`, {
      withCredentials: true,
    });
    return getCSRFTokenFromCookie();
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    throw error;
  }
}

/**
 * Request Interceptor: Attach CSRF token to non-GET requests
 */
apiClient.interceptors.request.use(
  (config) => {
    // For non-GET requests, add CSRF token
    if (!['GET', 'HEAD', 'OPTIONS'].includes(config.method.toUpperCase())) {
      const csrfToken = getCSRFTokenFromCookie();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor: Handle common errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Handle 403 Forbidden - but don't retry infinitely
      if (error.response.status === 403) {
        // Don't retry, just redirect to login
        console.error('Authentication failed. Please login again.');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Endpoints
export const api = {
  // Authentication
  auth: {
    login: (credentials) => apiClient.post('/auth/login/', credentials),
    logout: () => apiClient.post('/auth/logout/'),
    register: (data) => apiClient.post('/register/', data),
    checkSession: () => apiClient.get('/staff/drivers/'), // Use any simple authenticated endpoint
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