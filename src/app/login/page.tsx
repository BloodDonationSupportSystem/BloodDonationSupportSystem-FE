'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, Alert, Checkbox, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login, LoginRequest, saveAuthTokens, saveUserData } from '@/services/api/authService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await login(values);
      
      if (!response.success) {
        if (response.errors && response.errors.length > 0) {
          setError(response.errors.join(', '));
        } else {
          setError(response.message || 'Login failed');
        }
        return;
      }

      // Save auth data
      const { accessToken, refreshToken, expiration, user } = response.data;
      saveAuthTokens(accessToken, refreshToken, expiration);
      saveUserData(user);
      
      // Redirect to dashboard or home
      router.push('/');
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-6">
          <Link href="/" className="flex items-center justify-center mb-4">
            <span className="text-3xl mr-2" role="img" aria-label="Blood Drop">🩸</span>
            <Title level={3} className="m-0 text-red-600">Blood Donation</Title>
          </Link>
          <Title level={2} className="mt-2 mb-0">Log in to your account</Title>
          <Paragraph className="text-gray-500">Welcome back! Please enter your credentials</Paragraph>
        </div>

        <Card className="shadow-md">
          {error && (
            <Alert 
              message="Login Error" 
              description={error} 
              type="error" 
              showIcon 
              closable 
              className="mb-4"
            />
          )}

          <Form
            name="login"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
              name="userName"
              label="Username"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Password" 
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <div className="flex justify-between items-center">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>

                <Link href="/forgot-password" className="text-red-600 hover:text-red-700">
                  Forgot password?
                </Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="w-full bg-red-600 hover:bg-red-700" 
                loading={loading}
                size="large"
              >
                Log in
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-4">
            <span className="text-gray-600">Don't have an account?</span>
            <Link href="/register" className="ml-1 text-red-600 hover:text-red-700">
              Register now
            </Link>
          </div>
        </Card>

        <div className="text-center mt-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
} 