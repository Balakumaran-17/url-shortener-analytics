import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function Login() {
  const { loginAction, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await loginAction(formData);
      toast.success(result.message || 'Logged in successfully!');
      navigate('/dashboard');
    } catch (err) {
      // Check validation error details from API response
      if (err.details) {
        setFieldErrors(err.details);
      }
      toast.error(err.message || 'Login failed. Please verify credentials.');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Sign in to your account</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Enter your email and password to access the platform
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              disabled={isLoading}
              className={`block w-full pl-10 pr-3 py-2.5 text-sm bg-card-light/40 dark:bg-card-dark/40 border ${
                fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-border-light dark:border-border-dark focus:ring-indigo-500'
              } rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 transition-all`}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-xs text-red-500 font-medium">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Password</label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isLoading}
              className={`block w-full pl-10 pr-3 py-2.5 text-sm bg-card-light/40 dark:bg-card-dark/40 border ${
                fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-border-light dark:border-border-dark focus:ring-indigo-500'
              } rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 transition-all`}
            />
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-red-500 font-medium">{fieldErrors.password}</p>
          )}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-600/20 active:scale-[0.99] transition-all"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span>Sign In</span>
          )}
        </button>

      </form>

      {/* Alternative Redirect */}
      <div className="text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>

    </div>
  );
}
