'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Typography, Card, Row, Col, Statistic, Button, List, Tag, Badge, Progress, Calendar } from 'antd';
import {
  HeartOutlined,
  CalendarOutlined,
  TeamOutlined,
  RightOutlined,
  MedicineBoxOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;

// Mock data for dashboard
const mockData = {
  userBloodType: 'A+',
  totalDonations: 4,
  nextEligibleDate: '2023-12-20',
  upcomingAppointment: {
    date: '2023-12-22',
    time: '10:00 AM',
    facility: 'Central Blood Bank',
    address: '123 Main St, District 1, HCMC',
  },
  recentDonations: [
    {
      id: 1,
      date: '2023-08-15',
      facility: 'Central Blood Bank',
      type: 'Whole Blood',
    },
    {
      id: 2,
      date: '2023-05-03',
      facility: 'City Medical Center',
      type: 'Platelets',
    },
  ],
  urgentRequests: [
    {
      id: 1,
      bloodType: 'A+',
      facility: 'General Hospital',
      distance: 3.2,
      postedTime: '2 hours ago',
      urgency: 'high',
    },
    {
      id: 2,
      bloodType: 'O-',
      facility: 'Children\'s Hospital',
      distance: 5.7,
      postedTime: '5 hours ago',
      urgency: 'high',
    },
    {
      id: 3,
      bloodType: 'B+',
      facility: 'Emergency Medical Center',
      distance: 2.1,
      postedTime: '1 day ago',
      urgency: 'medium',
    },
  ],
  bloodInventory: {
    'A+': { status: 'low', percentage: 30 },
    'A-': { status: 'normal', percentage: 65 },
    'B+': { status: 'critical', percentage: 15 },
    'B-': { status: 'normal', percentage: 70 },
    'AB+': { status: 'normal', percentage: 55 },
    'AB-': { status: 'low', percentage: 40 },
    'O+': { status: 'low', percentage: 35 },
    'O-': { status: 'critical', percentage: 10 },
  },
  events: [
    {
      id: 1,
      title: 'Community Blood Drive',
      date: '2023-12-15',
      location: 'City Hall',
      description: 'Annual holiday blood drive with refreshments and gifts for donors.',
    },
    {
      id: 2,
      title: 'University Donation Day',
      date: '2023-12-28',
      location: 'State University Campus',
      description: 'Special blood donation event for students and faculty.',
    },
  ],
};

export default function MemberDashboardPage() {
  const { user } = useAuth();

  const isEligibleToDonate = dayjs(mockData.nextEligibleDate).isBefore(dayjs());

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'blue';
    }
  };

  const getInventoryStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return '#f5222d';
      case 'low':
        return '#fa8c16';
      case 'normal':
        return '#52c41a';
      default:
        return '#1890ff';
    }
  };

  const dateCellRender = (value: dayjs.Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const eventsList = mockData.events.filter(event => event.date === dateStr);

    if (eventsList.length === 0) return null;

    return (
      <ul className="events">
        {eventsList.map(event => (
          <li key={event.id}>
            <Badge color="blue" text={event.title} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <Title level={2}>Welcome, {user?.firstName}!</Title>
            <Paragraph className="text-gray-500">
              Your blood donation dashboard
            </Paragraph>
          </div>
          <div className="mt-4 md:mt-0">
            <Tag color="red" className="text-base px-3 py-1">
              Blood Type: {mockData.userBloodType}
            </Tag>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} md={8}>
          <Card className="h-full">
            <Statistic
              title="Total Donations"
              value={mockData.totalDonations}
              prefix={<HeartOutlined className="text-red-500" />}
            />
            {/* <div className="mt-4">
              <Link href="/member/donation-history">
                <Button type="link" className="p-0 flex items-center text-blue-600">
                  View History <RightOutlined className="ml-1" />
                </Button>
              </Link>
            </div> */}
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className={`h-full ${isEligibleToDonate ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <Statistic
              title="Next Eligible Donation Date"
              value={isEligibleToDonate ? 'Eligible Now!' : dayjs(mockData.nextEligibleDate).format('MMM D, YYYY')}
              valueStyle={{ color: isEligibleToDonate ? '#52c41a' : '#fa8c16', fontSize: '18px' }}
              prefix={<CalendarOutlined />}
            />
            <div className="mt-4">
              {isEligibleToDonate ? (
                <Link href="/member/blood-registration">
                  <Button type="primary" className="bg-green-600 hover:bg-green-700">
                    Schedule a Donation
                  </Button>
                </Link>
              ) : (
                <Text type="secondary">
                  {dayjs(mockData.nextEligibleDate).diff(dayjs(), 'day')} days until you can donate again
                </Text>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="h-full bg-blue-50">
            <div className="mb-2">
              <Text strong>Upcoming Appointment</Text>
            </div>
            {mockData.upcomingAppointment ? (
              <div>
                <div className="flex items-center mb-2">
                  <CalendarOutlined className="mr-2 text-blue-500" />
                  <Text>{dayjs(mockData.upcomingAppointment.date).format('MMM D, YYYY')} at {mockData.upcomingAppointment.time}</Text>
                </div>
                <div className="flex items-center mb-2">
                  <MedicineBoxOutlined className="mr-2 text-blue-500" />
                  <Text>{mockData.upcomingAppointment.facility}</Text>
                </div>
                <div className="mt-4">
                  <Button size="small">Reschedule</Button>
                  <Button size="small" danger className="ml-2">Cancel</Button>
                </div>
              </div>
            ) : (
              <div>
                <Text type="secondary">No upcoming appointments</Text>
                <div className="mt-4">
                  <Link href="/member/blood-registration">
                    <Button type="primary" size="small">Schedule Now</Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Second Row */}
      <Row gutter={[16, 16]} className="mb-8">
        {/* Urgent Blood Requests */}
        <Col xs={24} lg={12}>
          <Card
            title={<span className="text-red-600 font-bold flex items-center"><MedicineBoxOutlined className="mr-2" /> Urgent Blood Requests</span>}
            className="h-full"
          >
            <List
              itemLayout="horizontal"
              dataSource={mockData.urgentRequests}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Link key="list-more" href={`/member/emergency-request/${item.id}`}>
                      <Button type="link">Details</Button>
                    </Link>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div className="flex items-center">
                        <Tag color="red" className="mr-2">{item.bloodType}</Tag>
                        <Text strong>{item.facility}</Text>
                      </div>
                    }
                    description={
                      <div className="flex flex-col">
                        <div className="flex items-center text-gray-500">
                          <EnvironmentOutlined className="mr-1" /> {item.distance} km away
                        </div>
                        <div className="flex items-center mt-1">
                          <Tag color={getUrgencyColor(item.urgency)}>
                            {item.urgency === 'high' ? 'URGENT' : item.urgency === 'medium' ? 'Needed Soon' : 'Standard'}
                          </Tag>
                          <Text type="secondary" className="text-xs">{item.postedTime}</Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            {/* <div className="mt-4 text-center">
              <Link href="/member/emergency-request">
                <Button type="primary" className="bg-red-600 hover:bg-red-700">View All Requests</Button>
              </Link>
            </div> */}
          </Card>
        </Col>

        {/* Blood Inventory */}
        <Col xs={24} lg={12}>
          <Card
            title={<span className="font-bold flex items-center"><TeamOutlined className="mr-2" /> Blood Inventory Status</span>}
            className="h-full"
          >
            <Row gutter={[16, 16]}>
              {Object.entries(mockData.bloodInventory).map(([type, data]) => (
                <Col span={6} key={type}>
                  <div className="text-center">
                    <div className="mb-2">
                      <Tag color="red" className="text-lg px-3 py-1">{type}</Tag>
                    </div>
                    <Progress
                      type="circle"
                      percent={data.percentage}
                      width={70}
                      strokeColor={getInventoryStatusColor(data.status)}
                      format={percent => (
                        <span className="text-xs">
                          {data.status === 'critical' ? 'Critical' : data.status === 'low' ? 'Low' : 'OK'}
                        </span>
                      )}
                    />
                  </div>
                </Col>
              ))}
            </Row>
            <div className="mt-8 text-center">
              <Link href="/member/blood-info">
                <Button>Learn About Blood Types</Button>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Third Row */}
      <Row gutter={[16, 16]} className="mb-8">
        {/* Recent Donations */}
        <Col xs={24} md={12}>
          <Card
            title={<span className="font-bold flex items-center"><HeartOutlined className="mr-2" /> Recent Donations</span>}
            className="h-full"
          >
            {mockData.recentDonations.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={mockData.recentDonations}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={dayjs(item.date).format('MMMM D, YYYY')}
                      description={
                        <div>
                          <div>{item.facility}</div>
                          <Tag color="blue">{item.type}</Tag>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center py-8">
                <Paragraph>You haven't made any donations yet.</Paragraph>
                <Link href="/member/blood-registration">
                  <Button type="primary">Schedule Your First Donation</Button>
                </Link>
              </div>
            )}
            {mockData.recentDonations.length > 0 && (
              <div className="mt-4 text-center">
                <Link href="/member/donation-history">
                  <Button>View Complete History</Button>
                </Link>
              </div>
            )}
          </Card>
        </Col>

        {/* Upcoming Events */}
        <Col xs={24} md={12}>
          <Card
            title={<span className="font-bold flex items-center"><CalendarOutlined className="mr-2" /> Upcoming Events</span>}
            className="h-full"
          >
            <Calendar
              fullscreen={false}
              cellRender={dateCellRender}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
