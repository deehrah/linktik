import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Create axios instance with base configuration
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: Add authentication token to all requests
 */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle errors and token refresh
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 Unauthorized - token might be expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (!refreshToken) {
            // No refresh token, redirect to login
            localStorage.clear();
            window.location.href = '/login';
            return Promise.reject(error);
          }

          // Attempt to refresh token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { data } = response;
          
          if (data.data?.accessToken) {
            // Store new tokens
            localStorage.setItem('accessToken', data.data.accessToken);
            if (data.data.refreshToken) {
              localStorage.setItem('refreshToken', data.data.refreshToken);
            }

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.clear();
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other error responses
    if (error.response) {
      const errorData = error.response.data as any;
      const errorMessage = errorData?.error?.message || 'An error occurred';
      
      // Create user-friendly error
      const customError = new Error(errorMessage);
      (customError as any).status = error.response.status;
      (customError as any).code = errorData?.error?.code;
      
      return Promise.reject(customError);
    }

    // Handle network errors
    if (error.request && !error.response) {
      const networkError = new Error('Network error. Please check your connection.');
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    }

    return Promise.reject(error);
  }
);

// ============== API ENDPOINTS ==============

// Links API
export const linksApi = {
  getAll: (page = 1, limit = 20) =>
    api.get('/links', { params: { page, limit } }).then((r) => r.data),
  getOne: (id: string) => api.get(`/links/${id}`).then((r) => r.data),
  create: (data: { originalUrl: string; customSlug?: string; title?: string }) =>
    api.post('/links', data).then((r) => r.data),
  update: (id: string, data: { originalUrl?: string; title?: string }) =>
    api.put(`/links/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/links/${id}`).then((r) => r.data),
  getAnalytics: (id: string, days = 30) =>
    api.get(`/links/${id}/analytics`, { params: { days } }).then((r) => r.data),
};

// QR Codes API
export const qrCodesApi = {
  getAll: () => api.get('/qrcodes').then((r) => r.data),
  getOne: (id: string) => api.get(`/qrcodes/${id}`).then((r) => r.data),
  create: (data: { data: string; linkId?: string; fgColor?: string; bgColor?: string }) =>
    api.post('/qrcodes', data).then((r) => r.data),
  update: (id: string, data: { fgColor?: string; bgColor?: string }) =>
    api.put(`/qrcodes/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/qrcodes/${id}`).then((r) => r.data),
};

// Auth API
export const authApi = {
  signup: (data: { email: string; name: string; password: string }) =>
    api.post('/auth/signup', data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then((r) => r.data),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }).then((r) => r.data),
  logout: () => api.post('/auth/logout', {}).then((r) => r.data),
};

// User API
export const userApi = {
  getProfile: () => api.get('/users/profile').then((r) => r.data),
  updateProfile: (data: { name?: string; email?: string }) =>
    api.put('/users/profile', data).then((r) => r.data),
};

// Events API (if needed)
export const eventsApi = {
  getAll: (page = 1, limit = 20) =>
    api.get('/events', { params: { page, limit } }).then((r) => r.data),
  getOne: (id: string) => api.get(`/events/${id}`).then((r) => r.data),
  create: (data: any) => api.post('/events', data).then((r) => r.data),
  update: (id: string, data: any) => api.put(`/events/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/events/${id}`).then((r) => r.data),
};

// Payments API
export const paymentsApi = {
  initializePayment: (planTier: string, billingCycle?: string) =>
    api.post('/payments/initialize', { planTier, billingCycle }).then((r) => r.data),
  verifyPayment: (reference: string) =>
    api.post('/payments/verify', { reference }).then((r) => r.data),
  getPaymentHistory: (limit = 10) =>
    api.get('/payments/history', { params: { limit } }).then((r) => r.data),
  checkFeatureAccess: (feature: string) =>
    api.get(`/payments/feature-check/${feature}`).then((r) => r.data),
};

// Subscriptions API
export const subscriptionsApi = {
  getCurrent: () =>
    api.get('/subscriptions/current').then((r) => r.data),
  getRenewalDate: () =>
    api.get('/subscriptions/renewal-date').then((r) => r.data),
  getHistory: () =>
    api.get('/subscriptions/history').then((r) => r.data),
  cancel: (reason?: string) =>
    api.post('/subscriptions/cancel', { reason }).then((r) => r.data),
  upgrade: (newPlanTier: string) =>
    api.post('/subscriptions/upgrade', { newPlanTier }).then((r) => r.data),
};

export default api;
