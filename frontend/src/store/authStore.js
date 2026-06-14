import { create } from 'zustand';
import api, { authApi } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  registerAction: async ({ username, email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { username, email, password });
      set({ isLoading: false });
      return response.data;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  loginAction: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data.data;
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false
      });
      return response.data;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  loadUserAction: async () => {
    if (!get().accessToken) return null;
    
    set({ isLoading: true });
    try {
      const response = await api.get('/auth/me');
      const { user } = response.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err) {
      // If error occurs, tokens are likely invalid, logout is handled by Axios interceptor
      set({ isLoading: false });
      return null;
    }
  },

  logoutAction: async () => {
    const accessToken = get().accessToken;
    if (accessToken) {
      try {
        // Request backend cleanup
        await api.post('/auth/logout');
      } catch (err) {
        // Silent catch in case server already cleaned session
      }
    }

    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      error: null
    });

    // Force full navigation to login page to avoid SPA rendering issues
    window.location.href = '/login';
  }
}));
