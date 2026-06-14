import { create } from 'zustand';
import api from '../services/api';

const useAdminStore = create((set) => ({
  stats: null,
  users: [],
  urls: [],
  totalUsers: 0,
  totalUrls: 0,
  usersPage: 1,
  urlsPage: 1,
  usersTotalPages: 1,
  urlsTotalPages: 1,
  isLoading: false,
  error: null,

  fetchStatsAction: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/admin/stats');
      set({ stats: response.data.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  fetchUsersAction: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/admin/users', { params: { page, limit } });
      const { users, totalCount, totalPages, currentPage } = response.data.data;
      set({ 
        users, 
        totalUsers: totalCount, 
        usersTotalPages: totalPages, 
        usersPage: currentPage, 
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  fetchUrlsAction: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/admin/urls', { params: { page, limit } });
      const { urls, totalCount, totalPages, currentPage } = response.data.data;
      set({ 
        urls, 
        totalUrls: totalCount, 
        urlsTotalPages: totalPages, 
        urlsPage: currentPage, 
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  deleteUrlAction: async (urlId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/admin/urls/${urlId}`);
      // Refresh urls list optimistic update
      set((state) => ({
        urls: state.urls.filter((url) => url._id !== urlId),
        totalUrls: state.totalUrls - 1,
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  }
}));

export default useAdminStore;
