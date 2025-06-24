'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Typography, 
  Card, 
  Spin, 
  Tabs, 
  Progress, 
  Row, 
  Col, 
  Space, 
  Badge, 
  Button, 
  Statistic, 
  Tooltip, 
  Avatar, 
  List, 
  Tag, 
  Divider,
  Empty,
  Timeline,
  Alert
} from 'antd';
import { 
  TrophyOutlined, 
  HeartOutlined, 
  RiseOutlined, 
  HistoryOutlined, 
  StarOutlined, 
  SafetyOutlined, 
  CrownOutlined, 
  AuditOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  BarChartOutlined,
  GiftOutlined,
  ShareAltOutlined,
  FireOutlined,
  MedicineBoxOutlined,
  ThunderboltOutlined,
  UserOutlined,
  EyeOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import Image from 'next/image';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;
// const { TabPane } = Tabs;

// Mock user data
const mockUserData = {
  name: 'Nguyen Van A',
  totalDonations: 12,
  totalVolume: 5400, // in mL
  firstDonationDate: '2020-05-15',
  streak: 3, // consecutive quarters with donations
  lastDonation: '2023-11-10',
  bloodType: 'A+',
  savesCount: 36, // estimated lives saved
  level: 4,
  levelProgress: 80,
  pointsToNextLevel: 2,
  invitedFriends: 5,
  invitedFriendsWhoDonated: 3,
  ranking: {
    local: 12, // out of 100
    national: 450, // out of 10000
  },
  impactStats: {
    accidents: 2,
    surgeries: 3,
    cancer: 1,
    other: 6,
  }
};

// Mock badges data
const mockBadges = [
  {
    id: 1,
    name: 'First Donation',
    description: 'Made your first blood donation',
    icon: <HeartOutlined />,
    color: '#f5222d',
    dateEarned: '2020-05-15',
    level: 'bronze',
    unlocked: true,
  },
  {
    id: 2,
    name: 'Regular Donor',
    description: 'Donated blood 5 times',
    icon: <HistoryOutlined />,
    color: '#722ed1',
    dateEarned: '2021-08-20',
    level: 'silver',
    unlocked: true,
  },
  {
    id: 3,
    name: 'Life Saver',
    description: 'Potentially saved 30 lives through donations',
    icon: <MedicineBoxOutlined />,
    color: '#13c2c2',
    dateEarned: '2022-11-05',
    level: 'gold',
    unlocked: true,
  },
  {
    id: 4,
    name: 'Dedicated Donor',
    description: 'Donated blood 10 times',
    icon: <TrophyOutlined />,
    color: '#fa8c16',
    dateEarned: '2023-07-12',
    level: 'gold',
    unlocked: true,
  },
  {
    id: 5,
    name: 'Emergency Responder',
    description: 'Responded to an emergency blood request',
    icon: <ThunderboltOutlined />,
    color: '#eb2f96',
    dateEarned: '2023-03-30',
    level: 'silver',
    unlocked: true,
  },
  {
    id: 6,
    name: 'Blood Type Expert',
    description: 'Completed the blood type compatibility quiz',
    icon: <SafetyOutlined />,
    color: '#52c41a',
    dateEarned: '2022-05-10',
    level: 'bronze',
    unlocked: true,
  },
  {
    id: 7,
    name: 'Blood Advocate',
    description: 'Invited 5 friends to donate blood',
    icon: <TeamOutlined />,
    color: '#1890ff',
    dateEarned: '2023-08-20',
    level: 'silver',
    unlocked: true,
  },
  {
    id: 8,
    name: 'Consistency Champion',
    description: 'Donated blood every eligible period for 1 year',
    icon: <CalendarOutlined />,
    color: '#faad14',
    level: 'platinum',
    unlocked: false,
  },
  {
    id: 9,
    name: 'Platinum Donor',
    description: 'Reached 20 blood donations',
    icon: <CrownOutlined />,
    color: '#d3adf7',
    level: 'platinum',
    unlocked: false,
  },
  {
    id: 10,
    name: 'Community Hero',
    description: 'Achieved top 10 donor status in your area',
    icon: <StarOutlined />,
    color: '#f759ab',
    level: 'diamond',
    unlocked: false,
  },
];

// Mock certificates data
const mockCertificates = [
  {
    id: 1,
    title: 'Certificate of Appreciation',
    description: 'For contributing to the community blood drive',
    issuer: 'City General Hospital',
    issueDate: '2022-12-15',
    imageUrl: '/images/certificate1.jpg',
  },
  {
    id: 2,
    title: 'Bronze Donor Recognition',
    description: 'For completing 5 blood donations',
    issuer: 'National Blood Center',
    issueDate: '2021-08-20',
    imageUrl: '/images/certificate2.jpg',
  },
  {
    id: 3,
    title: 'Silver Donor Recognition',
    description: 'For completing 10 blood donations',
    issuer: 'National Blood Center',
    issueDate: '2023-07-12',
    imageUrl: '/images/certificate3.jpg',
  },
];

// Mock timeline events
const mockTimelineEvents = [
  {
    date: '2023-11-10',
    title: 'Whole Blood Donation',
    description: 'Donated 450mL at City General Hospital',
    type: 'donation',
  },
  {
    date: '2023-08-20',
    title: 'Earned "Blood Advocate" Badge',
    description: 'For inviting 5 friends to donate blood',
    type: 'badge',
  },
  {
    date: '2023-07-12',
    title: 'Earned "Dedicated Donor" Badge',
    description: 'For completing 10 blood donations',
    type: 'badge',
  },
  {
    date: '2023-07-12',
    title: 'Received "Silver Donor Recognition" Certificate',
    description: 'From National Blood Center',
    type: 'certificate',
  },
  {
    date: '2023-05-05',
    title: 'Whole Blood Donation',
    description: 'Donated 450mL at Community Blood Drive',
    type: 'donation',
  },
  {
    date: '2023-03-30',
    title: 'Earned "Emergency Responder" Badge',
    description: 'For responding to an emergency blood request',
    type: 'badge',
  },
  {
    date: '2023-02-01',
    title: 'Whole Blood Donation',
    description: 'Donated 450mL at City General Hospital',
    type: 'donation',
  },
];

export default function AchievementsPage() {
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('badges');

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'bronze':
        return '#cd7f32';
      case 'silver':
        return '#c0c0c0';
      case 'gold':
        return '#ffd700';
      case 'platinum':
        return '#e5e4e2';
      case 'diamond':
        return '#b9f2ff';
      default:
        return '#d9d9d9';
    }
  };

  const getLevelTitle = (level: number) => {
    switch (level) {
      case 1:
        return 'Novice Donor';
      case 2:
        return 'Regular Donor';
      case 3:
        return 'Dedicated Donor';
      case 4:
        return 'Expert Donor';
      case 5:
        return 'Master Donor';
      default:
        return 'Blood Donor';
    }
  };

  // Group badges by unlocked status
  const unlockedBadges = mockBadges.filter(badge => badge.unlocked);
  const lockedBadges = mockBadges.filter(badge => !badge.unlocked);

  // Define tab items for Tabs component
  const tabItems = [
    {
      key: 'badges',
      label: (
        <span>
          <TrophyOutlined />
          Badges ({unlockedBadges.length}/{mockBadges.length})
        </span>
      ),
      children: (
        <>
          <div className="mb-6">
            <Title level={4}>Unlocked Badges</Title>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {unlockedBadges.map(badge => (
                <Card 
                  key={badge.id} 
                  className="text-center hover:shadow-md transition-shadow"
                  bodyStyle={{ padding: '16px' }}
                >
                  <div 
                    className="mx-auto mb-3 flex items-center justify-center rounded-full w-16 h-16"
                    style={{ backgroundColor: getBadgeColor(badge.level), color: 'white' }}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                  </div>
                  <div className="mb-2">
                    <Text strong className="text-lg">{badge.name}</Text>
                    <Tag color="blue" className="ml-2">{badge.level}</Tag>
                  </div>
                  <Text className="block text-gray-500 mb-2" ellipsis={{ tooltip: badge.description }}>
                    {badge.description}
                  </Text>
                  <Text className="block text-xs text-gray-400">
                    Earned on {dayjs(badge.dateEarned).format('MMM D, YYYY')}
                  </Text>
                </Card>
              ))}
            </div>
          </div>
          
          <Divider />
          
          <div>
            <Title level={4}>Badges to Unlock</Title>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {lockedBadges.map(badge => (
                <Card 
                  key={badge.id} 
                  className="text-center hover:shadow-md transition-shadow bg-gray-50"
                  bodyStyle={{ padding: '16px', opacity: 0.7 }}
                >
                  <div 
                    className="mx-auto mb-3 flex items-center justify-center rounded-full w-16 h-16 bg-gray-300"
                  >
                    <span className="text-2xl text-gray-500">{badge.icon}</span>
                  </div>
                  <div className="mb-2">
                    <Text strong className="text-lg">{badge.name}</Text>
                    <Tag color="default" className="ml-2">{badge.level}</Tag>
                  </div>
                  <Text className="block text-gray-500 mb-1">
                    {badge.description}
                  </Text>
                  <Button type="link" size="small">How to unlock</Button>
                </Card>
              ))}
            </div>
          </div>
        </>
      ),
    },
    {
      key: 'certificates',
      label: (
        <span>
          <AuditOutlined />
          Certificates ({mockCertificates.length})
        </span>
      ),
      children: (
        mockCertificates.length > 0 ? (
          <Row gutter={[16, 16]}>
            {mockCertificates.map(certificate => (
              <Col xs={24} md={12} key={certificate.id}>
                <Card 
                  className="shadow-sm hover:shadow-md transition-shadow"
                  cover={
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <AuditOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />
                    </div>
                  }
                  actions={[
                    <Button key="view" type="link" icon={<EyeOutlined />}>View</Button>,
                    <Button key="download" type="link" icon={<DownloadOutlined />}>Download</Button>,
                    <Button key="share" type="link" icon={<ShareAltOutlined />}>Share</Button>,
                  ]}
                >
                  <Card.Meta
                    title={certificate.title}
                    description={
                      <div>
                        <Text className="block text-gray-500 mb-2">{certificate.description}</Text>
                        <Text className="block text-gray-500">
                          Issued by {certificate.issuer} on {dayjs(certificate.issueDate).format('MMM D, YYYY')}
                        </Text>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="No certificates yet. Keep donating to earn certificates!" />
        )
      ),
    },
    {
      key: 'timeline',
      label: (
        <span>
          <HistoryOutlined />
          Timeline
        </span>
      ),
      children: (
        <Timeline mode="left" className="mt-4">
          {mockTimelineEvents.map((event, index) => {
            let color, icon;
            switch (event.type) {
              case 'donation':
                color = 'red';
                icon = <HeartOutlined />;
                break;
              case 'badge':
                color = 'gold';
                icon = <TrophyOutlined />;
                break;
              case 'certificate':
                color = 'blue';
                icon = <AuditOutlined />;
                break;
              default:
                color = 'gray';
                icon = <CalendarOutlined />;
            }
            
            return (
              <Timeline.Item 
                key={index} 
                color={color}
                label={dayjs(event.date).format('MMM D, YYYY')}
                dot={icon}
              >
                <div className="mb-1 font-medium">{event.title}</div>
                <div className="text-gray-500 text-sm">{event.description}</div>
              </Timeline.Item>
            );
          })}
        </Timeline>
      ),
    },
    {
      key: 'statistics',
      label: (
        <span>
          <BarChartOutlined />
          Statistics
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Donation Frequency" className="shadow-sm">
              <div className="h-64 flex items-center justify-center bg-gray-100">
                <Text className="text-gray-500">Donation frequency chart would be displayed here</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Donation by Type" className="shadow-sm">
              <div className="h-64 flex items-center justify-center bg-gray-100">
                <Text className="text-gray-500">Donation type chart would be displayed here</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24}>
            <Card title="Yearly Contribution" className="shadow-sm">
              <div className="h-64 flex items-center justify-center bg-gray-100">
                <Text className="text-gray-500">Yearly contribution chart would be displayed here</Text>
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'rewards',
      label: (
        <span>
          <GiftOutlined />
          Rewards
        </span>
      ),
      children: (
        <>
          <Alert
            message="Reward Program"
            description="Our donation reward program allows you to earn points for each donation. These points can be redeemed for various rewards, including gift cards, merchandise, and special recognition."
            type="info"
            showIcon
            className="mb-6"
          />
          
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card className="shadow-sm text-center">
                <Statistic 
                  title="Your Reward Points" 
                  value={600} 
                  prefix={<GiftOutlined className="text-red-500" />}
                  className="mb-4"
                />
                <Button type="primary" className="bg-red-600 hover:bg-red-700">
                  Redeem Points
                </Button>
              </Card>
            </Col>
            <Col xs={24} md={16}>
              <Card title="Available Rewards" className="shadow-sm">
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    { title: 'Coffee Shop Gift Card', points: 500, available: true },
                    { title: 'Blood Donor T-shirt', points: 800, available: false },
                    { title: 'Movie Tickets', points: 1000, available: false },
                    { title: 'Premium Donor Badge', points: 1500, available: false },
                  ]}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        item.available ? 
                        <Button type="primary" size="small" className="bg-red-600 hover:bg-red-700">
                          Redeem
                        </Button> : 
                        <Button type="default" size="small" disabled>
                          {item.points} points
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={item.title}
                        description={`${item.points} reward points required`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </>
      ),
    }
  ];

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
          <Title level={2}>
            <TrophyOutlined className="mr-2 text-yellow-500" />
            My Achievements
          </Title>
          <Paragraph className="text-gray-500">
            Track your blood donation journey, badges, and impact
          </Paragraph>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <Card className="shadow-md mb-4 text-center">
              <Avatar 
                size={80} 
                icon={<UserOutlined />} 
                src="/images/avatar.jpg"
                className="mb-4"
              />
              <Title level={3}>{mockUserData.name}</Title>
              <Tag color="red" className="mb-3">{mockUserData.bloodType}</Tag>
              
              <div className="mb-4">
                <Text className="text-lg font-semibold">{getLevelTitle(mockUserData.level)}</Text>
                <div className="flex items-center justify-center mt-2">
                  <Text className="text-gray-500">Level {mockUserData.level}</Text>
                  <Progress 
                    percent={mockUserData.levelProgress} 
                    size="small" 
                    status="active" 
                    className="mx-2 w-24" 
                  />
                  <Text className="text-gray-500">Level {mockUserData.level + 1}</Text>
                </div>
                <Text className="block text-sm text-gray-500 mt-1">
                  {mockUserData.pointsToNextLevel} more donation{mockUserData.pointsToNextLevel > 1 ? 's' : ''} to next level
                </Text>
              </div>
              
              <Divider />
              
              <Row gutter={[8, 16]}>
                <Col span={12}>
                  <Statistic 
                    title="Donations" 
                    value={mockUserData.totalDonations} 
                    prefix={<HeartOutlined className="text-red-500" />} 
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="Lives Saved" 
                    value={mockUserData.savesCount} 
                    prefix={<SafetyOutlined className="text-green-500" />} 
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="Badges" 
                    value={unlockedBadges.length} 
                    prefix={<TrophyOutlined className="text-yellow-500" />} 
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="Streak" 
                    value={`${mockUserData.streak} quarters`} 
                    prefix={<FireOutlined className="text-orange-500" />} 
                  />
                </Col>
              </Row>
              
              <Divider />
              
              <div>
                <Text strong>Your Ranking</Text>
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <Text className="text-gray-500">Local</Text>
                    <div className="text-lg font-semibold">#{mockUserData.ranking.local}</div>
                  </div>
                  <Divider type="vertical" style={{ height: '30px' }} />
                  <div>
                    <Text className="text-gray-500">National</Text>
                    <div className="text-lg font-semibold">#{mockUserData.ranking.national}</div>
                  </div>
                </div>
              </div>
              
              <Divider />
              
              <Button 
                type="primary" 
                icon={<ShareAltOutlined />} 
                size="large" 
                className="bg-blue-600 hover:bg-blue-700 w-full"
              >
                Share My Achievements
              </Button>
            </Card>
            
            <Card className="shadow-md" title="Your Impact">
              <div className="flex justify-between mb-4">
                <Statistic 
                  title="Total Blood Donated" 
                  value={mockUserData.totalVolume} 
                  suffix="mL"
                  className="text-center"
                />
              </div>
              
              <Divider>Your donations have helped</Divider>
              
              <List
                itemLayout="horizontal"
                dataSource={[
                  { type: 'Accident Victims', count: mockUserData.impactStats.accidents, icon: <ThunderboltOutlined style={{ color: '#f5222d' }} /> },
                  { type: 'Surgery Patients', count: mockUserData.impactStats.surgeries, icon: <MedicineBoxOutlined style={{ color: '#1890ff' }} /> },
                  { type: 'Cancer Patients', count: mockUserData.impactStats.cancer, icon: <SafetyOutlined style={{ color: '#722ed1' }} /> },
                  { type: 'Other Medical Needs', count: mockUserData.impactStats.other, icon: <HeartOutlined style={{ color: '#52c41a' }} /> },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={item.icon} style={{ backgroundColor: 'white' }} />}
                      title={item.type}
                      description={`${item.count} patient${item.count > 1 ? 's' : ''}`}
                    />
                    <div className="text-right">
                      <Progress
                        percent={Math.round((item.count / mockUserData.totalDonations) * 100)}
                        size="small"
                        showInfo={false}
                        strokeColor={
                          item.type === 'Accident Victims' ? '#f5222d' :
                          item.type === 'Surgery Patients' ? '#1890ff' :
                          item.type === 'Cancer Patients' ? '#722ed1' : '#52c41a'
                        }
                      />
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          
          <Col xs={24} lg={16}>
            <Card className="shadow-md">
              <Tabs 
                activeKey={activeTab} 
                onChange={(key) => setActiveTab(key)}
                size="large"
                tabBarStyle={{ marginBottom: '24px' }}
                items={tabItems}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
} 