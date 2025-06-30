'use client';

import React from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Button } from 'antd';
import { UserOutlined, HeartOutlined, CalendarOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import StaffLayout from '@/components/Layout/StaffLayout';
import Link from 'next/link';

const { Title } = Typography;

export default function StaffDashboard() {
  // Mock data for the dashboard
  const stats = [
    { title: 'Total Donors', value: 850, icon: <UserOutlined />, change: 5.2, changeType: 'increase' },
    { title: 'Total Donations', value: 620, icon: <HeartOutlined />, change: 8.1, changeType: 'increase' },
    { title: 'Appointments Today', value: 15, icon: <CalendarOutlined />, change: -2.3, changeType: 'decrease' },
    { title: 'Appointments Tomorrow', value: 22, icon: <CalendarOutlined />, change: 12.5, changeType: 'increase' },
  ];

  const upcomingAppointments = [
    { key: '1', donor: 'John Doe', date: '2023-06-28', time: '10:00 AM', status: 'Confirmed', type: 'Whole Blood' },
    { key: '2', donor: 'Jane Smith', date: '2023-06-28', time: '11:30 AM', status: 'Confirmed', type: 'Plasma' },
    { key: '3', donor: 'Bob Johnson', date: '2023-06-28', time: '2:15 PM', status: 'Pending', type: 'Platelets' },
    { key: '4', donor: 'Alice Williams', date: '2023-06-29', time: '9:45 AM', status: 'Confirmed', type: 'Whole Blood' },
    { key: '5', donor: 'Charlie Brown', date: '2023-06-29', time: '3:30 PM', status: 'Pending', type: 'Whole Blood' },
  ];

  const appointmentColumns = [
    { title: 'Donor', dataIndex: 'donor', key: 'donor' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Time', dataIndex: 'time', key: 'time' },
    { title: 'Status', dataIndex: 'status', key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'Confirmed') color = 'blue';
        if (status === 'Completed') color = 'green';
        if (status === 'Pending') color = 'orange';
        if (status === 'Cancelled') color = 'red';
        return <span className={`text-${color}-600`}>{status}</span>;
      }
    },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { 
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Button type="link" size="small">View Details</Button>
      )
    },
  ];

  const recentDonors = [
    { key: '1', name: 'John Doe', bloodType: 'A+', lastDonation: '2023-06-20', donationCount: 5 },
    { key: '2', name: 'Jane Smith', bloodType: 'O-', lastDonation: '2023-06-18', donationCount: 8 },
    { key: '3', name: 'Bob Johnson', bloodType: 'B+', lastDonation: '2023-06-15', donationCount: 3 },
    { key: '4', name: 'Alice Williams', bloodType: 'AB+', lastDonation: '2023-06-12', donationCount: 12 },
    { key: '5', name: 'Charlie Brown', bloodType: 'A-', lastDonation: '2023-06-10', donationCount: 7 },
  ];

  const donorColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Blood Type', dataIndex: 'bloodType', key: 'bloodType' },
    { title: 'Last Donation', dataIndex: 'lastDonation', key: 'lastDonation' },
    { title: 'Donations', dataIndex: 'donationCount', key: 'donationCount' },
    { 
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Button type="link" size="small">View Profile</Button>
      )
    },
  ];

  return (
    <StaffLayout 
      title="Staff Dashboard" 
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
            title="Upcoming Appointments" 
            extra={
              <Button type="link" onClick={() => window.location.href = '/staff/appointments'}>
                View All
              </Button>
            }
          >
            <Table 
              dataSource={upcomingAppointments} 
              columns={appointmentColumns} 
              pagination={false} 
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="Recent Donors" 
            extra={
              <Button type="link" onClick={() => window.location.href = '/staff/donors'}>
                View All
              </Button>
            }
          >
            <Table 
              dataSource={recentDonors} 
              columns={donorColumns} 
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </StaffLayout>
  );
} 