import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import * as notificationsService from '@/services/api/notificationsService';
import { Notification, NotificationsParams, NotificationsResponse } from '@/services/api/notificationsService';

export const useNotifications = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const fetchNotifications = async (params: NotificationsParams) => {
    if (!params.userId) {
      setError('User ID is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await notificationsService.getNotifications(params);

      if (response.success) {
        setNotifications(response.data);
        setPagination({
          totalCount: response.totalCount,
          pageNumber: response.pageNumber,
          pageSize: response.pageSize,
          totalPages: response.totalPages,
          hasPreviousPage: response.hasPreviousPage,
          hasNextPage: response.hasNextPage,
        });
        return response;
      } else {
        setError(response.message || 'Failed to fetch notifications');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching notifications';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async (userId: string) => {
    if (!userId) {
      setError('User ID is required');
      return null;
    }

    try {
      const response = await notificationsService.getUnreadCount(userId);

      if (response.success) {
        setUnreadCount(response.data);
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch unread count');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching unread count';
      setError(errorMessage);
      return null;
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await notificationsService.markAsRead(notificationId);

      if (response.success) {
        // Update the local state
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        return response;
      } else {
        setError(response.message || 'Failed to mark notification as read');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async (userId: string) => {
    if (!userId) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await notificationsService.markAllAsRead(userId);

      if (response.success) {
        // Update the local state
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0); // Reset unread count to zero
        return response;
      } else {
        setError(response.message || 'Failed to mark all notifications as read');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await notificationsService.deleteNotification(notificationId);

      if (response.success) {
        // Update the local state
        const deletedNotification = notifications.find(n => n.id === notificationId);
        setNotifications(prev =>
          prev.filter(notif => notif.id !== notificationId)
        );

        // If the deleted notification was unread, decrement the unread count
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }

        return response;
      } else {
        setError(response.message || 'Failed to delete notification');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    notifications,
    pagination,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}; 