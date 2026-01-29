import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import NotificationCenter from './NotificationCenter';

const NotificationBell = () => {
  const { unreadCount, requestPermission } = useNotifications();
  const [isCenterOpen, setIsCenterOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, []);

  const handleBellClick = async () => {
    setIsCenterOpen(true);

    // Request notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      await requestPermission();
      setHasPermission(Notification.permission === 'granted');
    }
  };

  const handleCloseCenter = () => {
    setIsCenterOpen(false);
  };

  return (
    <>
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors duration-200"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Permission indicator */}
        {!hasPermission && (
          <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center">
            !
          </span>
        )}
      </button>

      <NotificationCenter
        isOpen={isCenterOpen}
        onClose={handleCloseCenter}
      />
    </>
  );
};

export default NotificationBell;
