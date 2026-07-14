import { useEffect, useState } from 'react';
import ErrorBanner from '../components/common/ErrorBanner';
import Spinner from '../components/common/Spinner';
import ActivityFeedTabs from '../components/feature/activity/ActivityFeedTabs';
import useAuth from '../hooks/useAuth';
import useNotifications from '../hooks/useNotifications';

function ActivityPage() {
  const { user } = useAuth();
  const { notifications, activityLogs, markNotificationAsRead, markAllNotificationsRead } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [error] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, [user?.role]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-neutral-900">Activity & Notifications</h2>
        <p className="text-sm text-neutral-500">
          Review personal alerts, recent approvals, and the system activity relevant to your role.
        </p>
      </header>

      <ErrorBanner error={error} />

      {loading ? (
        <div className="flex justify-center rounded-lg border border-neutral-200 bg-white p-10">
          <Spinner size="lg" label="Loading activity feed" />
        </div>
      ) : (
        <ActivityFeedTabs
          notifications={notifications}
          activityLogs={activityLogs}
          onMarkRead={markNotificationAsRead}
          onMarkAllRead={markAllNotificationsRead}
          userRole={user?.role ?? 'Employee'}
        />
      )}
    </div>
  );
}

export default ActivityPage;
