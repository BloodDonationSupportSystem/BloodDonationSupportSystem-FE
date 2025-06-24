'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Typography, Card, Spin, Table, Tag, Button, Tooltip, Badge, Empty, Tabs, Statistic, Row, Col, Timeline } from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  HeartOutlined, 
  CheckCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  BellOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// Mock data for donation history
const mockDonations = [
  {
    id: 1,
    date: '2023-05-15',
    facility: 'Central Blood Bank',
    bloodType: 'A+',
    units: 1,
    donationType: 'Whole Blood',
    status: 'completed',
    nextEligibleDate: '2023-08-15',
    location: '123 Main St, District 1, HCMC',
    notes: 'Regular donation',
  },
  {
    id: 2,
    date: '2023-02-03',
    facility: 'City Medical Center',
    bloodType: 'A+',
    units: 1,
    donationType: 'Platelets',
    status: 'completed',
    nextEligibleDate: '2023-03-03',
    location: '456 Oak St, District 3, HCMC',
    notes: 'Emergency donation for accident victim',
  },
  {
    id: 3,
    date: '2022-10-20',
    facility: 'Provincial Hospital',
    bloodType: 'A+',
    units: 1,
    donationType: 'Plasma',
    status: 'completed',
    nextEligibleDate: '2022-11-20',
    location: '789 Pine Ave, District 5, HCMC',
    notes: 'COVID-19 convalescent plasma donation',
  },
  {
    id: 4,
    date: '2022-06-05',
    facility: 'Blood Donation Drive',
    bloodType: 'A+',
    units: 1,
    donationType: 'Whole Blood',
    status: 'completed',
    nextEligibleDate: '2022-09-05',
    location: 'University Campus, District 10, HCMC',
    notes: 'College blood drive',
  },
  {
    id: 5,
    date: '2023-12-15',
    facility: 'Central Blood Bank',
    bloodType: 'A+',
    units: 1,
    donationType: 'Whole Blood',
    status: 'scheduled',
    nextEligibleDate: '2024-03-15',
    location: '123 Main St, District 1, HCMC',
    notes: 'Regular donation',
  },
];

// Mock data for blood recipient connections
const mockRecipientConnections = [
  {
    id: 1,
    recipientName: 'Jane Smith',
    date: '2023-05-15',
    bloodType: 'A+',
    medicalCondition: 'Surgery patient',
    facility: 'Central Hospital',
    status: 'successful',
    message: 'Thank you for your donation! It helped me recover after my surgery.',
  },
  {
    id: 2,
    recipientName: 'Anonymous',
    date: '2023-02-03',
    bloodType: 'A+',
    medicalCondition: 'Accident victim',
    facility: 'Emergency Center',
    status: 'successful',
    message: null,
  },
];

