'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, Row, Col, Alert, notification } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, UserAddOutlined } from '@ant-design/icons';
import { register, RegisterRequest } from '@/services/api/authService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onFinish = async (values: RegisterRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await register(values);
      
      if (!response.success) {
        if (response.errors && response.errors.length > 0) {
          setError(response.errors.join(', '));
        } else {
          setError(response.message || 'Registration failed');
        }
        return;
      }

      // Success
      notification.success({
        message: 'Registration Successful',
        description: 'Your account has been created successfully. You can now log in.',
        duration: 5,
      });
      
      // Redirect to login page
      router.push('/login');
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
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
          <Title level={2} className="mt-2 mb-0">Create a new account</Title>
          <Paragraph className="text-gray-500">Join our community and start saving lives</Paragraph>
        </div>

        <Card className="shadow-md">
          {error && (
            <Alert 
              message="Registration Error" 
              description={error} 
              type="error" 
              showIcon 
              closable 
              className="mb-4"
            />
          )}

          <Form
            name="register"
            layout="vertical"
            onFinish={onFinish}
            scrollToFirstError
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[
                    { required: true, message: 'Please input your first name!' },
                    { min: 2, message: 'First name must be at least 2 characters' }
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="First Name" />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12}>
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[
                    { required: true, message: 'Please input your last name!' },
                    { min: 2, message: 'Last name must be at least 2 characters' }
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Last Name" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="userName"
              label="Username"
              rules={[
                { required: true, message: 'Please input your username!' },
                { min: 3, message: 'Username must be at least 3 characters' }
              ]}
            >
              <Input prefix={<UserAddOutlined />} placeholder="Username" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email address!' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              label="Phone Number"
              rules={[
                { required: true, message: 'Please input your phone number!' },
                { pattern: /^[0-9]{10,15}$/, message: 'Please enter a valid phone number!' }
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
              hasFeedback
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="w-full bg-red-600 hover:bg-red-700" 
                loading={loading}
                size="large"
              >
                Register
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-4">
            <span className="text-gray-600">Already have an account?</span>
            <Link href="/login" className="ml-1 text-red-600 hover:text-red-700">
              Log in
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