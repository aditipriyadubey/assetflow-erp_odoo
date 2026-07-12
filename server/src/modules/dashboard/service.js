/**
 * server/src/modules/dashboard/service.js
 *
 * Pure business logic for dashboard KPIs (SDD §24). Never touches
 * req/res. Role-scoped filters are resolved here and passed to the
 * repository as parameterized scope values.
 */

const repository = require('./repository');

/**
 * @typedef {{ id: number, role: string, department_id: number|null }} AuthUser
 */

/**
 * Builds repository scope filters from the authenticated user (SDD §24).
 * Admin and AssetManager see org-wide counts; Department Head is scoped
 * by department_id; Employee is scoped by their own user id.
 * @param {AuthUser} user
 * @returns {{ departmentId?: number, employeeId?: number }}
 */
function resolveScope(user) {
  if (user.role === 'Admin' || user.role === 'AssetManager') {
    return {};
  }

  if (user.role === 'DepartmentHead') {
    return user.department_id !== null ? { departmentId: user.department_id } : {};
  }

  if (user.role === 'Employee') {
    return { employeeId: user.id };
  }

  return {};
}

/**
 * @param {object} row
 * @returns {object}
 */
function sanitizeOverdueReturn(row) {
  return {
    id: row.id,
    asset_tag: row.asset_tag,
    asset_name: row.asset_name,
    holder: row.holder_name,
    expected_return_date: row.expected_return_date,
    status: 'Overdue',
  };
}

/**
 * @param {AuthUser} user
 * @returns {Promise<object>}
 */
async function getKpis(user) {
  const scope = resolveScope(user);

  const [
    available_assets,
    allocated_assets,
    maintenance_today,
    active_bookings,
    pending_transfers,
    upcoming_returns,
  ] = await Promise.all([
    repository.countAvailableAssets(scope),
    repository.countAllocatedAssets(scope),
    repository.countMaintenanceToday(scope),
    repository.countActiveBookings(scope),
    repository.countPendingTransfers(scope),
    repository.countUpcomingReturns(scope),
  ]);

  return {
    available_assets,
    allocated_assets,
    maintenance_today,
    active_bookings,
    pending_transfers,
    upcoming_returns,
  };
}

/**
 * @param {AuthUser} user
 * @returns {Promise<object[]>}
 */
async function getOverdueReturns(user) {
  const scope = resolveScope(user);
  const rows = await repository.findOverdueReturns(scope);
  return rows.map(sanitizeOverdueReturn);
}

module.exports = {
  getKpis,
  getOverdueReturns,
};
