import { ASSET_STATUS } from './constants';

export const dashboardMockData = {
  kpis: {
    totalAssets: 156,
    availableAssets: 42,
    allocatedAssets: 68,
    underMaintenance: 12,
    overdueReturns: 5,
    upcomingBookings: 18,
    pendingTransfers: 3,
    maintenanceToday: 7,
  },
  assetStatusCounts: ASSET_STATUS.map((status, index) => ({
    status,
    count: [42, 68, 14, 12, 3, 8, 9][index] ?? 0,
  })),
  recentActivity: [
    {
      id: 1,
      action: 'Asset registered',
      detail: 'Dell Latitude 5540 (AF-0156)',
      actor: 'Priya Sharma',
      timestamp: '2026-07-12T09:15:00',
    },
    {
      id: 2,
      action: 'Asset allocated',
      detail: 'Epson Projector (AF-0089) → Rahul Mehta',
      actor: 'Admin User',
      timestamp: '2026-07-12T08:42:00',
    },
    {
      id: 3,
      action: 'Booking created',
      detail: 'Conference Room A — Jul 12, 2:00 PM',
      actor: 'Anita Desai',
      timestamp: '2026-07-12T08:10:00',
    },
    {
      id: 4,
      action: 'Maintenance approved',
      detail: 'HP LaserJet Pro (AF-0044)',
      actor: 'Vikram Singh',
      timestamp: '2026-07-11T16:30:00',
    },
    {
      id: 5,
      action: 'Audit completed',
      detail: 'Q2 IT Equipment Audit — 48 items verified',
      actor: 'Admin User',
      timestamp: '2026-07-11T14:00:00',
    },
  ],
  overdueReturns: [
    {
      id: 1,
      assetTag: 'AF-0023',
      assetName: 'MacBook Pro 14"',
      holder: 'Rahul Mehta',
      expectedReturnDate: '2026-07-05',
      status: 'Overdue',
    },
    {
      id: 2,
      assetTag: 'AF-0067',
      assetName: 'Canon DSLR Camera',
      holder: 'Sneha Patel',
      expectedReturnDate: '2026-07-08',
      status: 'Overdue',
    },
  ],
  upcomingBookings: [
    {
      id: 1,
      resource: 'Conference Room B',
      bookedBy: 'Anita Desai',
      startTime: '2026-07-12T14:00:00',
      endTime: '2026-07-12T16:00:00',
      status: 'Upcoming',
    },
    {
      id: 2,
      resource: 'Projector Cart',
      bookedBy: 'Vikram Singh',
      startTime: '2026-07-13T10:00:00',
      endTime: '2026-07-13T12:00:00',
      status: 'Upcoming',
    },
  ],
  maintenanceAttention: [
    {
      id: 1,
      assetTag: 'AF-0044',
      assetName: 'HP LaserJet Pro',
      priority: 'High',
      status: 'Pending',
      raisedBy: 'Rahul Mehta',
    },
    {
      id: 2,
      assetTag: 'AF-0112',
      assetName: 'Standing Desk',
      priority: 'Medium',
      status: 'InProgress',
      raisedBy: 'Sneha Patel',
    },
  ],
};

export function getDashboardMockData() {
  return dashboardMockData;
}
