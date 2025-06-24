'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Typography, 
  Card, 
  Spin, 
  List, 
  Tag, 
  Button, 
  Space, 
  Tabs, 
  Badge, 
  Switch, 
  Empty, 
  Divider, 
  Dropdown, 
  Menu, 
  Form, 
  Checkbox, 
  Radio, 
  Modal,
  TimePicker
} from 'antd';
import { 
  BellOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  WarningOutlined, 
  InfoCircleOutlined,
  DeleteOutlined,
  SettingOutlined,
  FilterOutlined,
  ExclamationCircleOutlined,
  HeartOutlined,
  CalendarOutlined,
  TrophyOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  MailOutlined,
  PhoneOutlined,
  NotificationOutlined,
  MoreOutlined,
  ReadOutlined,
  UnorderedListOutlined,
  CheckOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Paragraph, Text } = Typography;
const { confirm } = Modal;

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    type: 'reminder',
    title: 'Eligible to donate again',
    message: "You're now eligible to donate blood again. Schedule your next donation!",
    date: '2023-12-08T09:30:00',
    read: false,
    actionLink: '/member/appointments',
    actionText: 'Schedule Now',
    icon: <HeartOutlined />,
    category: 'donation',
  },
  {
    id: 2,
    type: 'appointment',
    title: 'Appointment Reminder',
    message: "Your blood donation appointment is tomorrow at 10:00 AM at Central Blood Bank.",
    date: '2023-12-06T14:15:00',
    read: false,
    actionLink: '/member/appointments',
    actionText: 'View Details',
    icon: <CalendarOutlined />,
    category: 'appointment',
  },
  {
    id: 3,
    type: 'achievement',
    title: 'New Badge Earned',
    message: "Congratulations! You've earned the 'Dedicated Donor' badge for your 10th donation.",
    date: '2023-12-05T11:45:00',
    read: true,
    actionLink: '/member/achievements',
    actionText: 'View Badge',
    icon: <TrophyOutlined />,
    category: 'achievement',
  },
  {
    id: 4,
    type: 'request',
    title: 'Urgent Blood Need',
    message: "There's an urgent need for A+ blood at City Hospital, 5km from your location.",
    date: '2023-12-04T08:20:00',
    read: true,
    actionLink: '/member/emergency-request/details/123',
    actionText: 'Respond',
    icon: <MedicineBoxOutlined />,
    category: 'emergency',
    urgent: true,
  },
  {
    id: 5,
    type: 'donor_match',
    title: 'Donor Match Found',
    message: "Your blood request has been matched with 3 potential donors.",
    date: '2023-12-03T16:30:00',
    read: true,
    actionLink: '/member/my-requests',
    actionText: 'View Request',
    icon: <TeamOutlined />,
    category: 'request',
  },
  {
    id: 6,
    type: 'donation_complete',
    title: 'Donation Complete',
    message: "Thank you for your donation today! You've potentially saved 3 lives.",
    date: '2023-12-01T11:20:00',
    read: true,
    actionLink: '/member/donation-history',
    actionText: 'View History',
    icon: <CheckCircleOutlined />,
    category: 'donation',
  },
  {
    id: 7,
    type: 'health_reminder',
    title: 'Health Check Reminder',
    message: "It's time for your quarterly health check to ensure you're in optimal condition for donations.",
    date: '2023-11-28T09:45:00',
    read: true,
    actionLink: '/member/health-tracker',
    actionText: 'Schedule Check',
    icon: <MedicineBoxOutlined />,
    category: 'health',
  },
  {
    id: 8,
    type: 'community',
    title: 'New Community Event',
    message: "Join our blood donation drive this weekend at City Hall, 10AM-4PM.",
    date: '2023-11-25T14:10:00',
    read: true,
    actionLink: '/events/blood-drive-2023',
    actionText: 'View Event',
    icon: <TeamOutlined />,
    category: 'event',
  },
];

// Mock notification settings
const mockNotificationSettings = {
  email: true,
  sms: true,
  push: true,
  categories: {
    appointment: true,
    donation: true,
    emergency: true,
    achievement: true,
    request: true,
    health: true,
    event: true,
  },
  schedule: {
    doNotDisturb: false,
    startTime: '22:00',
    endTime: '08:00',
  },
};

