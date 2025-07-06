'use client';

import React, { useState, createContext, useContext } from 'react';
import { Layout, Menu, Button, theme, Typography } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  SettingOutlined,
  FileTextOutlined,
  TeamOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  EnvironmentOutlined,
  NotificationOutlined,
  HeartOutlined,
  LogoutOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const { Sider } = Layout;
const { Title } = Typography;

// Create a context for the sidebar collapsed state
export const AdminSidebarContext = createContext({
  collapsed: false,
  setCollapsed: (collapsed: boolean) => { },
  toggleCollapsed: () => { }
});

// Custom hook to use the sidebar context
export const useAdminSidebar = () => useContext(AdminSidebarContext);

// Sidebar Provider component
export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <AdminSidebarContext.Provider value={{ collapsed, setCollapsed, toggleCollapsed }}>
      {children}
    </AdminSidebarContext.Provider>
  );
}

export default function AdminSidebar() {
  const { collapsed, setCollapsed } = useAdminSidebar();
  const pathname = usePathname();
  const { logout } = useAuth();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // Get active menu key based on current path
  const getSelectedKey = () => {
    const path = pathname || '';
    if (path === '/admin' || path === '/admin/dashboard') return 'dashboard';
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/staffs')) return 'staffs';
    if (path.includes('/admin/appointments')) return 'appointments';
    if (path.includes('/admin/locations')) return 'locations';
    if (path.includes('/admin/blood-drives')) return 'blood-drives';
    if (path.includes('/admin/reports')) return 'reports';
    if (path.includes('/admin/blog')) return 'blog';
    if (path.includes('/admin/notifications')) return 'notifications';
    if (path.includes('/admin/settings')) return 'settings';
    return 'dashboard';
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/admin/dashboard">Dashboard</Link>,
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: <Link href="/admin/users">Users</Link>,
    },
    {
      key: 'staffs',
      icon: <TeamOutlined />,
      label: <Link href="/admin/staffs">Staff</Link>,
    },
    // {
    //   key: 'appointments',
    //   icon: <CalendarOutlined />,
    //   label: <Link href="/admin/appointments">Appointments</Link>,
    // },
    {
      key: 'locations',
      icon: <EnvironmentOutlined />,
      label: <Link href="/admin/locations">Locations</Link>,
    },
    // {
    //   key: 'blood-drives',
    //   icon: <HeartOutlined />,
    //   label: <Link href="/admin/blood-drives">Blood Drives</Link>,
    // },
    // {
    //   key: 'reports',
    //   icon: <BarChartOutlined />,
    //   label: <Link href="/admin/reports">Reports</Link>,
    // },
    {
      key: 'blog',
      icon: <FileTextOutlined />,
      label: <Link href="/admin/blog">Blog</Link>,
    },
    // {
    //   key: 'notifications',
    //   icon: <NotificationOutlined />,
    //   label: <Link href="/admin/notifications">Notifications</Link>,
    // },
    // {
    //   key: 'settings',
    //   icon: <SettingOutlined />,
    //   label: <Link href="/admin/settings">Settings</Link>,
    // },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <span className="cursor-pointer">Logout</span>,
      onClick: () => logout(),
    },
  ];

  return (
    <Sider
      width={260}
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      trigger={null}
      style={{
        background: colorBgContainer,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      <div className="flex items-center p-4 border-b border-gray-200">
        {!collapsed ? (
          <div className="flex items-center">
            <span className="text-2xl mr-2 text-red-500" role="img" aria-label="Blood Drop">🩸</span>
            <Title level={4} className="mb-0 text-red-500">Admin Portal</Title>
          </div>
        ) : (
          <span className="text-2xl mx-auto text-red-500" role="img" aria-label="Blood Drop">🩸</span>
        )}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        style={{ borderRight: 0 }}
        items={menuItems}
      />
    </Sider>
  );
} 