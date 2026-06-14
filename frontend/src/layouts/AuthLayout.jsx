import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-background-light dark:bg-background-dark p-4 overflow-hidden">
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />

      {/* Main Form Box */}
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-indigo-500"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            <span>BK</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-widest">URL Shortener & Analytics</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-2xl">
          <Outlet />
        </div>
      </div>

    </div>
  );
}
