/**
 * React Query hooks for notifications.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, Notification, NotificationsParams } from '../api/notifications';

export const NOTIFICATIONS_QUERY_KEY = 'notifications';

/**
 * Hook to fetch notifications for a user
 */
export function useNotifications(params: NotificationsParams) {
  return useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, params],
    queryFn: () => notificationsApi.getNotifications(params),
    enabled: !!params.user_email,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook to fetch unread notification count
 */
export function useUnreadCount(userEmail: string) {
  return useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, 'unread-count', userEmail],
    queryFn: () => notificationsApi.getUnreadCount(userEmail),
    enabled: !!userEmail,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

/**
 * Hook to fetch a specific notification
 */
export function useNotification(notificationId: string, userEmail: string) {
  return useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, notificationId, userEmail],
    queryFn: () => notificationsApi.getNotification(notificationId, userEmail),
    enabled: !!notificationId && !!userEmail,
  });
}

/**
 * Hook to mark notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ notificationId, userEmail }: { notificationId: string; userEmail: string }) =>
      notificationsApi.markAsRead(notificationId, userEmail),
    onSuccess: (data, variables) => {
      // Update notification in cache
      queryClient.setQueryData(
        [NOTIFICATIONS_QUERY_KEY, variables.notificationId, variables.userEmail],
        data
      );
      // Invalidate notifications list and unread count
      queryClient.invalidateQueries({
        queryKey: [NOTIFICATIONS_QUERY_KEY, { user_email: variables.userEmail }],
      });
      queryClient.invalidateQueries({
        queryKey: [NOTIFICATIONS_QUERY_KEY, 'unread-count', variables.userEmail],
      });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userEmail: string) => notificationsApi.markAllAsRead(userEmail),
    onSuccess: (_, userEmail) => {
      // Invalidate all notification queries for this user
      queryClient.invalidateQueries({
        queryKey: [NOTIFICATIONS_QUERY_KEY],
      });
    },
  });
}

/**
 * Hook to dismiss a notification
 */
export function useDismissNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ notificationId, userEmail }: { notificationId: string; userEmail: string }) =>
      notificationsApi.dismissNotification(notificationId, userEmail),
    onSuccess: (_, variables) => {
      // Invalidate notifications list
      queryClient.invalidateQueries({
        queryKey: [NOTIFICATIONS_QUERY_KEY, { user_email: variables.userEmail }],
      });
      queryClient.invalidateQueries({
        queryKey: [NOTIFICATIONS_QUERY_KEY, 'unread-count', variables.userEmail],
      });
    },
  });
}

/**
 * Hook to fetch notifications by type
 */
export function useNotificationsByType(
  notificationType: string,
  userEmail: string,
  limit = 50
) {
  return useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, 'by-type', notificationType, userEmail, limit],
    queryFn: () => notificationsApi.getNotificationsByType(notificationType, userEmail, limit),
    enabled: !!notificationType && !!userEmail,
  });
}
