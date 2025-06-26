import apiClient from './apiConfig';
import axios from 'axios';

export interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  userId: string;
  userName: string;
  createdTime: string;
  lastUpdatedTime: string;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
  data: Notification[];
  count: number;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface NotificationsParams {
  userId: string;
  pageNumber?: number;
  pageSize?: number;
  type?: string;
  isRead?: boolean;
  sortBy?: string;
  sortAscending?: boolean;
}

/**
 * Fetches paginated notifications for a user
 */
export const getNotifications = async (params: NotificationsParams): Promise<NotificationsResponse> => {
  try {
    const response = await apiClient.get<NotificationsResponse>(
      `/notifications/user/${params.userId}/paged`, {
        params: {
          PageNumber: params.pageNumber || 1,
          PageSize: params.pageSize || 10,
          Type: params.type || undefined,
          IsRead: params.isRead !== undefined ? params.isRead : undefined,
          SortBy: params.sortBy || 'createdTime',
          SortAscending: params.sortAscending !== undefined ? params.sortAscending : false,
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as NotificationsResponse;
    }
    throw error;
  }
};

/**
 * Marks a notification as read
 */
export const markAsRead = async (notificationId: string): Promise<any> => {
  try {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    }
    throw error;
  }
};

/**
 * Marks all notifications as read for a user
 */
export const markAllAsRead = async (userId: string): Promise<any> => {
  try {
    const response = await apiClient.put(`/notifications/user/${userId}/read-all`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    }
    throw error;
  }
};

/**
 * Deletes a notification
 */
export const deleteNotification = async (notificationId: string): Promise<any> => {
  try {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    }
    throw error;
  }
}; 