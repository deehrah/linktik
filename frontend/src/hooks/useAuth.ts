import { create } from 'zustand';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  planTier: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  signup: (email: string, name: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setAccessToken: (token: string) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const responseError = error.response?.data?.error;

    if (typeof responseError === 'string') {
      return responseError;
    }

    if (responseError && typeof responseError === 'object') {
      const typedError = responseError as { message?: string };
      return typedError.message || fallback;
    }

    const responseMessage = error.response?.data?.message;
    if (typeof responseMessage === 'string') {
      return responseMessage;
    }
  }

  return fallback;
};

const getAuthData = (response: any) => response?.data?.data ?? response?.data;

export const useAuth = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,

  signup: async (email: string, name: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        email,
        name,
        password,
      });
      const authData = getAuthData(response);

      set({
        user: authData.user,
        accessToken: authData.accessToken,
        isLoading: false,
      });

      // Store tokens in localStorage
      localStorage.setItem('accessToken', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);
    } catch (error: any) {
      const message = getErrorMessage(error, 'Signup failed');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      const authData = getAuthData(response);

      set({
        user: authData.user,
        accessToken: authData.accessToken,
        isLoading: false,
      });

      // Store tokens in localStorage
      localStorage.setItem('accessToken', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);
    } catch (error: any) {
      const message = getErrorMessage(error, 'Login failed');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({
      user: null,
      accessToken: null,
    });

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  setAccessToken: (token: string) => {
    set({ accessToken: token });
  },
}));

// Configure axios to include auth header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh on 401
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (
      error.response?.status === 401 &&
      !config._retry &&
      config.url !== `${API_BASE_URL}/auth/login`
    ) {
      config._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        const authData = getAuthData(response);

        localStorage.setItem('accessToken', authData.accessToken);
        config.headers.Authorization = `Bearer ${authData.accessToken}`;

        return axios(config);
      } catch (err) {
        // Refresh failed, logout user
        const { logout } = useAuth.getState();
        logout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);
