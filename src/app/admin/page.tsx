'use client';

import React from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Button } from 'antd';
import { UserOutlined, HeartOutlined, CalendarOutlined, TeamOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import AdminLayout from '@/components/Layout/AdminLayout';
import Link from 'next/link';

const { Title } = Typography;

export default function AdminDashboard() {
  // Mock data for the dashboard
  const stats = [
    { title: 'Total Users', value: 1250, icon: <UserOutlined />, change: 12.5, changeType: 'increase' },
    { title: 'Total Donations', value: 840, icon: <HeartOutlined />, change: 8.2, changeType: 'increase' },
    { title: 'Appointments', value: 126, icon: <CalendarOutlined />, change: -3.1, changeType: 'decrease' },
    { title: 'Staff Members', value: 42, icon: <TeamOutlined />, change: 5.6, changeType: 'increase' },
  ];

  const recentUsers = [
    { key: '1', name: 'John Doe', email: 'john@example.com', role: 'Member', registered: '2023-06-25' },
    { key: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Member', registered: '2023-06-24' },
    { key: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Staff', registered: '2023-06-23' },
    { key: '4', name: 'Alice Williams', email: 'alice@example.com', role: 'Member', registered: '2023-06-22' },
    { key: '5', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Admin', registered: '2023-06-21' },
  ];

  const userColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Registered', dataIndex: 'registered', key: 'registered' },
  ];

  const recentAppointments = [
    { key: '1', user: 'John Doe', date: '2023-06-28', time: '10:00 AM', status: 'Confirmed', location: 'Main Center' },
    { key: '2', user: 'Jane Smith', date: '2023-06-27', time: '11:30 AM', status: 'Completed', location: 'East Branch' },
    { key: '3', user: 'Bob Johnson', date: '2023-06-26', time: '2:15 PM', status: 'Cancelled', location: 'Main Center' },
    { key: '4', user: 'Alice Williams', date: '2023-06-25', time: '9:45 AM', status: 'Confirmed', location: 'West Branch' },
    { key: '5', user: 'Charlie Brown', date: '2023-06-24', time: '3:30 PM', status: 'Completed', location: 'South Branch' },
  ];

  const appointmentColumns = [
    { title: 'User', dataIndex: 'user', key: 'user' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Time', dataIndex: 'time', key: 'time' },
    { title: 'Status', dataIndex: 'status', key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'Confirmed') color = 'blue';
        if (status === 'Completed') color = 'green';
        if (status === 'Cancelled') color = 'red';
        return <span className={`text-${color}-600`}>{status}</span>;
      }
    },
    { title: 'Location', dataIndex: 'location', key: 'location' },
  ];

  return (
    <AdminLayout 
      title="Dashboard" 
      breadcrumbItems={[]}
    >
      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                suffix={
                  <span className={`text-${stat.changeType === 'increase' ? 'green' : 'red'}-500 text-sm ml-2`}>
                    {stat.changeType === 'increase' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    {Math.abs(stat.change)}%
                  </span>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={12}>
          <Card 
            title="Recent Users" 
            extra={
              <Button type="link" onClick={() => window.location.href = '/admin/users'}>
                View All
              </Button>
            }
          >
            <Table 
              dataSource={recentUsers} 
              columns={userColumns} 
              pagination={false} 
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="Recent Appointments" 
            extra={
              <Button type="link" onClick={() => window.location.href = '/admin/appointments'}>
                View All
              </Button>
            }
          >
            <Table 
              dataSource={recentAppointments} 
              columns={appointmentColumns} 
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  );
} 