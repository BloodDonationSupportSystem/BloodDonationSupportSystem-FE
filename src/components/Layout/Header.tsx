'use client';

import React from 'react';
import Link from 'next/link';
import { Layout, Menu, Button, Dropdown, Avatar, Space } from 'antd';
import { UserOutlined, MenuOutlined, LogoutOutlined, ProfileOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '@/context/AuthContext';

const { Header: AntHeader } = Layout;

export default function Header() {
  const { user, isLoggedIn, logout } = useAuth();

  const menuItems = [
    { key: 'home', label: <Link href="/">Home</Link> },
    { key: 'about', label: <Link href="/about">About Us</Link> },
    { key: 'donate', label: <Link href="/donate">Donate</Link> },
    { key: 'events', label: <Link href="/events">Events</Link> },
    { key: 'blog', label: <Link href="/blog-post">Blog</Link> },
    { key: 'contact', label: <Link href="/contact">Contact</Link> },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: <Link href="/profile">My Profile</Link>
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link href="/settings">Settings</Link>
    },
    {
      key: 'divider',
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <a onClick={logout}>Logout</a>
    },
  ];

  const mobileMenuItems: MenuProps['items'] = [
    ...menuItems,
    { key: 'divider', type: 'divider' },
    ...(isLoggedIn
      ? [
          { key: 'profile', label: <Link href="/profile">My Profile</Link> },
          { key: 'settings', label: <Link href="/settings">Settings</Link> },
          { key: 'logout', label: <a onClick={logout}>Logout</a> }
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
            <Menu mode="horizontal" className="border-0" selectedKeys={['home']} items={menuItems} />
          </div>
        </div>
        
        <div className="flex items-center">
          {/* Desktop Auth Buttons or User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Button type="link" className="flex items-center px-2">
                  <Space>
                    <Avatar icon={<UserOutlined />} />
                    <span className="max-w-[100px] truncate">
                      {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.userName}
                    </span>
                  </Space>
                </Button>
              </Dropdown>
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
          <div className="md:hidden">
            <Dropdown menu={{ items: mobileMenuItems }} placement="bottomRight" trigger={['click']}>
              <Button icon={<MenuOutlined />} />
            </Dropdown>
          </div>
        </div>
      </div>
    </AntHeader>
  );
} 