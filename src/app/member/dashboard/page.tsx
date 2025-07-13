'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Typography, Card, Row, Col, Statistic, Button, List, Tag, Badge, Progress, Calendar, Spin, Alert } from 'antd';
import {
  HeartOutlined,
  CalendarOutlined,
  TeamOutlined,
  RightOutlined,
  MedicineBoxOutlined,
  EnvironmentOutlined,
  EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';
import { useMemberDashboard } from '@/hooks/useMemberDashboard';

// Register dayjs plugins
dayjs.extend(relativeTime);

const { Title, Paragraph, Text } = Typography;

// Define missing interfaces
interface Event {
  id: string | number;
  title: string;
  date: string;
  location?: string;
  description?: string;
}

interface BloodInventoryStatus {
  status: 'critical' | 'low' | 'normal';
  percentage: number;
}

// Mock data for events and inventory that aren't in the API
const mockEvents: Event[] = [
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
];

const mockBloodInventory: Record<string, BloodInventoryStatus> = {
  'A+': { status: 'low', percentage: 30 },
  'A-': { status: 'normal', percentage: 65 },
  'B+': { status: 'critical', percentage: 15 },
  'B-': { status: 'normal', percentage: 70 },
  'AB+': { status: 'normal', percentage: 55 },
  'AB-': { status: 'low', percentage: 40 },
  'O+': { status: 'low', percentage: 35 },
  'O-': { status: 'critical', percentage: 10 },
};

export default function MemberDashboardPage() {
  const { user } = useAuth();
  const { dashboardData, loading, error, refetch } = useMemberDashboard();

  // Check if there's a 404 error or missing donor profile
  const isDonorProfileMissing = error?.includes('404') || !dashboardData?.donorProfile;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
      case 'High':
        return 'red';
      case 'medium':
      case 'Medium':
        return 'orange';
      case 'low':
      case 'Low':
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
    const eventsList = mockEvents.filter(event => event.date === dateStr);

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

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  // Show donor profile registration prompt if profile is missing
  if (isDonorProfileMissing) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="text-center mb-8">
              <HeartOutlined className="text-5xl text-red-500 mb-4" />
              <Title level={2}>Welcome to Blood Donation Support System</Title>
              <Paragraph className="text-gray-500 text-lg">
                You don't have a donor profile yet. Creating a profile will allow you to:
              </Paragraph>
            </div>

            <Row gutter={[16, 16]} className="mb-8">
              <Col xs={24} sm={12}>
                <Card className="h-full">
                  <div className="flex items-start">
                    <HeartOutlined className="text-red-500 text-xl mr-3 mt-1" />
                    <div>
                      <Text strong className="text-base">Donate Blood</Text>
                      <Paragraph className="text-gray-500 mb-0">
                        Register as a blood donor and help save lives
                      </Paragraph>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card className="h-full">
                  <div className="flex items-start">
                    <CalendarOutlined className="text-red-500 text-xl mr-3 mt-1" />
                    <div>
                      <Text strong className="text-base">Schedule Donations</Text>
                      <Paragraph className="text-gray-500 mb-0">
                        Set your preferred donation times and availability
                      </Paragraph>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card className="h-full">
                  <div className="flex items-start">
                    <EnvironmentOutlined className="text-red-500 text-xl mr-3 mt-1" />
                    <div>
                      <Text strong className="text-base">Find Nearby Requests</Text>
                      <Paragraph className="text-gray-500 mb-0">
                        Help people in need of blood near your location
                      </Paragraph>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card className="h-full">
                  <div className="flex items-start">
                    <EditOutlined className="text-red-500 text-xl mr-3 mt-1" />
                    <div>
                      <Text strong className="text-base">Track Donations</Text>
                      <Paragraph className="text-gray-500 mb-0">
                        Keep a record of your donation history and impact
                      </Paragraph>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            <div className="text-center">
              <Link href="/profile-creation">
                <Button
                  type="primary"
                  size="large"
                  icon={<HeartOutlined />}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Create Donor Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if any (except 404 which is handled above)
  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" type="primary" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  // If we have dashboard data but no donor profile, show registration prompt
  if (!dashboardData?.donorProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="text-center mb-8">
              <HeartOutlined className="text-5xl text-red-500 mb-4" />
              <Title level={2}>Welcome to Blood Donation Support System</Title>
              <Paragraph className="text-gray-500 text-lg">
                You don't have a donor profile yet. Creating a profile will allow you to:
              </Paragraph>
            </div>

            <Row gutter={[16, 16]} className="mb-8">
              <Col xs={24} sm={12}>
                <Card className="h-full">
                  <div className="flex items-start">
                    <HeartOutlined className="text-red-500 text-xl mr-3 mt-1" />
                    <div>
                      <Text strong className="text-base">Donate Blood</Text>
                      <Paragraph className="text-gray-500 mb-0">
                        Register as a blood donor and help save lives
                      </Paragraph>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card className="h-full">
                  <div className="flex items-start">
                    <CalendarOutlined className="text-red-500 text-xl mr-3 mt-1" />
                    <div>
                      <Text strong className="text-base">Schedule Donations</Text>
                      <Paragraph className="text-gray-500 mb-0">
                        Set your preferred donation times and availability
                      </Paragraph>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card className="h-full">
                  <div className="flex items-start">
                    <EnvironmentOutlined className="text-red-500 text-xl mr-3 mt-1" />
                    <div>
                      <Text strong className="text-base">Find Nearby Requests</Text>
                      <Paragraph className="text-gray-500 mb-0">
                        Help people in need of blood near your location
                      </Paragraph>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card className="h-full">
                  <div className="flex items-start">
                    <EditOutlined className="text-red-500 text-xl mr-3 mt-1" />
                    <div>
                      <Text strong className="text-base">Track Donations</Text>
                      <Paragraph className="text-gray-500 mb-0">
                        Keep a record of your donation history and impact
                      </Paragraph>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            <div className="text-center">
              <Link href="/profile-creation">
                <Button
                  type="primary"
                  size="large"
                  icon={<HeartOutlined />}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Create Donor Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If we have data, render the dashboard
  const isEligibleToDonate = dashboardData?.isEligibleToDonate || false;
  const upcomingAppointment = dashboardData?.upcomingAppointments?.[0]; // Get the first appointment if available

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
              Blood Type: {dashboardData?.donorProfile?.bloodGroupName || 'Unknown'}
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
              value={dashboardData?.donorProfile?.totalDonations || 0}
              prefix={<HeartOutlined className="text-red-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className={`h-full ${isEligibleToDonate ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <Statistic
              title="Next Eligible Donation Date"
              value={isEligibleToDonate ? 'Eligible Now!' : dayjs(dashboardData?.nextEligibleDonationDate).format('MMM D, YYYY')}
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
                  {dayjs(dashboardData?.nextEligibleDonationDate).diff(dayjs(), 'day')} days until you can donate again
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
            {upcomingAppointment ? (
              <div>
                <div className="flex items-center mb-2">
                  <CalendarOutlined className="mr-2 text-blue-500" />
                  <Text>{dayjs(upcomingAppointment.preferredDate || upcomingAppointment.confirmedDate).format('MMM D, YYYY')} at {upcomingAppointment.preferredTimeSlot || upcomingAppointment.confirmedTimeSlot}</Text>
                </div>
                <div className="flex items-center mb-2">
                  <MedicineBoxOutlined className="mr-2 text-blue-500" />
                  <Text>{upcomingAppointment.locationName || upcomingAppointment.confirmedLocationName}</Text>
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
        {/* Emergency Blood Requests */}
        <Col xs={24} lg={12}>
          <Card
            title={<span className="text-red-600 font-bold flex items-center"><MedicineBoxOutlined className="mr-2" /> Urgent Blood Requests</span>}
            className="h-full"
          >
            {dashboardData?.nearbyEmergencyRequests && dashboardData.nearbyEmergencyRequests.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={dashboardData.nearbyEmergencyRequests}
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
                          <Tag color="red" className="mr-2">{item.bloodGroupName}</Tag>
                          <Text strong>{item.hospitalName}</Text>
                        </div>
                      }
                      description={
                        <div className="flex flex-col">
                          <div className="flex items-center text-gray-500">
                            <EnvironmentOutlined className="mr-1" /> {item.address}
                          </div>
                          <div className="flex items-center mt-1">
                            <Tag color={getUrgencyColor(item.urgencyLevel)}>
                              {item.urgencyLevel === 'High' ? 'URGENT' : item.urgencyLevel === 'Medium' ? 'Needed Soon' : 'Standard'}
                            </Tag>
                            <Text type="secondary" className="text-xs">{dayjs(item.requestDate).fromNow()}</Text>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center py-8">
                <Paragraph>No urgent blood requests at the moment.</Paragraph>
              </div>
            )}
          </Card>
        </Col>

        {/* Blood Inventory */}
        <Col xs={24} lg={12}>
          <Card
            title={<span className="font-bold flex items-center"><TeamOutlined className="mr-2" /> Blood Inventory Status</span>}
            className="h-full"
          >
            <Row gutter={[16, 16]}>
              {Object.entries(mockBloodInventory).map(([type, data]) => (
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
            {dashboardData?.recentDonations && dashboardData.recentDonations.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={dashboardData.recentDonations}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={dayjs(item.donationDate || item.createdTime).format('MMMM D, YYYY')}
                      description={
                        <div>
                          <div>{item.locationName}</div>
                          <Tag color="blue">{item.componentTypeName}</Tag>
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
            {dashboardData?.recentDonations && dashboardData.recentDonations.length > 0 && (
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
