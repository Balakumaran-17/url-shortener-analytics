import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Create central API service instance
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Send cookies (for refresh token)
});

// Separate instance for auth refreshes to prevent interceptor loop
const authApi = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Seamless Token Rotation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const storedRefreshToken = useAuthStore.getState().refreshToken;
        
        // Trigger token rotation endpoint
        const response = await authApi.post('/auth/refresh', {
          refreshToken: storedRefreshToken
        });
        
        if (response.data?.success) {
          const { accessToken, refreshToken } = response.data.data;
          
          // Update Zustand store
          useAuthStore.getState().setTokens(accessToken, refreshToken);
          
          // Re-attach token and replay the original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token is expired or revoked -> Force logout
        console.warn('Refresh session expired. Logging out.');
        useAuthStore.getState().logoutAction();
      }
    }
    
    // Format error message for easier catch handlers
    const errMessage = error.response?.data?.message || 'Something went wrong';
    const errObj = new Error(errMessage);
    errObj.status = error.response?.status || 500;
    errObj.details = error.response?.data?.error || {};
    
    return Promise.reject(errObj);
  }
);

export default api;
export { authApi };
