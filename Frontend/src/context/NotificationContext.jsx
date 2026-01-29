import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  // Browser notification permission
  const [hasPermission, setHasPermission] = useState(false);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setHasPermission(permission === 'granted');
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback((notification) => {
    if (hasPermission && 'Notification' in window) {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/logo-hat.png',
          badge: '/logo-hat.png',
          tag: `notification-${notification._id}`,
          requireInteraction: notification.priority === 'urgent'
        });

        // Auto-close after 5 seconds unless urgent
        if (notification.priority !== 'urgent') {
          setTimeout(() => {
            browserNotification.close();
          }, 5000);
        }

        // Handle click to focus window
        browserNotification.onclick = () => {
          window.focus();
          browserNotification.close();
        };
      } catch (error) {
        console.error('Error showing browser notification:', error);
      }
    }
  }, [hasPermission]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
      if (response.data.success) {
        setNotifications(prev => page === 1 ? response.data.notifications : [...prev, ...response.data.notifications]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await api.get('/notifications/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [isAuthenticated]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      // Update unread count if deleted notification was unread
      const deletedNotif = notifications.find(n => n._id === notificationId);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  // Handle real-time notifications
  const handleRealtimeNotification = useCallback((notification) => {
    // Add to notifications list
    setNotifications(prev => [notification, ...prev]);

    // Update unread count
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }

    // Show browser notification
    showBrowserNotification(notification);

    // Show toast notification (you can integrate with your toast system)
    console.log('New notification:', notification);
  }, [showBrowserNotification]);

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';
      const newSocket = io(socketUrl, {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to notification socket');
        // Join user-specific room for notifications
        newSocket.emit('join-user-room', user.id);
      });

      newSocket.on('notification', handleRealtimeNotification);

      newSocket.on('disconnect', () => {
        console.log('Disconnected from notification socket');
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user, handleRealtimeNotification]);

  // Initialize notifications on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();

      // Check notification permission
      if ('Notification' in window) {
        setHasPermission(Notification.permission === 'granted');
      }
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  // Periodic refresh of unread count
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    hasPermission,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestPermission,
    showBrowserNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
