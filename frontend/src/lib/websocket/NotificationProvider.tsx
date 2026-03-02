/**
 * NotificationProvider - React context for WebSocket notifications
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { WebSocketClient, createWebSocketClient, WebSocketMessage } from './client';
import type { Notification as AppNotification } from '../api/notifications';
import { NOTIFICATIONS_QUERY_KEY } from '../hooks/useNotifications';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

interface NotificationContextType {
  isConnected: boolean;
  latestNotification: AppNotification | null;
  notifications: AppNotification[];
  connect: (userEmail: string) => void;
  disconnect: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  userEmail?: string; // Optional: auto-connect if provided
}

export function NotificationProvider({ children, userEmail }: NotificationProviderProps) {
  const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestNotification, setLatestNotification] = useState<AppNotification | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const queryClient = useQueryClient();

  const handleMessage = useCallback((message: WebSocketMessage) => {
    console.log('[NotificationProvider] Received message:', message);

    switch (message.type) {
      case 'notification':
        const notification = message.data as AppNotification;
        setLatestNotification(notification);
  setNotifications((prev: AppNotification[]) => [notification, ...prev]);

        // Invalidate notifications cache to refetch
        queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });

        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.body.substring(0, 200),
            icon: '/logo.png',
            tag: notification.id,
          });
        }
        break;

      case 'connection':
        console.log('[NotificationProvider] Connection status:', message.data);
        break;

      default:
        console.log('[NotificationProvider] Unknown message type:', message.type);
    }
  }, [queryClient]);

  const connect = useCallback((email: string) => {
    if (wsClient) {
      console.log('[NotificationProvider] Already connected, disconnecting first');
      wsClient.disconnect();
    }

    // Create a variable for the client outside the try-catch scope
    let newClient: WebSocketClient | null = null;
    let pingInterval: NodeJS.Timeout | null = null;

    try {
      // Create a new client
      newClient = createWebSocketClient({
        url: `${WS_BASE_URL}/api/v1/ws`,
        userEmail: email,
        reconnectInterval: 5000,
        // Reduce reconnect attempts to prevent excessive console errors
        maxReconnectAttempts: 3,
        onMessage: handleMessage,
        onConnect: () => {
          console.log('[NotificationProvider] WebSocket connected');
          setIsConnected(true);

          // Request notification permission if not granted
          if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
          }
        },
        onDisconnect: () => {
          console.log('[NotificationProvider] WebSocket disconnected');
          setIsConnected(false);
        },
        onError: (error) => {
          // Log error but don't flood console
          console.warn('[NotificationProvider] WebSocket error - connection may not be available');
        },
      });
      
      // Connect, set client, and setup ping interval
      if (newClient) {
        newClient.connect();
        setWsClient(newClient);

        // Setup ping interval to keep connection alive
        pingInterval = setInterval(() => {
          if (newClient && newClient.isConnected()) {
            newClient.ping();
          }
        }, 30000); // Ping every 30 seconds
      }
    } catch (error) {
      console.error('[NotificationProvider] Failed to create WebSocket client:', error);
      setIsConnected(false);
    }

    // Return cleanup function
    return () => {
      if (pingInterval) {
        clearInterval(pingInterval);
      }
    };
  }, [wsClient, handleMessage]);

  const disconnect = useCallback(() => {
    if (wsClient) {
      wsClient.disconnect();
      setWsClient(null);
      setIsConnected(false);
    }
  }, [wsClient]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setLatestNotification(null);
  }, []);

  // Auto-connect if userEmail provided
  useEffect(() => {
    if (userEmail && !wsClient) {
      connect(userEmail);
    }

    return () => {
      if (wsClient) {
        wsClient.disconnect();
      }
    };
  }, [userEmail]);

  const value: NotificationContextType = {
    isConnected,
    latestNotification,
    notifications,
    connect,
    disconnect,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to use notification context
 */
export function useNotificationContext() {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }

  return context;
}
