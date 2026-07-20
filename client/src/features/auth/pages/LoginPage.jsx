import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { loginSchema } from '../validation/authSchemas';
import Button from '../../../components/ui/Button';

// Mock authentication context hook (in real app, use useAuth from context)
// For UI building, we will simulate the behavior
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    try {
      await login(data);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Enter your credentials to access your account.">
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
          <input 
            type="email" 
            {...register("email")}
            className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="you@example.com"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <Link to="/forgot-password" className="text-xs font-semibold text-primary-600 hover:text-primary-700">Forgot password?</Link>
          </div>
          <input 
            type="password" 
            {...register("password")}
            className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="••••••••"
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <Button type="submit" variant="primary" className="w-full h-12 text-base mt-2" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account? <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">Create an account</Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
