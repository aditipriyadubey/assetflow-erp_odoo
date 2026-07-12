const summaryCards = [
  { key: 'assets', label: 'Registered assets', value: '24', trend: '+3 this month' },
  { key: 'allocations', label: 'Active allocations', value: '8', trend: '+1 week over week' },
  { key: 'maintenance', label: 'Open maintenance', value: '4', trend: '2 high priority' },
  { key: 'bookings', label: 'Upcoming bookings', value: '6', trend: '1 conflict flagged' },
];

const lifecycleBreakdown = [
  { label: 'Available', value: 12 },
  { label: 'Allocated', value: 8 },
  { label: 'Under Maintenance', value: 3 },
  { label: 'Lost/Retired', value: 1 },
];

const utilizationBreakdown = [
  { label: 'Laptops', value: 10 },
  { label: 'Furniture', value: 7 },
  { label: 'Projectors', value: 4 },
  { label: 'Meeting Rooms', value: 3 },
];

const maintenanceBreakdown = [
  { label: 'Pending', value: 2 },
  { label: 'In Progress', value: 1 },
  { label: 'Resolved', value: 5 },
];

const bookingsBreakdown = [
  { label: 'Upcoming', value: 4 },
  { label: 'Ongoing', value: 1 },
  { label: 'Completed', value: 7 },
];

export function getReportsMockData() {
  return {
    summaryCards: summaryCards.map((card) => ({ ...card })),
    lifecycleBreakdown: lifecycleBreakdown.map((item) => ({ ...item })),
    utilizationBreakdown: utilizationBreakdown.map((item) => ({ ...item })),
    maintenanceBreakdown: maintenanceBreakdown.map((item) => ({ ...item })),
    bookingsBreakdown: bookingsBreakdown.map((item) => ({ ...item })),
  };
}
