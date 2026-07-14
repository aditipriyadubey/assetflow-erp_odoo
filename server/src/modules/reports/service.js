/**
 * server/src/modules/reports/service.js
 *
<<<<<<< HEAD
 * Report generation only.
 */

const repository = require('./repository');

async function getInventoryReport() {
  return repository.getAssetInventory();
}

async function getAllocationReport() {
  return repository.getAllocationSummary();
}

async function getTransferReport() {
  return repository.getTransferSummary();
}

async function getMaintenanceReport() {
  return repository.getMaintenanceSummary();
}

async function getAuditReport() {
  return repository.getAuditSummary();
}

module.exports = {
  getInventoryReport,
  getAllocationReport,
  getTransferReport,
  getMaintenanceReport,
  getAuditReport,
=======
 * Pure business logic for reports (SDD §25). Never touches req/res.
 * Date ranges, utilization ratios, CSV export, and role scoping are
 * resolved here; the repository executes parameterized SQL only.
 */

const AppError = require('../../utils/AppError');
const repository = require('./repository');

const DEFAULT_RETIREMENT_YEARS = 5;
const DEFAULT_PERIOD_DAYS = 90;

/**
 * @typedef {{ id: number, role: string, department_id: number|null }} AuthUser
 */

/**
 * @param {string|undefined} startDate
 * @param {string|undefined} endDate
 * @returns {{ startDate: string, endDate: string, totalDays: number }}
 */
function resolveDateRange(startDate, endDate) {
  const end = endDate ? new Date(`${endDate}T00:00:00`) : new Date();
  const start = startDate
    ? new Date(`${startDate}T00:00:00`)
    : new Date(end.getTime() - (DEFAULT_PERIOD_DAYS - 1) * 24 * 60 * 60 * 1000);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new AppError('VALIDATION_ERROR', 'Invalid date range provided.', 400);
  }

  if (start > end) {
    throw new AppError('VALIDATION_ERROR', 'Start date must be on or before end date.', 400, {
      start_date: 'Start date must be on or before end date.',
      end_date: 'End date must be on or after start date.',
    });
  }

  const startIso = start.toISOString().slice(0, 10);
  const endIso = end.toISOString().slice(0, 10);
  const totalDays =
    Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;

  return { startDate: startIso, endDate: endIso, totalDays };
}

/**
 * Department-scoped reports filter by department_id for Department Head.
 * @param {AuthUser} user
 * @returns {{ departmentId?: number }}
 */
function resolveDepartmentScope(user) {
  if (user.role === 'DepartmentHead' && user.department_id !== null) {
    return { departmentId: user.department_id };
  }
  return {};
}

/**
 * @param {number} allocationDays
 * @param {number} bookingHours
 * @param {number} totalDays
 * @returns {number}
 */
