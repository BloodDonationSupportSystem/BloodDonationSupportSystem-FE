'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Typography, Card, Alert, Spin, Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { LoginRequest } from '@/services/api/authService';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

const { Title, Paragraph } = Typography;

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('redirect') || '/';
  const { login, redirectBasedOnRole } = useAuth();
  
  const { control, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
    defaultValues: {
      userName: '',
      password: ''
    }
  });

  const onSubmit: SubmitHandler<LoginRequest> = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await login(data.userName, data.password);
      
      if (result.success) {
        toast.success('Login successful!');
        redirectBasedOnRole();
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        redirectBasedOnRole();
      }
    };
    
    checkAuth();
  }, [redirectBasedOnRole]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card className="shadow-md">
          <div className="text-center mb-8">
            <Title level={2} className="text-red-600">Login</Title>
            <Paragraph className="text-gray-500">
              Sign in to your Blood Donation account
            </Paragraph>
          </div>
          
          {error && (
            <Alert 
              message="Login Failed" 
              description={error} 
              type="error" 
              showIcon 
              className="mb-6" 
              closable 
              onClose={() => setError(null)}
            />
          )}
          
          <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
            <Form.Item 
              label="Username"
              validateStatus={errors.userName ? 'error' : ''}
              help={errors.userName?.message}
            >
              <Controller
                name="userName"
                control={control}
                rules={{ required: "Username is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Username"
                    size="large"
                  />
                )}
              />
            </Form.Item>
            
            <Form.Item 
              label="Password"
              validateStatus={errors.password ? 'error' : ''}
              help={errors.password?.message}
            >
              <Controller
                name="password"
                control={control}
                rules={{ required: "Password is required" }}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Password"
                    size="large"
                  />
                )}
              />
            </Form.Item>
            
            <div className="mt-6">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="w-full bg-red-600 hover:bg-red-700"
                size="large"
              >
                Sign In
              </Button>
            </div>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-red-600 hover:text-red-800">
                Register now
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Spin size="large" /></div>}>
      <LoginContent />
    </Suspense>
  );
} 