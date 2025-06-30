'use client';

import React from 'react';
import Link from 'next/link';
import { Layout, Menu, Button, Dropdown, Avatar, Space, Badge } from 'antd';
import { 
  UserOutlined, 
  MenuOutlined, 
  LogoutOutlined, 
  ProfileOutlined, 
  SettingOutlined, 
  HeartOutlined, 
  DashboardOutlined, 
  SearchOutlined, 
  TeamOutlined, 
  CalendarOutlined,
  BellOutlined,
  HistoryOutlined,
  MedicineBoxOutlined,
  TrophyOutlined,
  LineChartOutlined,
  CommentOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

const { Header: AntHeader } = Layout;

export default function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const pathname = usePathname() || '';

  // Get the active menu item based on the current path
  const getActiveMenuItem = () => {
    if (pathname === '/') return 'home';
    if (pathname.includes('/about')) return 'about';
    if (pathname.includes('/donate')) return 'donate';
    if (pathname.includes('/blood-info')) return 'bloodInfo';
    if (pathname.includes('/blog')) return 'blog';
    if (pathname.includes('/contact')) return 'contact';
    return '';
  };

  const activeMenuItem = getActiveMenuItem();

  const menuItems = [
    { key: 'home', label: <Link href="/">Home</Link> },
    { key: 'about', label: <Link href="/about">About Us</Link> },
    { key: 'donate', label: <Link href="/donate-blood">Donate Blood</Link> },
    { key: 'bloodInfo', label: <Link href="/blood-info">Blood Info</Link> },
    { key: 'blog', label: <Link href="/blog">Blog</Link> },
    { key: 'contact', label: <Link href="/contact">Contact</Link> },
  ];

  // Member-specific menu items if user is logged in
  const memberMenuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/member/dashboard">Dashboard</Link>
    },
    {
      type: 'group',
      label: 'Donation Management',
      children: [
        {
          key: 'donate',
          icon: <HeartOutlined />,
          label: <Link href="/member/donate-blood">Schedule Donation</Link>
        },
        {
          key: 'appointments',
          icon: <CalendarOutlined />,
          label: <Link href="/member/appointments">My Appointments</Link>
        },
        {
          key: 'history',
          icon: <HistoryOutlined />,
          label: <Link href="/member/donation-history">Donation History</Link>
        },
        {
          key: 'availability',
          icon: <CalendarOutlined />,
          label: <Link href="/member/availability">Availability Settings</Link>
        }
      ]
    },
    {
      type: 'group',
      label: 'Blood Services',
      children: [
        {
          key: 'bloodInfo',
          icon: <SearchOutlined />,
          label: <Link href="/member/blood-info">Blood Type Info</Link>
        },
        {
          key: 'nearby',
          icon: <TeamOutlined />,
          label: <Link href="/member/nearby-search">Find Donors/Recipients</Link>
        },
        {
          key: 'emergency',
          icon: <MedicineBoxOutlined />,
          label: <Link href="/member/emergency-request">Emergency Request</Link>
        },
        {
          key: 'requests',
          icon: <CommentOutlined />,
          label: <Link href="/member/my-requests">My Blood Requests</Link>
        }
      ]
    },
    {
      type: 'group',
      label: 'My Account',
      children: [
        {
          key: 'profile',
          icon: <ProfileOutlined />,
          label: <Link href="/member/profile">My Profile</Link>
        },
        {
          key: 'achievements',
          icon: <TrophyOutlined />,
          label: <Link href="/member/achievements">Achievements</Link>
        },
        {
          key: 'reports',
          icon: <LineChartOutlined />,
          label: <Link href="/member/reports">Health Reports</Link>
        },
        {
          key: 'notifications',
          icon: <BellOutlined />,
          label: <Link href="/member/notifications">Notifications</Link>
        },
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: <Link href="/member/settings">Settings</Link>
        }
      ]
    },
    {
      key: 'community',
      icon: <TeamOutlined />,
      label: <Link href="/member/community">Community</Link>
    },
    {
      key: 'divider',
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <span className="cursor-pointer">Logout</span>,
      onClick: () => logout()
    },
  ];

  const mobileMenuItems: MenuProps['items'] = [
    ...menuItems,
    { key: 'divider', type: 'divider' },
    ...(isLoggedIn
      ? [
          { key: 'dashboard', label: <Link href="/member/dashboard">Dashboard</Link> },
          { key: 'donate', label: <Link href="/member/donate-blood">Schedule Donation</Link> },
          { key: 'appointments', label: <Link href="/member/appointments">My Appointments</Link> },
          { key: 'bloodInfo', label: <Link href="/member/blood-info">Blood Type Info</Link> },
          { key: 'nearby', label: <Link href="/member/nearby-search">Find Donors/Recipients</Link> },
          { key: 'emergency', label: <Link href="/member/emergency-request">Emergency Request</Link> },
          { key: 'history', label: <Link href="/member/donation-history">Donation History</Link> },
          { key: 'profile', label: <Link href="/member/profile">My Profile</Link> },
          { key: 'achievements', label: <Link href="/member/achievements">Achievements</Link> },
          { key: 'notifications', label: <Link href="/member/notifications">Notifications</Link> },
          { key: 'settings', label: <Link href="/member/settings">Settings</Link> },
          { key: 'logout', label: <span className="cursor-pointer">Logout</span>, onClick: () => logout() }
        ]
      : [
          { key: 'login', label: <Link href="/login">Login</Link> },
          { key: 'register', label: <Link href="/register">Register</Link> }
        ]
    ),
  ];

  return (
    <AntHeader className="bg-white shadow-sm py-0 px-4 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center h-16">
        <div className="flex items-center">
          <Link href="/" className="flex items-center mr-8">
            <span className="text-3xl mr-2" role="img" aria-label="Blood Drop">🩸</span>
            <span className="text-xl font-bold text-red-600 hidden sm:inline">Blood Donation</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Menu mode="horizontal" className="border-0" selectedKeys={[activeMenuItem]} items={menuItems} />
          </div>
        </div>
        
        <div className="flex items-center">
          {/* Desktop Auth Buttons or User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Badge count={3} size="small">
                  <Link href="/member/notifications">
                    <Button 
                      type="text" 
                      shape="circle" 
                      icon={<BellOutlined />} 
                      className="mr-2" 
                    />
                  </Link>
                </Badge>
                <Dropdown menu={{ items: memberMenuItems }} placement="bottomRight">
                  <Button type="link" className="flex items-center px-2">
                    <Space>
                      <Avatar icon={<UserOutlined />} />
                      <span className="max-w-[100px] truncate">
                        {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.userName}
                      </span>
                    </Space>
                  </Button>
                </Dropdown>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button>Login</Button>
                </Link>
                <Link href="/register">
                  <Button type="primary" className="bg-red-600 hover:bg-red-700">Register</Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu */}
          <div className="md:hidden flex items-center">
            {isLoggedIn && (
              <Badge count={3} size="small" className="mr-3">
                <Link href="/member/notifications">
                  <Button 
                    type="text" 
                    shape="circle" 
                    icon={<BellOutlined />} 
                  />
                </Link>
              </Badge>
            )}
            <Dropdown menu={{ items: mobileMenuItems }} placement="bottomRight" trigger={['click']}>
              <Button icon={<MenuOutlined />} />
            </Dropdown>
          </div>
        </div>
      </div>
    </AntHeader>
  );
} 