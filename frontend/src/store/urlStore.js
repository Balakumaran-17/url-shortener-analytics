import { create } from 'zustand';
import api from '../services/api';

export const useUrlStore = create((set, get) => ({
  urls: [],
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  error: null,

  fetchUrlsAction: async ({ page = 1, limit = 10, search = '', status = '' } = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/urls', {
        params: { page, limit, search, status }
      });
      const { urls, totalCount, totalPages, currentPage } = response.data.data;
      set({
        urls,
        totalCount,
        totalPages,
        currentPage,
        isLoading: false
      });
      return urls;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  createUrlAction: async ({ longUrl, customAlias, expiresAt }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/urls', { longUrl, customAlias, expiresAt });
      const newUrl = response.data.data.url;
      set((state) => ({
        urls: [newUrl, ...state.urls],
        totalCount: state.totalCount + 1,
        isLoading: false
      }));
      return newUrl;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  updateUrlAction: async (id, { longUrl, expiresAt }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/urls/${id}`, { longUrl, expiresAt });
      const updatedUrl = response.data.data.url;
      set((state) => ({
        urls: state.urls.map((u) => (u._id === id ? updatedUrl : u)),
        isLoading: false
      }));
      return updatedUrl;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  deleteUrlAction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/urls/${id}`);
      set((state) => ({
        urls: state.urls.filter((u) => u._id !== id),
        totalCount: state.totalCount - 1,
        isLoading: false
      }));
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  }
}));
