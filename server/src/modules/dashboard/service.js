/**
 * server/src/modules/dashboard/service.js
 *
 * Dashboard KPI calculations only.
 */

const repository = require('./repository');

const ASSET_STATUS_ORDER = [
  'Available',
  'Allocated',
  'Reserved',
  'Under Maintenance',
  'Lost',
  'Retired',
  'Disposed',
];

async function getDashboardSummary() {
  const [
    totalAssets,
    assetStatusRows,
    allocatedAssets,
    overdueReturns,
    upcomingBookings,
    pendingTransfers,
    maintenanceToday,
  ] = await Promise.all([
    repository.countAssets(),
    repository.countAssetsByStatus(),
    repository.countActiveAllocations(),
    repository.countOverdueAllocations(),
    repository.countUpcomingBookings(),
    repository.countPendingTransfers(),
    repository.countMaintenanceRequestsToday(),
  ]);

  const statusCounts = new Map(assetStatusRows.map((row) => [row.status, Number(row.count || 0)]));

  const assetStatusCounts = ASSET_STATUS_ORDER.map((status) => ({
    status,
    count: Number(statusCounts.get(status) || 0),
  }));

  const availableAssets = Number(statusCounts.get('Available') || 0);
  const underMaintenance = Number(statusCounts.get('Under Maintenance') || 0);

  return {
    kpis: {
      totalAssets,
      availableAssets,
      allocatedAssets,
      underMaintenance,
      overdueReturns,
      upcomingBookings,
      pendingTransfers,
      maintenanceToday,
    },
    assetStatusCounts,
  };
}

module.exports = {
  getDashboardSummary,
};
