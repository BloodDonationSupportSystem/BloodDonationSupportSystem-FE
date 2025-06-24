'use client';

import React, { useEffect } from 'react';
import { Typography, Card, Descriptions, Avatar, Spin, Button } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

export default function ProfilePage() {
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // If not logged in (and redirecting), don't render the profile content
  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <Title level={2}>My Profile</Title>
          <Paragraph className="text-gray-500">Manage your account details and preferences</Paragraph>
        </div>

        <Card className="shadow-md mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
            <Avatar size={100} icon={<UserOutlined />} className="flex-shrink-0" />
            <div className="flex-grow text-center md:text-left">
              <Title level={3} className="mb-1">{user.firstName} {user.lastName}</Title>
              <Paragraph className="text-gray-500 mb-1">@{user.userName}</Paragraph>
              <Paragraph>{user.email}</Paragraph>
              <div className="mt-4">
                <Button type="primary" icon={<EditOutlined />} className="bg-red-600 hover:bg-red-700">
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>

          <Descriptions
            title="User Information"
            bordered
            column={{ xs: 1, sm: 1, md: 2 }}
            className="mt-4"
          >
            <Descriptions.Item label="User ID">{user.id}</Descriptions.Item>
            <Descriptions.Item label="Username">{user.userName}</Descriptions.Item>
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Phone Number">{user.phoneNumber}</Descriptions.Item>
            <Descriptions.Item label="First Name">{user.firstName}</Descriptions.Item>
            <Descriptions.Item label="Last Name">{user.lastName}</Descriptions.Item>
            <Descriptions.Item label="Role">{user.roleName}</Descriptions.Item>
            <Descriptions.Item label="Last Login">{new Date(user.lastLogin).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Email Verified">{user.isEmailVerified ? 'Yes' : 'No'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <div className="text-center">
          <Link href="/">
            <Button type="default">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 