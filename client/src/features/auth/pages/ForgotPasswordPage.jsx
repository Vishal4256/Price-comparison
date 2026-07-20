import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { forgotPasswordSchema } from '../validation/authSchemas';
import Button from '../../../components/ui/Button';
import { authAPI } from '../api/authAPI';

const ForgotPasswordPage = () => {
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await authAPI.forgotPassword(data.email);
      setStatus({ 
        type: 'success', 
        message: 'If an account with that email exists, we have sent a password reset link.' 
      });
    } catch (err) {
      // Don't leak if email exists or not in a real app, just show success message anyway, 
      // but for MVP we might show error if network fails
      setStatus({ 
        type: 'error', 
        message: 'Something went wrong. Please try again later.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your email and we'll send you a reset link.">
      
      {status.message && (
        <div className={`mb-6 p-4 rounded-xl text-sm border ${
          status.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400'
            : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400'
        }`}>
          {status.message}
        </div>
      )}

      {status.type !== 'success' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <Button type="submit" variant="primary" className="w-full h-12 text-base mt-4" disabled={isLoading}>
            {isLoading ? 'Sending Link...' : 'Send Reset Link'}
          </Button>
        </form>
      )}

      <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        Remember your password? <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">Back to login</Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