function calculateUtilizationRatio(allocationDays, bookingHours, totalDays) {
  if (totalDays <= 0) {
    return 0;
  }

  const utilizedDays = allocationDays + bookingHours / 24;
  return Number((utilizedDays / totalDays).toFixed(4));
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeCsvValue(value) {
  const stringValue = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * @param {string[]} headers
 * @param {object[]} rows
 * @param {string[]} keys
 * @returns {string}
 */
function buildCsv(headers, rows, keys) {
  const lines = [headers.map(escapeCsvValue).join(',')];

  for (const row of rows) {
    lines.push(keys.map((key) => escapeCsvValue(row[key])).join(','));
  }

  return `${lines.join('\n')}\n`;
}

/**
 * @param {AuthUser} user
 * @param {{ start_date?: string, end_date?: string }} query
 * @returns {Promise<object>}
 */
async function getUtilization(user, query = {}) {
  const period = resolveDateRange(query.start_date, query.end_date);
  const scope = resolveDepartmentScope(user);

  const rows = await repository.findUtilizationRows({
    startDate: period.startDate,
    endDate: period.endDate,
    ...scope,
  });

  const assets = rows.map((row) => {
    const allocationDays = Number(row.allocation_days);
    const bookingHours = Number(row.booking_hours);
    const isIdle = allocationDays === 0 && bookingHours === 0;

    return {
      asset_id: row.asset_id,
      asset_tag: row.asset_tag,
      asset_name: row.asset_name,
      category_id: row.category_id,
      allocation_days: allocationDays,
      booking_hours: bookingHours,
      utilization_ratio: calculateUtilizationRatio(
        allocationDays,
        bookingHours,
        period.totalDays
      ),
      is_idle: isIdle,
    };
  });

  const idleAssets = assets.filter((asset) => asset.is_idle).length;
  const averageUtilization =
    assets.length === 0
      ? 0
      : Number(
          (
            assets.reduce((sum, asset) => sum + asset.utilization_ratio, 0) / assets.length
          ).toFixed(4)
        );

  return {
    period: {
      start_date: period.startDate,
      end_date: period.endDate,
      total_days: period.totalDays,
    },
    assets,
    summary: {
      total_assets: assets.length,
      idle_assets: idleAssets,
      average_utilization: averageUtilization,
    },
  };
}

/**
 * @param {{ start_date?: string, end_date?: string }} query
 * @returns {Promise<object>}
 */
async function getMaintenanceFrequency(query = {}) {
  const period = resolveDateRange(query.start_date, query.end_date);
  const filter = { startDate: period.startDate, endDate: period.endDate };

  const [byAsset, byCategory] = await Promise.all([
    repository.findMaintenanceFrequencyByAsset(filter),
    repository.findMaintenanceFrequencyByCategory(filter),
  ]);

  return {
    period: {
      start_date: period.startDate,
      end_date: period.endDate,
    },
    by_asset: byAsset.map((row) => ({
      asset_id: row.asset_id,
      asset_tag: row.asset_tag,
      asset_name: row.asset_name,
      request_count: Number(row.request_count),
    })),
    by_category: byCategory.map((row) => ({
      category_id: row.category_id,
      category_name: row.category_name,
      request_count: Number(row.request_count),
    })),
  };
}

/**
 * @returns {Promise<object>}
 */
async function getDueForMaintenance() {
  const rows = await repository.findDueForMaintenance(DEFAULT_RETIREMENT_YEARS);

  const assets = rows.map((row) => {
    const reasons = [];

    if (row.condition === 'Fair' || row.condition === 'Poor') {
      reasons.push('condition');
    }

    if (row.acquisition_date) {
      const acquisitionDate = new Date(`${row.acquisition_date}T00:00:00`);
      const ageYears =
        (Date.now() - acquisitionDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

      if (ageYears >= DEFAULT_RETIREMENT_YEARS) {
        reasons.push('age');
      }
    }

    return {
      asset_id: row.asset_id,
      asset_tag: row.asset_tag,
      asset_name: row.asset_name,
      condition: row.condition,
      acquisition_date: row.acquisition_date,
      status: row.status,
      category_id: row.category_id,
      category_name: row.category_name,
      reasons,
    };
  });

  return {
    retirement_threshold_years: DEFAULT_RETIREMENT_YEARS,
    assets,
    summary: {
      total_flagged: assets.length,
    },
  };
}

/**
 * @param {AuthUser} user
 * @returns {Promise<object>}
 */
async function getDepartmentAllocation(user) {
  const scope = resolveDepartmentScope(user);
  const rows = await repository.findDepartmentAllocation(scope);

  const departments = rows.map((row) => ({
    department_id: row.department_id,
    department_name: row.department_name,
    active_allocations: Number(row.active_allocations),
  }));

  const totalActiveAllocations = departments.reduce(
    (sum, department) => sum + department.active_allocations,
    0
  );

  return {
    departments,
    summary: {
      total_departments: departments.length,
      total_active_allocations: totalActiveAllocations,
    },
  };
}

/**
 * @param {AuthUser} user
 * @param {{ start_date?: string, end_date?: string }} query
 * @returns {Promise<object>}
 */
async function getBookingHeatmap(user, query = {}) {
  const period = resolveDateRange(query.start_date, query.end_date);
  const scope = resolveDepartmentScope(user);

  const rows = await repository.findBookingHeatmap({
    startDate: period.startDate,
    endDate: period.endDate,
    ...scope,
  });

  const buckets = rows.map((row) => ({
    hour_of_day: Number(row.hour_of_day),
    day_of_week: Number(row.day_of_week),
    booking_count: Number(row.booking_count),
  }));

  const totalBookings = buckets.reduce((sum, bucket) => sum + bucket.booking_count, 0);

  return {
    period: {
      start_date: period.startDate,
      end_date: period.endDate,
    },
    buckets,
    summary: {
      total_bookings: totalBookings,
    },
  };
}

/**
 * @param {AuthUser} user
 * @returns {Promise<{ csv: string, filename: string }>}
 */
async function exportReportCsv(user) {
  const report = await getDepartmentAllocation(user);

  const csv = buildCsv(
    ['department_id', 'department_name', 'active_allocations'],
    report.departments,
    ['department_id', 'department_name', 'active_allocations']
  );

  return {
    csv,
    filename: 'department-allocation-report.csv',
  };
}

module.exports = {
  getUtilization,
  getMaintenanceFrequency,
  getDueForMaintenance,
  getDepartmentAllocation,
  getBookingHeatmap,
  exportReportCsv,
>>>>>>> develop
};