export default function NotificationsPage() {
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState(mockNotifications);
  const [notificationSettings, setNotificationSettings] = useState(mockNotificationSettings);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);

  // Initialize settings form values
  useEffect(() => {
    form.setFieldsValue({
      emailNotifications: notificationSettings.email,
      smsNotifications: notificationSettings.sms,
      pushNotifications: notificationSettings.push,
      categories: Object.keys(notificationSettings.categories).filter(
        key => notificationSettings.categories[key as keyof typeof notificationSettings.categories]
      ),
      doNotDisturb: notificationSettings.schedule.doNotDisturb,
      quietHours: [
        notificationSettings.schedule.startTime,
        notificationSettings.schedule.endTime,
      ],
    });
  }, [form, notificationSettings]);

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== id)
    );
  };

  const clearAllNotifications = () => {
    confirm({
      title: 'Are you sure you want to clear all notifications?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      onOk() {
        setNotifications([]);
      },
    });
  };

  const showSettingsModal = () => {
    setSettingsModalVisible(true);
  };

  const handleSettingsCancel = () => {
    setSettingsModalVisible(false);
    form.resetFields();
  };

  const handleSettingsSave = (values: any) => {
    console.log('Settings values:', values);
    
    // Create updated settings object
    const updatedSettings = {
      email: values.emailNotifications,
      sms: values.smsNotifications,
      push: values.pushNotifications,
      categories: {
        appointment: values.categories.includes('appointment'),
        donation: values.categories.includes('donation'),
        emergency: values.categories.includes('emergency'),
        achievement: values.categories.includes('achievement'),
        request: values.categories.includes('request'),
        health: values.categories.includes('health'),
        event: values.categories.includes('event'),
      },
      schedule: {
        doNotDisturb: values.doNotDisturb,
        startTime: values.quietHours?.[0] || '22:00',
        endTime: values.quietHours?.[1] || '08:00',
      },
    };
    
    setNotificationSettings(updatedSettings);
    setSettingsModalVisible(false);
  };

  const getNotificationColor = (category: string, urgent: boolean = false) => {
    if (urgent) return 'red';
    
    switch (category) {
      case 'appointment':
        return 'blue';
      case 'donation':
        return 'green';
      case 'emergency':
        return 'red';
      case 'achievement':
        return 'gold';
      case 'request':
        return 'purple';
      case 'health':
        return 'cyan';
      case 'event':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <ClockCircleOutlined />;
      case 'appointment':
        return <CalendarOutlined />;
      case 'achievement':
        return <TrophyOutlined />;
      case 'request':
        return <MedicineBoxOutlined />;
      case 'donor_match':
        return <TeamOutlined />;
      case 'donation_complete':
        return <CheckCircleOutlined />;
      case 'health_reminder':
        return <MedicineBoxOutlined />;
      case 'community':
        return <TeamOutlined />;
      default:
        return <BellOutlined />;
    }
  };

  // Filter notifications based on tab
  const getFilteredNotifications = () => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'unread') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.category === activeTab);
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  // Define tab items for Tabs component
  const tabItems = [
    {
      key: 'all',
      label: <span><UnorderedListOutlined /> All</span>,
    },
    {
      key: 'unread',
      label: <span><BellOutlined /> Unread</span>,
    },
    {
      key: 'appointment',
      label: <span><CalendarOutlined /> Appointments</span>,
    },
    {
      key: 'donation',
      label: <span><HeartOutlined /> Donations</span>,
    },
    {
      key: 'emergency',
      label: <span><MedicineBoxOutlined /> Emergency</span>,
    },
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
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <Title level={2}>
              <BellOutlined className="mr-2" />
              Notifications
            </Title>
            <Paragraph className="text-gray-500">
              Stay updated with your donation activities and important alerts
            </Paragraph>
          </div>
          
          <div className="flex mt-4 md:mt-0">
            <Button 
              icon={<SettingOutlined />} 
              onClick={showSettingsModal}
              className="mr-2"
            >
              Settings
            </Button>
            <Dropdown
              menu={{
                items: [
                  {
                    key: '1',
                    label: 'Mark all as read',
                    icon: <CheckOutlined />,
                    onClick: markAllAsRead,
                    disabled: unreadCount === 0,
                  },
                  {
                    key: '2',
                    label: 'Clear all notifications',
                    icon: <DeleteOutlined />,
                    onClick: clearAllNotifications,
                    danger: true,
                    disabled: notifications.length === 0,
                  },
                ],
              }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button icon={<MoreOutlined />} />
            </Dropdown>
          </div>
        </div>

        <Card className="shadow-md">
          <Tabs 
            activeKey={activeTab} 
            onChange={(key) => setActiveTab(key)}
            items={tabItems}
            tabBarExtraContent={
              <Badge count={unreadCount} offset={[-5, 5]}>
                <span className="text-sm text-gray-500 mr-2">
                  {unreadCount} unread
                </span>
              </Badge>
            }
          />
          
          {filteredNotifications.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={filteredNotifications}
              renderItem={item => (
                <List.Item
                  className={`transition-all duration-200 ${!item.read ? 'bg-blue-50' : ''}`}
                  actions={[
                    <Space key="actions">
                      {!item.read && (
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<ReadOutlined />} 
                          onClick={() => markAsRead(item.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                      <Button 
                        type="text" 
                        size="small" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => deleteNotification(item.id)}
                      />
                    </Space>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge 
                        dot={!item.read} 
                        color={item.urgent ? 'red' : 'blue'}
                        offset={[-3, 3]}
                      >
                        <div 
                          className="flex items-center justify-center w-10 h-10 rounded-full text-white"
                          style={{ backgroundColor: getNotificationColor(item.category, item.urgent) }}
                        >
                          {getNotificationIcon(item.type)}
                        </div>
                      </Badge>
                    }
                    title={
                      <div className="flex items-center">
                        <span className={`${!item.read ? 'font-semibold' : ''}`}>
                          {item.title}
                        </span>
                        {item.urgent && (
                          <Tag color="red" className="ml-2">Urgent</Tag>
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <div className="text-gray-600 mb-1">{item.message}</div>
                        <div className="flex items-center justify-between">
                          <Text type="secondary" className="text-xs">
                            {dayjs(item.date).fromNow()}
                          </Text>
                          {item.actionLink && (
                            <Link href={item.actionLink}>
                              <Button type="link" size="small" className="p-0">
                                {item.actionText}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description={
                <span>
                  No notifications {
                    activeTab !== 'all' ? `in ${activeTab === 'unread' ? 'unread' : activeTab} category` : ''
                  }
                </span>
              }
            />
          )}
        </Card>

        {/* Notification Settings Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <SettingOutlined className="mr-2" />
              <span>Notification Settings</span>
            </div>
          }
          open={settingsModalVisible}
          onCancel={handleSettingsCancel}
          footer={[
            <Button key="cancel" onClick={handleSettingsCancel}>
              Cancel
            </Button>,
            <Button 
              key="save" 
              type="primary" 
              onClick={() => form.submit()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Settings
            </Button>,
          ]}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSettingsSave}
          >
            <div className="mb-4">
              <Title level={5}>Notification Channels</Title>
              <Paragraph className="text-gray-500">
                Choose how you want to receive notifications
              </Paragraph>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item 
                  name="emailNotifications" 
                  valuePropName="checked"
                >
                  <Checkbox>
                    <Space>
                      <MailOutlined />
                      <span>Email</span>
                    </Space>
                  </Checkbox>
                </Form.Item>
                
                <Form.Item 
                  name="smsNotifications" 
                  valuePropName="checked"
                >
                  <Checkbox>
                    <Space>
                      <PhoneOutlined />
                      <span>SMS</span>
                    </Space>
                  </Checkbox>
                </Form.Item>
                
                <Form.Item 
                  name="pushNotifications" 
                  valuePropName="checked"
                >
                  <Checkbox>
                    <Space>
                      <NotificationOutlined />
                      <span>Push</span>
                    </Space>
                  </Checkbox>
                </Form.Item>
              </div>
            </div>
            
            <Divider />
            
            <div className="mb-4">
              <Title level={5}>Notification Categories</Title>
              <Paragraph className="text-gray-500">
                Select the types of notifications you want to receive
              </Paragraph>
              <Form.Item name="categories">
                <Checkbox.Group className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Checkbox value="appointment">
                    <Space>
                      <CalendarOutlined />
                      <span>Appointment Reminders</span>
                    </Space>
                  </Checkbox>
                  <Checkbox value="donation">
                    <Space>
                      <HeartOutlined />
                      <span>Donation Eligibility</span>
                    </Space>
                  </Checkbox>
                  <Checkbox value="emergency">
                    <Space>
                      <MedicineBoxOutlined />
                      <span>Emergency Requests</span>
                    </Space>
                  </Checkbox>
                  <Checkbox value="achievement">
                    <Space>
                      <TrophyOutlined />
                      <span>Achievements & Badges</span>
                    </Space>
                  </Checkbox>
                  <Checkbox value="request">
                    <Space>
                      <TeamOutlined />
                      <span>Request Updates</span>
                    </Space>
                  </Checkbox>
                  <Checkbox value="health">
                    <Space>
                      <MedicineBoxOutlined />
                      <span>Health Reminders</span>
                    </Space>
                  </Checkbox>
                  <Checkbox value="event">
                    <Space>
                      <TeamOutlined />
                      <span>Community Events</span>
                    </Space>
                  </Checkbox>
                </Checkbox.Group>
              </Form.Item>
            </div>
            
            <Divider />
            
            <div>
              <Title level={5}>Quiet Hours</Title>
              <Paragraph className="text-gray-500">
                Set times when you don't want to receive notifications
              </Paragraph>
              <Form.Item 
                name="doNotDisturb" 
                valuePropName="checked"
              >
                <Switch />
                <span className="ml-2">Enable Do Not Disturb mode during specific hours</span>
              </Form.Item>
              
              <Form.Item 
                name="quietHours" 
                label="Quiet Hours"
                className="mb-0"
                tooltip="We won't send notifications during these hours except for emergency requests"
              >
                <TimePicker.RangePicker 
                  format="HH:mm"
                  className="w-full"
                  disabled={!form.getFieldValue('doNotDisturb')}
                />
              </Form.Item>
              <Text type="secondary" className="text-xs">
                * Emergency notifications will still be delivered during quiet hours
              </Text>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
} 