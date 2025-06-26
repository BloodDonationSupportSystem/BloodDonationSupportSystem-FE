'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Card, Alert, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useForm, SubmitHandler } from 'react-hook-form';
import { login, LoginRequest, saveAuthTokens, saveUserData } from '@/services/api/authService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const { Title, Paragraph } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();

  // Check for redirect path stored in session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPath = sessionStorage.getItem('redirectAfterLogin');
      if (storedPath) {
        setRedirectPath(storedPath);
      }
    }
  }, []);

  const onSubmit: SubmitHandler<LoginRequest> = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const response = await login(data);
      
      if (!response.success) {
        if (response.errors && response.errors.length > 0) {
          setError(response.errors.join(', '));
          toast.error(response.errors.join(', '));
        } else {
          setError(response.message || 'Login failed');
          toast.error(response.message || 'Login failed');
        }
        return;
      }

      // Save auth data
      const { accessToken, refreshToken, expiration, user } = response.data;
      saveAuthTokens(accessToken, refreshToken, expiration);
      saveUserData(user);
      
      toast.success('Login successful!');
      
      // Clear the stored redirect path
      if (typeof window !== 'undefined') {
        // Redirect to stored path or dashboard
        const redirectTo = redirectPath || '/';
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectTo);
      } else {
        router.push('/');
      }
    } catch (err) {
      const errorMessage = 'An error occurred during login. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center">
            <span className="text-4xl" role="img" aria-label="Blood Drop">🩸</span>
          </div>
          <Title level={2} className="mt-2">Sign in to your account</Title>
          <Paragraph className="text-gray-500">
            Welcome back! Please enter your credentials to continue.
          </Paragraph>
          {redirectPath && (
            <Alert
              message="Authentication Required"
              description="Please sign in to access the requested page."
              type="info"
              showIcon
              className="mb-4 mt-2"
            />
          )}
        </div>
        
        {error && (
          <Alert
            message="Login Error"
            description={error}
            type="error"
            showIcon
            className="mb-4"
          />
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <UserOutlined className="text-gray-400" />
              </span>
              <input
                id="userName"
                type="text"
                {...register("userName", { required: "Username is required" })}
                className={`w-full pl-10 py-2 border rounded-md focus:ring-red-500 focus:border-red-500 ${errors.userName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Username"
              />
            </div>
            {errors.userName && (
              <p className="mt-1 text-sm text-red-600">{errors.userName.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <LockOutlined className="text-gray-400" />
              </span>
              <input
                id="password"
                type="password"
                {...register("password", { required: "Password is required" })}
                className={`w-full pl-10 py-2 border rounded-md focus:ring-red-500 focus:border-red-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Password"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <Link href="/forgot-password" className="text-red-600 hover:text-red-500">
                Forgot your password?
              </Link>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {loading ? <Spin size="small" /> : 'Sign in'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-red-600 hover:text-red-500">
              Register now
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
} 