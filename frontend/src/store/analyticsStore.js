import { create } from 'zustand';
import api from '../services/api';

export const useAnalyticsStore = create((set) => ({
  dashboardSummary: null,
  urlAnalytics: null,
  publicStats: null,
  isLoading: false,
  error: null,

  fetchDashboardSummaryAction: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/analytics/dashboard');
      const summary = response.data.data;
      set({ dashboardSummary: summary, isLoading: false });
      return summary;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  fetchUrlAnalyticsAction: async (id, { page = 1, limit = 10 } = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/analytics/url/${id}`, {
        params: { page, limit }
      });
      const details = response.data.data;
      set({ urlAnalytics: details, isLoading: false });
      return details;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  fetchPublicStatsAction: async (shortCode) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/analytics/public/${shortCode}`);
      const stats = response.data.data;
      set({ publicStats: stats, isLoading: false });
      return stats;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  }
}));
