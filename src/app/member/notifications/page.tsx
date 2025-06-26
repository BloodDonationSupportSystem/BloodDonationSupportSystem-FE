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
  TimePicker,
  Pagination,
  message
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
import { useNotifications, NotificationsParams } from '@/hooks/api';

dayjs.extend(relativeTime);

const { Title, Paragraph, Text } = Typography;
const { confirm } = Modal;

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
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [notificationSettings, setNotificationSettings] = useState(mockNotificationSettings);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // Use our custom hook for notifications
  const { 
    notifications, 
    pagination, 
    loading: notificationsLoading, 
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, authLoading, router]);

  // Fetch notifications when component mounts or when activeTab changes
  useEffect(() => {
    if (user?.id) {
      let params: NotificationsParams = {
        userId: user.id,
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
      };

      // Add filter based on active tab
      if (activeTab === 'unread') {
        params = { ...params, isRead: false };
      } else if (activeTab !== 'all') {
        params = { ...params, type: activeTab };
      }

      fetchNotifications(params);
    }
  }, [user?.id, activeTab, pagination.pageNumber, pagination.pageSize]);

  // Show error message if API call fails
  useEffect(() => {
    if (error) {
      messageApi.error(error);
    }
  }, [error, messageApi]);

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

  const handleMarkAsRead = async (id: string) => {
    const result = await markAsRead(id);
    if (result) {
      messageApi.success('Notification marked as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    
    const result = await markAllAsRead(user.id);
    if (result) {
      messageApi.success('All notifications marked as read');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    const result = await deleteNotification(id);
    if (result) {
      messageApi.success('Notification deleted');
    }
  };

  const clearAllNotifications = () => {
    confirm({
      title: 'Are you sure you want to clear all notifications?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      onOk() {
        // This would need a backend API endpoint to clear all notifications
        messageApi.success('All notifications cleared');
      },
    });
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    if (!user?.id) return;
    
    fetchNotifications({
      userId: user.id,
      pageNumber: page,
      pageSize: pageSize || pagination.pageSize,
      isRead: activeTab === 'unread' ? false : undefined,
      type: activeTab !== 'all' && activeTab !== 'unread' ? activeTab : undefined,
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
    messageApi.success('Notification settings updated');
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

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

  if (authLoading) {
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
      {contextHolder}
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
                    onClick: handleMarkAllAsRead,
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
          
          {notificationsLoading ? (
            <div className="py-12 flex justify-center">
              <Spin size="large" />
            </div>
          ) : notifications.length > 0 ? (
            <>
              <List
                itemLayout="horizontal"
                dataSource={notifications}
                renderItem={item => (
                  <List.Item
                    className={`transition-all duration-200 ${!item.isRead ? 'bg-blue-50' : ''}`}
                    actions={[
                      <Space key="actions">
                        {!item.isRead && (
                          <Button 
                            type="text" 
                            size="small" 
                            icon={<ReadOutlined />} 
                            onClick={() => handleMarkAsRead(item.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                        <Button 
                          type="text" 
                          size="small" 
                          danger 
                          icon={<DeleteOutlined />} 
                          onClick={() => handleDeleteNotification(item.id)}
                        />
                      </Space>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge 
                          dot={!item.isRead} 
                          color="blue"
                          offset={[-3, 3]}
                        >
                          <div 
                            className="flex items-center justify-center w-10 h-10 rounded-full text-white"
                            style={{ backgroundColor: getNotificationColor(item.type) }}
                          >
                            {getNotificationIcon(item.type)}
                          </div>
                        </Badge>
                      }
                      title={
                        <div className="flex items-center">
                          <span className={`${!item.isRead ? 'font-semibold' : ''}`}>
                            {item.type}
                          </span>
                        </div>
                      }
                      description={
                        <div>
                          <div className="text-gray-600 mb-1">{item.message}</div>
                          <div className="flex items-center justify-between">
                            <Text type="secondary" className="text-xs">
                              {dayjs(item.createdTime).fromNow()}
                            </Text>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
              
              <div className="mt-4 flex justify-center">
                <Pagination
                  current={pagination.pageNumber}
                  pageSize={pagination.pageSize}
                  total={pagination.totalCount}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  hideOnSinglePage
                />
              </div>
            </>
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