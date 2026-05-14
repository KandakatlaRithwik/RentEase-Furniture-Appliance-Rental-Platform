import { createContext, useCallback, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { notificationAPI } from '../services/api';

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    try {
      const { data } = await notificationAPI.getMy();
      setNotifications((data.notifications || []).map((notif) => ({ ...notif, id: notif._id })));
    } catch (err) {
      console.error('Failed to load notifications:', err?.response?.data?.message || err.message);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(loadNotifications, 20000);
    return () => clearInterval(interval);
  }, [user, loadNotifications]);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)));
    } catch (err) {
      console.error('Failed to mark notification as read:', err?.response?.data?.message || err.message);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err?.response?.data?.message || err.message);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const clearAll = useCallback(async () => {
    await markAllAsRead();
    setNotifications([]);
  }, [markAllAsRead]);

  return (
    <NotificationContext.Provider
      value={{ notifications, loadNotifications, markAsRead, markAllAsRead, removeNotification, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
