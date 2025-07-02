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

export interface NotificationCountResponse {
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
  data: number;
  count: number;
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
    // Build query params properly, excluding undefined values
    const queryParams: Record<string, string | number | boolean> = {};

    if (params.pageNumber !== undefined) {
      queryParams.PageNumber = params.pageNumber;
    }

    if (params.pageSize !== undefined) {
      queryParams.PageSize = params.pageSize;
    }

    if (params.type !== undefined && params.type !== null) {
      queryParams.Type = params.type;
    }

    if (params.isRead !== undefined) {
      queryParams.IsRead = params.isRead;
    }

    if (params.sortBy !== undefined) {
      queryParams.SortBy = params.sortBy;
    }

    if (params.sortAscending !== undefined) {
      queryParams.SortAscending = params.sortAscending;
    }

    console.log(`Fetching notifications for user ${params.userId} with params:`, queryParams);

    const response = await apiClient.get<NotificationsResponse>(
      `/Notifications/user/${params.userId}/paged`, { params: queryParams }
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
 * Gets the count of unread notifications for a user
 */
export const getUnreadCount = async (userId: string): Promise<NotificationCountResponse> => {
  try {
    const response = await apiClient.get<NotificationCountResponse>(`/Notifications/user/${userId}/unread/count`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as NotificationCountResponse;
    }
    throw error;
  }
};

/**
 * Marks a notification as read
 */
export const markAsRead = async (notificationId: string): Promise<any> => {
  try {
    const response = await apiClient.post(`/Notifications/${notificationId}/mark-read`);
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
    const response = await apiClient.post(`/Notifications/user/${userId}/mark-all-read`);
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
    const response = await apiClient.delete(`/Notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    }
    throw error;
  }
}; 