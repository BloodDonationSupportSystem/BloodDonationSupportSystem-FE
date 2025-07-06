'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Card, List, Badge, Spin, Empty, Button, Tabs, App } from 'antd';
import { BellOutlined, CheckOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { notificationsService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import NotificationContent from '@/components/NotificationContent';

// Register dayjs plugins
dayjs.extend(relativeTime);

const { Title } = Typography;

export default function NotificationsPage() {
    const { user } = useAuth();
    const { message } = App.useApp();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('all');
    const [markingAsRead, setMarkingAsRead] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const response = await notificationsService.getNotifications({
                userId: user.id,
                pageSize: 100, // Get a large number to show all
                pageNumber: 1,
                sortBy: 'createdTime',
                sortAscending: false
            });

            if (response.success) {
                setNotifications(response.data);
            } else {
                setError(response.message || 'Failed to fetch notifications');
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('An error occurred while fetching notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            setMarkingAsRead(true);
            const response = await notificationsService.markAsRead(notificationId);

            if (response.success) {
                // Update the notification in the local state
                setNotifications(prevNotifications =>
                    prevNotifications.map(notification =>
                        notification.id === notificationId
                            ? { ...notification, isRead: true }
                            : notification
                    )
                );
                message.success('Notification marked as read');
            } else {
                message.error('Failed to mark notification as read');
            }
        } catch (err) {
            console.error('Error marking notification as read:', err);
            message.error('An error occurred while marking notification as read');
        } finally {
            setMarkingAsRead(false);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user?.id) return;

        try {
            setMarkingAsRead(true);
            const response = await notificationsService.markAllAsRead(user.id);

            if (response.success) {
                // Update all notifications in the local state
                setNotifications(prevNotifications =>
                    prevNotifications.map(notification => ({ ...notification, isRead: true }))
                );
                message.success('All notifications marked as read');
            } else {
                message.error('Failed to mark all notifications as read');
            }
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
            message.error('An error occurred while marking all notifications as read');
        } finally {
            setMarkingAsRead(false);
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return !notification.isRead;
        if (activeTab === 'read') return notification.isRead;
        return true;
    });

    const getNotificationIcon = (type: string) => {
        if (type.toLowerCase().includes('appointment')) return <ClockCircleOutlined style={{ fontSize: '20px' }} />;
        return <BellOutlined style={{ fontSize: '20px' }} />;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" tip="Loading notifications..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <Empty
                        description={
                            <span>
                                Error loading notifications: {error}
                                <br />
                                <Button type="primary" onClick={fetchNotifications} className="mt-4">
                                    Try Again
                                </Button>
                            </span>
                        }
                    />
                </Card>
            </div>
        );
    }

    const unreadCount = notifications.filter(notification => !notification.isRead).length;

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <Title level={2}>Notifications</Title>
                {unreadCount > 0 && (
                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={handleMarkAllAsRead}
                        loading={markingAsRead}
                    >
                        Mark All as Read
                    </Button>
                )}
            </div>

            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    className="mb-4"
                    items={[
                        {
                            key: 'all',
                            label: `All (${notifications.length})`,
                        },
                        {
                            key: 'unread',
                            label: `Unread (${unreadCount})`,
                        },
                        {
                            key: 'read',
                            label: `Read (${notifications.length - unreadCount})`,
                        },
                    ]}
                />

                {filteredNotifications.length === 0 ? (
                    <Empty description="No notifications found" />
                ) : (
                    <List
                        itemLayout="vertical"
                        dataSource={filteredNotifications}
                        renderItem={item => (
                            <List.Item
                                actions={[
                                    !item.isRead && (
                                        <Button
                                            key="mark-read"
                                            size="small"
                                            onClick={() => handleMarkAsRead(item.id)}
                                            loading={markingAsRead}
                                        >
                                            Mark as Read
                                        </Button>
                                    )
                                ].filter(Boolean)}
                                className={!item.isRead ? 'bg-blue-50' : ''}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Badge dot={!item.isRead} color="red">
                                            {getNotificationIcon(item.type)}
                                        </Badge>
                                    }
                                    title={
                                        <div className="flex items-center justify-between">
                                            <span>{item.type}</span>
                                            <span className="text-xs text-gray-400">{dayjs(item.createdTime).format('MMM D, YYYY h:mm A')}</span>
                                        </div>
                                    }
                                    description={dayjs(item.createdTime).fromNow()}
                                />
                                <div className="mt-2">
                                    <NotificationContent htmlContent={item.message} />
                                </div>
                            </List.Item>
                        )}
                    />
                )}
            </Card>
        </div>
    );
} 