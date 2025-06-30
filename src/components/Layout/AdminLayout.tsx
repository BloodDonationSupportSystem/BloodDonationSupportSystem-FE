'use client';

import React, { ReactNode } from 'react';
import { Layout, theme, Breadcrumb, Button, Avatar, Dropdown, Badge } from 'antd';
import { BellOutlined, UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import AdminProtectedRoute from '../AdminProtectedRoute';
import Link from 'next/link';

const { Header, Content } = Layout;

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumbItems?: { title: React.ReactNode; href?: string }[];
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title,
  breadcrumbItems = []
}) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const breadcrumbItemsWithHome = [
    { title: <Link href="/admin">Dashboard</Link>, href: '/admin' },
    ...breadcrumbItems,
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <span className="cursor-pointer">Logout</span>,
      onClick: () => logout(),
    }
  ];

  return (
    <AdminProtectedRoute>
      <Layout style={{ minHeight: '100vh' }}>
        <AdminSidebar />
        <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin 0.2s' }}>
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
            }}
          >
            <div className="flex items-center">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '16px', width: 64, height: 64 }}
              />
              <Breadcrumb items={breadcrumbItemsWithHome} />
            </div>
            <div className="flex items-center gap-4">
              <Badge count={5} size="small">
                <Button
                  shape="circle"
                  icon={<BellOutlined />}
                  type="text"
                />
              </Badge>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Button type="text" className="flex items-center">
                  <Avatar icon={<UserOutlined />} />
                  <span className="ml-2">{user?.firstName} {user?.lastName}</span>
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
            </div>
            {children}
          </Content>
        </Layout>
      </Layout>
    </AdminProtectedRoute>
  );
};

export default AdminLayout; 