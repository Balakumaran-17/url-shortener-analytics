import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { 
  LayoutDashboard, 
  BarChart3, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  User as UserIcon,
  Link as LinkIcon,
  Shield
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, isAuthenticated, logoutAction } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Auto-close sidebar on mobile when path changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 }
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin Control', path: '/admin', icon: Shield });
  }

  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark text-zinc-900 dark:text-zinc-50 font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-border-light dark:border-border-dark flex flex-col transition-transform duration-300 transform md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static`}>
        
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border-light dark:border-border-dark justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <LinkIcon className="w-4 h-4" />
            </div>
            <span className="font-bold tracking-tight text-zinc-900 dark:text-zinc-100">BK</span>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-border-light dark:border-border-dark space-y-4">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-border-light dark:border-border-dark flex items-center justify-center text-zinc-600 dark:text-zinc-300">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-zinc-800 dark:text-zinc-200">
                {user?.username || 'User Account'}
              </p>
              <p className="text-xs truncate text-zinc-400 dark:text-zinc-500">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          <button
            onClick={logoutAction}
            className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Header Navbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border-light dark:border-border-dark glass-nav sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden"
            >
              <Menu className="w-5 h-5 text-zinc-500" />
            </button>
            <h1 className="text-md font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
              {location.pathname.startsWith('/analytics') ? 'Analytics Details' : 
               location.pathname.startsWith('/admin') ? 'Admin Panel' : 'Dashboard Summary'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Dark Mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 border border-border-light dark:border-border-dark rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
              title="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-indigo-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-500" />
              )}
            </button>

            {/* Profile Pill */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 border border-border-light dark:border-border-dark rounded-lg bg-card-light dark:bg-card-dark">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Live Workspace</span>
            </div>
          </div>
        </header>

        {/* Dynamic page container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
