'use client';

import React, { useState, createContext, useContext } from 'react';
import { Layout, Menu, Button, theme, Typography } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  SettingOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  EnvironmentOutlined,
  HeartOutlined,
  LogoutOutlined,
  BarChartOutlined,
  ScheduleOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const { Sider } = Layout;
const { Title } = Typography;

// Create a context for the sidebar collapsed state
export const SidebarContext = createContext({
  collapsed: false,
  setCollapsed: (collapsed: boolean) => { },
  toggleCollapsed: () => { }
});

// Custom hook to use the sidebar context
export const useSidebar = () => useContext(SidebarContext);

// Sidebar Provider component
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export default function StaffSidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname() || '';
  const { logout } = useAuth();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // Get active menu key based on current path
  const getActiveKey = (pathname: string): string => {
    if (pathname === '/staff') return 'dashboard';
    if (pathname === '/staff/dashboard') return 'dashboard';
    if (pathname.includes('/staff/appointments')) return 'appointments';
    if (pathname.includes('/staff/donation-events')) return 'donation-events';
    if (pathname.includes('/staff/blood-request')) return 'blood-request';
    if (pathname.includes('/staff/donors')) return 'donors';
    if (pathname.includes('/staff/blood-drives')) return 'blood-drives';
    if (pathname.includes('/staff/reports')) return 'reports';
    if (pathname.includes('/staff/inventory')) return 'inventory';
    if (pathname.includes('/staff/capacity')) return 'capacity';
    if (pathname.includes('/staff/profile')) return 'profile';
    return '';
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/staff/dashboard">Dashboard</Link>,
    },
    {
      key: 'appointments',
      icon: <CalendarOutlined />,
      label: <Link href="/staff/appointments">Appointments</Link>,
    },
    {
      key: 'blood-request',
      icon: <FileTextOutlined />,
      label: <Link href="/staff/blood-request">Blood Requests</Link>,
    },
    {
      key: 'donation-events',
      icon: <HeartOutlined />,
      label: <Link href="/staff/donation-events">Donation Events</Link>,
    },
    {
      key: 'donors',
      icon: <UserOutlined />,
      label: <Link href="/staff/donors">Donors</Link>,
    },
    // {
    //   key: 'blood-drives',
    //   icon: <HeartOutlined />,
    //   label: <Link href="/staff/blood-drives">Blood Drives</Link>,
    // },
    {
      key: 'capacity',
      icon: <ScheduleOutlined />,
      label: <Link href="/staff/capacity">Capacity Management</Link>,
    },
    {
      key: 'inventory',
      icon: <FileTextOutlined />,
      label: <Link href="/staff/inventory">Inventory</Link>,
    },
    // {
    //   key: 'reports',
    //   icon: <BarChartOutlined />,
    //   label: <Link href="/staff/reports">Reports</Link>,
    // },
    // {
    //   key: 'profile',
    //   icon: <SettingOutlined />,
    //   label: <Link href="/staff/profile">Profile</Link>,
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
            <Title level={4} className="mb-0 text-red-500">Staff Portal</Title>
          </div>
        ) : (
          <span className="text-2xl mx-auto text-red-500" role="img" aria-label="Blood Drop">🩸</span>
        )}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[getActiveKey(pathname)]}
        style={{ borderRight: 0 }}
        items={menuItems}
      />
    </Sider>
  );
} 