'use client';

import React, { ReactNode, useState } from 'react';
import { Layout, theme, Breadcrumb, Button, Avatar, Dropdown, Badge } from 'antd';
import { BellOutlined, UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';
import StaffProtectedRoute from '../StaffProtectedRoute';
import Link from 'next/link';
import { useSidebar } from './StaffSidebar';

const { Header, Content } = Layout;

interface StaffLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  breadcrumbItems?: { title: React.ReactNode; href?: string }[];
}

const StaffLayout: React.FC<StaffLayoutProps> = ({
  children,
  title,
  subtitle,
  breadcrumbItems = []
}) => {
  const { user, logout } = useAuth();
  const { collapsed, toggleCollapsed } = useSidebar();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const breadcrumbItemsWithHome = [
    { title: 'Dashboard', href: '/staff/dashboard' },
    ...breadcrumbItems,
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link href="/staff/profile">Profile</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <span className="cursor-pointer">Logout</span>,
      onClick: () => logout(),
    }
  ];

  return (
    <Layout>
      <Header
        style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          height: '64px',
        }}
      >
        <div className="flex items-center">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            style={{ fontSize: '16px', width: 48, height: 48 }}
            className="mr-4"
          />
          <Breadcrumb items={breadcrumbItemsWithHome} />
        </div>
        <div className="flex items-center gap-4">
          <Badge count={3} size="small">
            <Button
              shape="circle"
              icon={<BellOutlined />}
              type="text"
            />
          </Badge>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" className="flex items-center">
              <Avatar icon={<UserOutlined />} />
              <span className="ml-2">{user?.firstName || 'User'} {user?.lastName || ''}</span>
            </Button>
          </Dropdown>
        </div>
      </Header>
      <Content
        style={{
          margin: '24px 16px',
          padding: 24,
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-red-600 font-medium mt-1">{subtitle}</p>}
        </div>
        {children}
      </Content>
    </Layout>
  );
};

export default StaffLayout; 