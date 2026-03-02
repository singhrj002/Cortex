/**
 * Notifications API module.
 * Handles notification retrieval, marking as read, and dismissing.
 */

import { apiClient } from './client';

export interface Notification {
  id: string;
  recipient_email: string;
  title: string;
  body: string;
  notification_type: 'decision' | 'task' | 'claim' | 'conflict';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  reason?: string;
  metadata?: Record<string, any>;
  is_read: boolean;
  is_dismissed: boolean;
  delivered_at?: string;
  read_at?: string;
  created_at: string;
  event_id?: string;
  decision_id?: string;
  task_id?: string;
  conflict_id?: string;
}

export interface NotificationsParams {
  user_email: string;
  unread_only?: boolean;
  limit?: number;
  offset?: number;
}

export const notificationsApi = {
  /**
   * Get notifications for a user
   */
  getNotifications: async (params: NotificationsParams): Promise<Notification[]> => {
    const response = await apiClient.get('/notifications/', { params });
    return response.data;
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (userEmail: string): Promise<{ user_email: string; unread_count: number }> => {
    const response = await apiClient.get('/notifications/unread-count', {
      params: { user_email: userEmail }
    });
    return response.data;
  },

  /**
   * Get a specific notification
   */
  getNotification: async (notificationId: string, userEmail: string): Promise<Notification> => {
    const response = await apiClient.get(`/notifications/${notificationId}`, {
      params: { user_email: userEmail }
    });
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: string, userEmail: string): Promise<Notification> => {
    const response = await apiClient.post(`/notifications/${notificationId}/read`, null, {
      params: { user_email: userEmail }
    });
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (userEmail: string): Promise<{ user_email: string; marked_read: number }> => {
    const response = await apiClient.post('/notifications/mark-all-read', null, {
      params: { user_email: userEmail }
    });
    return response.data;
  },

  /**
   * Dismiss notification
   */
  dismissNotification: async (notificationId: string, userEmail: string): Promise<{ status: string; notification_id: string }> => {
    const response = await apiClient.delete(`/notifications/${notificationId}`, {
      params: { user_email: userEmail }
    });
    return response.data;
  },

  /**
   * Get notifications by type
   */
  getNotificationsByType: async (
    notificationType: string,
    userEmail: string,
    limit = 50
  ): Promise<Notification[]> => {
    const response = await apiClient.get(`/notifications/by-type/${notificationType}`, {
      params: { user_email: userEmail, limit }
    });
    return response.data;
  },
};
