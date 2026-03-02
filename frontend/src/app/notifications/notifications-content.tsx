'use client';

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  useToast,
  IconButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import { CheckIcon, DeleteIcon } from '@chakra-ui/icons';
import { useNotifications, useMarkAsRead, useDismissNotification, useMarkAllAsRead, useUnreadCount } from '@/lib/hooks';
import { Notification } from '@/lib/api';
import { useState } from 'react';
import { useNotificationContext } from '@/lib/websocket';

export default function NotificationsContent() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const userEmail = 'demo@example.com'; // Replace with actual user email from auth

  const { data: notifications, isLoading, error } = useNotifications({
    user_email: userEmail,
    unread_only: unreadOnly,
    limit: 100,
  });

  const { data: unreadData } = useUnreadCount(userEmail);
  const markAsReadMutation = useMarkAsRead();
  const dismissMutation = useDismissNotification();
  const markAllAsReadMutation = useMarkAllAsRead();
  const toast = useToast();

  // Initialize with empty values in case context is not available during rendering
  const notificationContext = {
    latestNotification: null as Notification | null,
    notifications: [] as Notification[],
    clearNotifications: () => {},
    isConnected: false,
    connect: () => {},
    disconnect: () => {},
  };

  try {
    // Only try to use the context on client side
    if (typeof window !== 'undefined') {
      Object.assign(notificationContext, useNotificationContext());
    }
  } catch (err) {
    console.warn('NotificationContext not available, using fallback values');
  }

  const { latestNotification, notifications: realtimeNotifications } = notificationContext;

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync({ notificationId, userEmail });
      toast({
        title: 'Marked as read',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Failed to mark as read',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDismiss = async (notificationId: string) => {
    try {
      await dismissMutation.mutateAsync({ notificationId, userEmail });
      toast({
        title: 'Notification dismissed',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Failed to dismiss',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync(userEmail);
      toast({
        title: 'All notifications marked as read',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Failed to mark all as read',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'normal': return 'blue';
      case 'low': return 'gray';
      default: return 'gray';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'decision': return 'purple';
      case 'task': return 'blue';
      case 'claim': return 'green';
      case 'conflict': return 'red';
      default: return 'gray';
    }
  };

  if (isLoading) {
    return (
      <Box p={8} display="flex" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8}>
        <Alert status="error">
          <AlertIcon />
          Failed to load notifications: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between">
          <Heading size="xl" color="text.primary">Notifications</Heading>
          <Button
            colorScheme="blue"
            size="sm"
            onClick={handleMarkAllAsRead}
            isLoading={markAllAsReadMutation.isPending}
          >
            Mark All as Read
          </Button>
        </HStack>

        <HStack spacing={4}>
          <Badge colorScheme="red" fontSize="md" p={2} borderRadius="md">
            {unreadData?.unread_count || 0} Unread
          </Badge>
          <Button
            size="sm"
            variant={unreadOnly ? 'solid' : 'outline'}
            colorScheme="blue"
            onClick={() => setUnreadOnly(!unreadOnly)}
          >
            {unreadOnly ? 'Show All' : 'Unread Only'}
          </Button>
        </HStack>

        {latestNotification && (
          <Alert status="info">
            <AlertIcon />
            New notification: {latestNotification.title}
          </Alert>
        )}

        <Tabs>
          <TabList>
            <Tab>All Notifications</Tab>
            <Tab>Real-time ({realtimeNotifications.length})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0} pt={4}>
              <VStack align="stretch" spacing={3}>
                {notifications?.map((notification: Notification) => (
                  <Card
                    key={notification.id}
                    bg={notification.is_read ? 'background.surface' : 'rgba(96,165,250,0.06)'}
                    borderLeft={notification.is_read ? 'none' : '4px solid'}
                    borderLeftColor="blue.500"
                  >
                    <CardBody>
                      <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={2} flex={1}>
                          <HStack>
                            <Badge colorScheme={getTypeColor(notification.notification_type)}>
                              {notification.notification_type}
                            </Badge>
                            <Badge colorScheme={getPriorityColor(notification.priority)}>
                              {notification.priority}
                            </Badge>
                            {!notification.is_read && (
                              <Badge colorScheme="blue">NEW</Badge>
                            )}
                          </HStack>
                          <Heading size="sm" color="text.primary">{notification.title}</Heading>
                          <Text fontSize="sm" color="text.secondary">
                            {notification.body}
                          </Text>
                          {notification.reason && (
                            <Text fontSize="xs" color="text.muted" fontStyle="italic">
                              {notification.reason}
                            </Text>
                          )}
                          <Text fontSize="xs" color="text.disabled">
                            {new Date(notification.created_at).toLocaleString()}
                          </Text>
                        </VStack>
                        <HStack>
                          {!notification.is_read && (
                            <IconButton
                              aria-label="Mark as read"
                              icon={<CheckIcon />}
                              size="sm"
                              colorScheme="green"
                              onClick={() => handleMarkAsRead(notification.id)}
                              isLoading={markAsReadMutation.isPending}
                            />
                          )}
                          <IconButton
                            aria-label="Dismiss"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDismiss(notification.id)}
                            isLoading={dismissMutation.isPending}
                          />
                        </HStack>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}

                {notifications?.length === 0 && (
                  <Alert status="info">
                    <AlertIcon />
                    No notifications to display
                  </Alert>
                )}
              </VStack>
            </TabPanel>

            <TabPanel p={0} pt={4}>
              <VStack align="stretch" spacing={3}>
                {realtimeNotifications.map((notification: Notification) => (
                  <Card key={notification.id} bg="rgba(52,211,153,0.08)" borderLeft="4px solid" borderLeftColor="green.500">
                    <CardBody>
                      <VStack align="start" spacing={2}>
                        <Badge colorScheme="green">REAL-TIME</Badge>
                        <Heading size="sm" color="text.primary">{notification.title}</Heading>
                        <Text fontSize="sm" color="text.secondary">{notification.body}</Text>
                        <Text fontSize="xs" color="text.muted">
                          {new Date(notification.created_at).toLocaleString()}
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}

                {realtimeNotifications.length === 0 && (
                  <Alert status="info">
                    <AlertIcon />
                    No real-time notifications yet. These will appear here when received via WebSocket.
                  </Alert>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
}
