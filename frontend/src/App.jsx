import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import PublicStats from './pages/PublicStats';
import AdminDashboard from './pages/AdminDashboard';

// Stores
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';

// Components
import ErrorBoundary from './components/ErrorBoundary';

const AdminRoute = ({ children }) => {
  const { user } = useAuthStore();
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default function App() {
  const { initTheme, theme } = useThemeStore();
  const { loadUserAction, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Initial theme loading (applies light/dark root class)
    initTheme();
    
    // Auto restore session if tokens exist
    if (isAuthenticated) {
      loadUserAction();
    }
  }, [initTheme, loadUserAction, isAuthenticated]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        
        {/* Router Outlet Routing */}
        <Routes>
          
          {/* Public Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Main Dashboard routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/analytics/:id" element={<Analytics />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
          </Route>

          {/* Public Stats view */}
          <Route path="/stats/:shortCode" element={<PublicStats />} />

          {/* Catch-all root redirect routing */}
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

        {/* Global Toast configurations */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: theme === 'dark' ? '#18181b' : '#ffffff',
              color: theme === 'dark' ? '#fafafa' : '#18181b',
              border: `1px solid ${theme === 'dark' ? '#27272a' : '#e4e4e7'}`,
              fontFamily: 'Outfit, sans-serif',
              fontSize: '14px',
              borderRadius: '8px'
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff'
              }
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff'
              }
            }
          }}
        />

      </BrowserRouter>
    </ErrorBoundary>
  );
}
