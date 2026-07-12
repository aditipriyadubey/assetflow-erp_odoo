import { AlertCircle, Bell } from 'lucide-react';
import { useMemo, useState } from 'react';
import Button from '../../common/Button';
import Card from '../../common/Card';
import EmptyState from '../../common/EmptyState';
import Input from '../../common/Input';
import Select from '../../common/Select';
import Table from '../../common/Table';
import { formatDateTime } from '../../../utils/formatDate';
import { getStatusColorClasses } from '../../../utils/statusColors';

function ActivityFeedTabs({ notifications, activityLogs, onMarkRead, onMarkAllRead, userRole }) {
  const [activeTab, setActiveTab] = useState('notifications');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const visibleNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();
    return notifications.filter((item) => {
      const matchesSearch = !query || [item.title, item.message, item.type].some((value) => value?.toLowerCase().includes(query));
      const matchesFilter = filter === 'all' || (filter === 'unread' ? !item.isRead : item.isRead);
      return matchesSearch && matchesFilter;
    });
  }, [notifications, search, filter]);

  const visibleActivityLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return activityLogs.filter((item) => {
      const matchesSearch = !query || [item.actor, item.action, item.description, item.entity].some((value) => value?.toLowerCase().includes(query));
      const matchesFilter = filter === 'all' || filter === item.entity.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [activityLogs, search, filter]);

  const activityFilterOptions = [
    { value: 'all', label: 'All activity' },
    { value: 'assets', label: 'Assets' },
    { value: 'allocations', label: 'Allocations' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'bookings', label: 'Bookings' },
    { value: 'audits', label: 'Audits' },
  ];

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const handleTabChange = (nextTab) => {
    setActiveTab(nextTab);
    setFilter('all');
    setSearch('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
            <Bell className="h-4 w-4" />
            <span>{unreadCount} unread notification{unreadCount === 1 ? '' : 's'}</span>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">Activity feed</h3>
          <p className="text-sm text-neutral-500">Track recent system updates, approvals, and alerts relevant to your role.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={onMarkAllRead} disabled={unreadCount === 0}>
            Mark all read
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleTabChange('notifications')}
          className={`rounded-full px-4 py-2 text-sm font-medium ${activeTab === 'notifications' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-700 ring-1 ring-neutral-200'}`}
        >
          Notifications
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('activity')}
          className={`rounded-full px-4 py-2 text-sm font-medium ${activeTab === 'activity' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-700 ring-1 ring-neutral-200'}`}
        >
          Activity logs
        </button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full lg:max-w-md">
          <Input
            label="Search"
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={activeTab === 'notifications' ? 'Search notifications' : 'Search activity logs'}
          />
        </div>
        <div className="w-full max-w-xs">
          <Select
            label={activeTab === 'notifications' ? 'Filter' : 'Module'}
            name="filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            options={activeTab === 'notifications' ? [
              { value: 'all', label: 'All notifications' },
              { value: 'unread', label: 'Unread' },
              { value: 'read', label: 'Read' },
            ] : activityFilterOptions}
          />
        </div>
      </div>

      {activeTab === 'notifications' ? (
        <div className="space-y-3">
          {visibleNotifications.length ? visibleNotifications.map((notification) => (
            <Card key={notification.id} className={`p-4 ${!notification.isRead ? 'border-primary-200 bg-primary-50/40' : ''}`}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${!notification.isRead ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-600'}`}>
                      {!notification.isRead ? 'Unread' : 'Read'}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColorClasses(notification.type)}`}>
                      {notification.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900">{notification.title}</h4>
                    <p className="mt-1 text-sm text-neutral-600">{notification.message}</p>
                  </div>
                  <p className="text-xs text-neutral-500">{formatDateTime(notification.timestamp)}</p>
                </div>
                {!notification.isRead && (
                  <Button variant="secondary" onClick={() => onMarkRead(notification.id)}>
                    Mark read
                  </Button>
                )}
              </div>
            </Card>
          )) : (
            <EmptyState title="No notifications found" description="Try adjusting your search or filter criteria." />
          )}
        </div>
      ) : (
        <Card>
          {visibleActivityLogs.length ? (
            <Table
              columns={[
                { key: 'actor', header: 'Actor' },
                { key: 'action', header: 'Action' },
                { key: 'entity', header: 'Module' },
                { key: 'description', header: 'Details' },
                { key: 'timestamp', header: 'Timestamp', render: (value) => formatDateTime(value) },
              ]}
              data={visibleActivityLogs}
              emptyMessage="No activity logs available for the selected role and filters."
            />
          ) : (
            <EmptyState title="No activity logs found" description="No matching history is available for your role right now." />
          )}
        </Card>
      )}

      {userRole === 'Employee' && activeTab === 'activity' && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <span>Activity logs are limited to the events relevant to your current role.</span>
        </div>
      )}
    </div>
  );
}

export default ActivityFeedTabs;
