import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

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

const unwrapResponseData = <T = any>(response: AxiosResponse): T => {
  const payload = (response && (response.data as any)) ?? undefined;
  return ((payload && (payload.data ?? payload)) as unknown) as T;
};

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
  getAll: <T = any>(page = 1, limit = 20): Promise<T> =>
    api.get('/links', { params: { page, limit } }).then((r) => unwrapResponseData<T>(r)),
  getOne: <T = any>(id: string): Promise<T> => api.get(`/links/${id}`).then((r) => unwrapResponseData<T>(r)),
  create: <T = any>(data: { originalUrl: string; customSlug?: string; title?: string }): Promise<T> =>
    api.post('/links', data).then((r) => unwrapResponseData<T>(r)),
  update: <T = any>(id: string, data: { originalUrl?: string; title?: string }): Promise<T> =>
    api.put(`/links/${id}`, data).then((r) => unwrapResponseData<T>(r)),
  delete: <T = any>(id: string): Promise<T> => api.delete(`/links/${id}`).then((r) => unwrapResponseData<T>(r)),
  getAnalytics: <T = any>(id: string, days = 30): Promise<T> =>
    api.get(`/links/${id}/analytics`, { params: { days } }).then((r) => unwrapResponseData<T>(r)),
};

// QR Codes API
export const qrCodesApi = {
  getAll: <T = any>(): Promise<T> => api.get('/qrcodes').then((r) => unwrapResponseData<T>(r)),
  getOne: <T = any>(id: string): Promise<T> => api.get(`/qrcodes/${id}`).then((r) => unwrapResponseData<T>(r)),
  create: <T = any>(data: { data: string; linkId?: string; fgColor?: string; bgColor?: string }): Promise<T> =>
    api.post('/qrcodes', data).then((r) => unwrapResponseData<T>(r)),
  update: <T = any>(id: string, data: { fgColor?: string; bgColor?: string }): Promise<T> =>
    api.put(`/qrcodes/${id}`, data).then((r) => unwrapResponseData<T>(r)),
  delete: <T = any>(id: string): Promise<T> => api.delete(`/qrcodes/${id}`).then((r) => unwrapResponseData<T>(r)),
};

// Auth API
export const authApi = {
  signup: <T = any>(data: { email: string; name: string; password: string }): Promise<T> =>
    api.post('/auth/signup', data).then((r) => unwrapResponseData<T>(r)),
  login: <T = any>(data: { email: string; password: string }): Promise<T> =>
    api.post('/auth/login', data).then((r) => unwrapResponseData<T>(r)),
  refresh: <T = any>(refreshToken: string): Promise<T> =>
    api.post('/auth/refresh', { refreshToken }).then((r) => unwrapResponseData<T>(r)),
  logout: <T = any>(): Promise<T> => api.post('/auth/logout', {}).then((r) => unwrapResponseData<T>(r)),
};

// User API
export const userApi = {
  getProfile: <T = any>(): Promise<T> => api.get('/users/profile').then((r) => unwrapResponseData<T>(r)),
  updateProfile: <T = any>(data: { name?: string; email?: string }): Promise<T> =>
    api.put('/users/profile', data).then((r) => unwrapResponseData<T>(r)),
};

// Events API (if needed)
export const eventsApi = {
  getAll: <T = any>(page = 1, limit = 20): Promise<T> =>
    api.get('/events', { params: { page, limit } }).then((r) => unwrapResponseData<T>(r)),
  getOne: <T = any>(id: string): Promise<T> => api.get(`/events/${id}`).then((r) => unwrapResponseData<T>(r)),
  create: <T = any>(data: any): Promise<T> => api.post('/events', data).then((r) => unwrapResponseData<T>(r)),
  update: <T = any>(id: string, data: any): Promise<T> => api.put(`/events/${id}`, data).then((r) => unwrapResponseData<T>(r)),
  delete: <T = any>(id: string): Promise<T> => api.delete(`/events/${id}`).then((r) => unwrapResponseData<T>(r)),
};

// Payments API
export const paymentsApi = {
  initializePayment: <T = any>(planTier: string, billingCycle?: string): Promise<T> =>
    api.post('/payments/initialize', { planTier, billingCycle }).then((r) => unwrapResponseData<T>(r)),
  verifyPayment: <T = any>(reference: string): Promise<T> =>
    api.post('/payments/verify', { reference }).then((r) => unwrapResponseData<T>(r)),
  getPaymentHistory: <T = any>(limit = 10): Promise<T> =>
    api.get('/payments/history', { params: { limit } }).then((r) => unwrapResponseData<T>(r)),
  checkFeatureAccess: <T = any>(feature: string): Promise<T> =>
    api.get(`/payments/feature-check/${feature}`).then((r) => unwrapResponseData<T>(r)),
};

// Subscriptions API
export const subscriptionsApi = {
  getCurrent: <T = any>(): Promise<T> => api.get('/subscriptions/current').then((r) => unwrapResponseData<T>(r)),
  getRenewalDate: <T = any>(): Promise<T> => api.get('/subscriptions/renewal-date').then((r) => unwrapResponseData<T>(r)),
  getHistory: <T = any>(): Promise<T> => api.get('/subscriptions/history').then((r) => unwrapResponseData<T>(r)),
  cancel: <T = any>(reason?: string): Promise<T> => api.post('/subscriptions/cancel', { reason }).then((r) => unwrapResponseData<T>(r)),
  upgrade: <T = any>(newPlanTier: string): Promise<T> => api.post('/subscriptions/upgrade', { newPlanTier }).then((r) => unwrapResponseData<T>(r)),
};

export default api;