export default function DonationHistoryPage() {
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('history');

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);

  const calculateStats = () => {
    const completedDonations = mockDonations.filter(d => d.status === 'completed');
    
    const totalDonations = completedDonations.length;
    const wholeBloodDonations = completedDonations.filter(d => d.donationType === 'Whole Blood').length;
    const plateletDonations = completedDonations.filter(d => d.donationType === 'Platelets').length;
    const plasmaDonations = completedDonations.filter(d => d.donationType === 'Plasma').length;
    
    // Calculate lives impacted (rough estimate - 1 whole blood donation can help up to 3 people)
    const livesImpacted = (wholeBloodDonations * 3) + plateletDonations + plasmaDonations;
    
    // Calculate next eligible date
    const nextEligibleDates = completedDonations.map(d => d.nextEligibleDate).sort();
    const nextDonationDate = nextEligibleDates.find(date => dayjs(date).isAfter(dayjs())) || 'Now';
    
    return {
      totalDonations,
      wholeBloodDonations,
      plateletDonations,
      plasmaDonations,
      livesImpacted,
      nextDonationDate,
    };
  };

  const stats = calculateStats();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'green';
      case 'scheduled':
        return 'blue';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  const getDonationTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'whole blood':
        return 'red';
      case 'platelets':
        return 'orange';
      case 'plasma':
        return 'blue';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: any, b: any) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (text: string) => (
        <span className="flex items-center">
          <CalendarOutlined className="mr-1" /> {dayjs(text).format('MMM D, YYYY')}
        </span>
      ),
    },
    {
      title: 'Facility',
      dataIndex: 'facility',
      key: 'facility',
    },
    {
      title: 'Type',
      dataIndex: 'donationType',
      key: 'donationType',
      render: (text: string) => (
        <Tag color={getDonationTypeColor(text)}>{text}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => (
        <Tag color={getStatusColor(text)}>
          {text.charAt(0).toUpperCase() + text.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Next Eligible Date',
      dataIndex: 'nextEligibleDate',
      key: 'nextEligibleDate',
      render: (text: string, record: any) => {
        const isEligible = dayjs(text).isBefore(dayjs());
        return (
          <span className={isEligible ? 'text-green-600 font-medium' : ''}>
            {dayjs(text).format('MMM D, YYYY')}
            {isEligible && <CheckCircleOutlined className="ml-1" />}
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <div className="flex space-x-2">
          <Tooltip title="View Details">
            <Button 
              type="primary" 
              size="small" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => console.log('View details for donation', record.id)}
            >
              Details
            </Button>
          </Tooltip>
          {record.status === 'scheduled' && (
            <Tooltip title="Cancel Appointment">
              <Button 
                danger 
                size="small"
                onClick={() => console.log('Cancel appointment', record.id)}
              >
                Cancel
              </Button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const connectionColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => dayjs(text).format('MMM D, YYYY'),
    },
    {
      title: 'Recipient',
      dataIndex: 'recipientName',
      key: 'recipientName',
    },
    {
      title: 'Medical Condition',
      dataIndex: 'medicalCondition',
      key: 'medicalCondition',
    },
    {
      title: 'Facility',
      dataIndex: 'facility',
      key: 'facility',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => (
        <Tag color="green">
          {text.charAt(0).toUpperCase() + text.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Tooltip title="View Message">
          <Button 
            type="default" 
            size="small" 
            disabled={!record.message}
            onClick={() => console.log('View message for connection', record.id)}
          >
            {record.message ? 'View Message' : 'No Message'}
          </Button>
        </Tooltip>
      ),
    },
  ];

  const renderHistory = () => {
    if (mockDonations.length === 0) {
      return (
        <Empty 
          description="No donation history found" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      );
    }

    return (
      <Table 
        dataSource={mockDonations} 
        columns={columns} 
        rowKey="id" 
        pagination={{ pageSize: 5 }}
      />
    );
  };

  const renderRecipientConnections = () => {
    if (mockRecipientConnections.length === 0) {
      return (
        <Empty 
          description="No recipient connections found" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      );
    }

    return (
      <Table 
        dataSource={mockRecipientConnections} 
        columns={connectionColumns} 
        rowKey="id" 
        pagination={{ pageSize: 5 }}
      />
    );
  };

  const renderDonationTimeline = () => {
    const sortedDonations = [...mockDonations].sort((a, b) => 
      dayjs(b.date).unix() - dayjs(a.date).unix()
    );

    return (
      <Timeline mode="left" className="mt-4">
        {sortedDonations.map(donation => (
          <Timeline.Item 
            key={donation.id} 
            color={getStatusColor(donation.status)}
            label={dayjs(donation.date).format('MMM D, YYYY')}
          >
            <div className="ml-2">
              <Text strong>{donation.donationType}</Text> at <Text strong>{donation.facility}</Text>
              <div className="text-gray-500 text-sm flex items-center mt-1">
                <EnvironmentOutlined className="mr-1" /> {donation.location}
              </div>
              {donation.notes && (
                <div className="text-gray-500 text-sm flex items-center mt-1">
                  <FileTextOutlined className="mr-1" /> {donation.notes}
                </div>
              )}
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // If not logged in (and redirecting), don't render the content
  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <Title level={2}>Your Blood Donation History</Title>
          <Paragraph className="text-gray-500">
            Track your donations, upcoming appointments, and see the impact you've made
          </Paragraph>
        </div>

        <Card className="shadow-md mb-8">
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="h-full bg-red-50 border-red-200">
                <Statistic 
                  title="Total Donations" 
                  value={stats.totalDonations} 
                  prefix={<HeartOutlined className="text-red-500" />} 
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="h-full bg-blue-50 border-blue-200">
                <Statistic 
                  title="Lives Impacted" 
                  value={stats.livesImpacted} 
                  prefix={<TrophyOutlined className="text-blue-500" />} 
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="h-full bg-green-50 border-green-200">
                <Statistic 
                  title="Next Eligible Date" 
                  value={stats.nextDonationDate === 'Now' ? 'Eligible Now' : dayjs(stats.nextDonationDate).format('MMM D, YYYY')} 
                  prefix={<CalendarOutlined className="text-green-500" />} 
                  valueStyle={{ fontSize: '16px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="h-full bg-purple-50 border-purple-200">
                <Button 
                  type="primary" 
                  size="large" 
                  block 
                  className="h-full bg-red-600 hover:bg-red-700 flex items-center justify-center"
                  onClick={() => router.push('/member/blood-registration')}
                >
                  <span className="text-lg font-medium">Schedule Donation</span>
                </Button>
              </Card>
            </Col>
          </Row>
        </Card>

        <Card className="shadow-md">
          <Tabs 
            activeKey={activeTab} 
            onChange={(key) => setActiveTab(key)}
          >
            <TabPane 
              tab={<span><ClockCircleOutlined /> Donation History</span>} 
              key="history"
            >
              {renderHistory()}
            </TabPane>
            <TabPane 
              tab={<span><HeartOutlined /> Recipient Connections</span>} 
              key="connections"
            >
              {renderRecipientConnections()}
            </TabPane>
            <TabPane 
              tab={<span><CalendarOutlined /> Timeline</span>} 
              key="timeline"
            >
              {renderDonationTimeline()}
            </TabPane>
          </Tabs>
        </Card>

        <Card className="mt-8 bg-blue-50 border-blue-200">
          <div className="flex items-start">
            <BellOutlined className="text-blue-600 text-xl mt-1 mr-3" />
            <div>
              <Title level={5} className="text-blue-700">Donation Reminders</Title>
              <Paragraph className="text-blue-600">
                We'll send you notifications when you're eligible to donate again. 
                Make sure your notification settings are enabled in your profile.
              </Paragraph>
              <Button 
                type="primary" 
                className="bg-blue-600 hover:bg-blue-700 mt-2"
                onClick={() => router.push('/member/notification-settings')}
              >
                Manage Notifications
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 