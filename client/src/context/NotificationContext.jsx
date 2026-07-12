import { createContext, useCallback, useMemo, useState } from 'react';
import { getMockActivityData } from '../utils/mockActivityData';

const NotificationContext = createContext(null);

export function NotificationProvider({ children, role = 'Employee' }) {
  const [notifications, setNotifications] = useState(() => getMockActivityData(role).notifications);
  const [activityLogs] = useState(() => getMockActivityData(role).activityLogs);

  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications((current) =>
      current.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)),
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
  }, []);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);

  const value = useMemo(
    () => ({
      notifications,
      activityLogs,
      unreadCount,
      markNotificationAsRead,
      markAllNotificationsRead,
    }),
    [activityLogs, markAllNotificationsRead, markNotificationAsRead, notifications, unreadCount],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export default NotificationContext;
