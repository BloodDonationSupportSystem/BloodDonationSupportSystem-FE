'use client';

import React from 'react';
import { Menu, Layout } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DashboardOutlined,
  HeartOutlined,
  CalendarOutlined,
  HistoryOutlined,
  SearchOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  CommentOutlined,
  ProfileOutlined,
  TrophyOutlined,
  LineChartOutlined,
  BellOutlined,
  SettingOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Sider } = Layout;

export default function MemberSidebar() {
  const pathname = usePathname() || '';
  
  const menuItems: MenuProps['items'] = [
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
          key: 'blood-registration',
          icon: <HeartOutlined />,
          label: <Link href="/member/blood-registration">Schedule Donation</Link>
        },
        {
          key: 'appointments',
          icon: <CalendarOutlined />,
          label: <Link href="/member/appointments">My Appointments</Link>
        },
        {
          key: 'donation-history',
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
          key: 'blood-info',
          icon: <SearchOutlined />,
          label: <Link href="/member/blood-info">Blood Type Info</Link>
        },
        {
          key: 'nearby-search',
          icon: <TeamOutlined />,
          label: <Link href="/member/nearby-search">Find Donors/Recipients</Link>
        },
        {
          key: 'emergency-request',
          icon: <MedicineBoxOutlined />,
          label: <Link href="/member/emergency-request">Emergency Request</Link>
        },
        {
          key: 'my-requests',
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
        }
      ]
    }
  ];

  // Extract the current section from the path
  const currentPath = pathname.split('/').pop() || '';

  return (
    <Sider
      width={260}
      className="bg-white shadow-sm"
      breakpoint="lg"
      collapsedWidth="0"
      collapsible
    >
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-red-600">Member Portal</h2>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[currentPath]}
        defaultOpenKeys={['blood-services']}
        style={{ height: '100%', borderRight: 0 }}
        items={menuItems}
        className="custom-sidebar-menu"
      />
    </Sider>
  );
} 