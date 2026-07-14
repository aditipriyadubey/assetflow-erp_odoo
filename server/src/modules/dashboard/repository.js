/**
 * server/src/modules/dashboard/repository.js
 *
<<<<<<< HEAD
 * Parameterized SQL only. No business logic.
=======
 * Raw SQL only — no business logic (SDD §8 layering: routes ->
 * controllers -> services -> repositories -> MySQL). All queries use
 * mysql2 parameterized `?` placeholders, never string interpolation
 * (SDD §28 / §31).
 *
 * Optional scope filters (`departmentId`, `employeeId`) are passed in
 * from the service layer; this file only applies them as SQL WHERE
 * clauses — it does not decide role-based scoping rules.
>>>>>>> develop
 */

const pool = require('../../config/db');

<<<<<<< HEAD
async function countAssets() {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM assets');
  return Number(rows[0]?.total || 0);
}

async function countAssetsByStatus() {
  const [rows] = await pool.query(
    `SELECT status, COUNT(*) AS count
       FROM assets
      GROUP BY status
      ORDER BY status`
  );

  return rows.map((row) => ({
    status: row.status,
    count: Number(row.count || 0),
  }));
}

async function countActiveAllocations() {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM asset_allocations
      WHERE status = 'Active'`
  );
  return Number(rows[0]?.total || 0);
}

async function countOverdueAllocations() {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM asset_allocations
      WHERE status = 'Overdue'
         OR (status = 'Active' AND expected_return_date IS NOT NULL AND expected_return_date < CURDATE())`
  );
  return Number(rows[0]?.total || 0);
}

async function countUpcomingBookings() {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM bookings
      WHERE status = 'Upcoming'
        AND start_time >= NOW()`
  );
  return Number(rows[0]?.total || 0);
}

async function countPendingTransfers() {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM transfer_requests
      WHERE status = 'Requested'`
  );
  return Number(rows[0]?.total || 0);
}

async function countMaintenanceRequestsToday() {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM maintenance_requests
      WHERE created_at >= CURDATE()`
  );
  return Number(rows[0]?.total || 0);
}

module.exports = {
  countAssets,
  countAssetsByStatus,
  countActiveAllocations,
  countOverdueAllocations,
  countUpcomingBookings,
  countPendingTransfers,
  countMaintenanceRequestsToday,
=======
/**
 * @typedef {{ departmentId?: number, employeeId?: number }} ScopeFilter
 */

/**
 * @param {ScopeFilter} scope
 * @returns {Promise<number>}
 */
async function countAvailableAssets(scope = {}) {
  void scope;

  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM assets
      WHERE status = 'Available'`
  );
  return Number(rows[0].total);
}

/**
 * @param {ScopeFilter} scope
 * @returns {Promise<number>}
 */
async function countAllocatedAssets(scope = {}) {
  const { departmentId, employeeId } = scope;

  if (departmentId === undefined && employeeId === undefined) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total
         FROM assets
        WHERE status = 'Allocated'`
    );
    return Number(rows[0].total);
  }

  const conditions = [`a.status = 'Allocated'`, `aa.status = 'Active'`];
  const values = [];

  if (departmentId !== undefined) {
    conditions.push('aa.department_id = ?');
    values.push(departmentId);
  }

  if (employeeId !== undefined) {
    conditions.push('aa.employee_id = ?');
    values.push(employeeId);
  }

  const [rows] = await pool.query(
    `SELECT COUNT(DISTINCT a.id) AS total
       FROM assets a
      INNER JOIN asset_allocations aa ON aa.asset_id = a.id
      WHERE ${conditions.join(' AND ')}`,
    values
  );
  return Number(rows[0].total);
}

/**
 * @param {ScopeFilter} scope
 * @returns {Promise<number>}
 */
async function countMaintenanceToday(scope = {}) {
  const { departmentId, employeeId } = scope;
  const conditions = [
    `mr.status IN ('Approved', 'TechnicianAssigned', 'InProgress')`,
    `(DATE(mr.created_at) = CURDATE() OR mr.resolved_at IS NULL)`,
  ];
  const values = [];

  if (departmentId !== undefined) {
    conditions.push('u.department_id = ?');
    values.push(departmentId);
  }

  if (employeeId !== undefined) {
    conditions.push('mr.raised_by = ?');
    values.push(employeeId);
  }

  const joinClause =
    departmentId !== undefined || employeeId !== undefined
      ? 'INNER JOIN users u ON u.id = mr.raised_by'
      : '';

  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM maintenance_requests mr
       ${joinClause}
      WHERE ${conditions.join(' AND ')}`,
    values
  );
  return Number(rows[0].total);
}

/**
 * @param {ScopeFilter} scope
 * @returns {Promise<number>}
 */
async function countActiveBookings(scope = {}) {
  const { departmentId, employeeId } = scope;
  const conditions = [`status IN ('Upcoming', 'Ongoing')`];
  const values = [];

  if (departmentId !== undefined) {
    conditions.push('department_id = ?');
    values.push(departmentId);
  }

  if (employeeId !== undefined) {
    conditions.push('booked_by = ?');
    values.push(employeeId);
  }

  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM bookings
      WHERE ${conditions.join(' AND ')}`,
    values
  );
  return Number(rows[0].total);
}

/**
 * @param {ScopeFilter} scope
 * @returns {Promise<number>}
 */
async function countPendingTransfers(scope = {}) {
  const { departmentId, employeeId } = scope;

  if (departmentId === undefined && employeeId === undefined) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total
         FROM transfer_requests
        WHERE status = 'Requested'`
    );
    return Number(rows[0].total);
  }

  if (employeeId !== undefined) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total
         FROM transfer_requests
        WHERE status = 'Requested'
          AND (requested_by = ? OR from_user_id = ? OR to_user_id = ?)`,
      [employeeId, employeeId, employeeId]
    );
    return Number(rows[0].total);
  }

  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM transfer_requests tr
      WHERE tr.status = 'Requested'
        AND (
          EXISTS (SELECT 1 FROM users u WHERE u.id = tr.requested_by AND u.department_id = ?)
          OR EXISTS (SELECT 1 FROM users u WHERE u.id = tr.from_user_id AND u.department_id = ?)
          OR EXISTS (SELECT 1 FROM users u WHERE u.id = tr.to_user_id AND u.department_id = ?)
        )`,
    [departmentId, departmentId, departmentId]
  );
  return Number(rows[0].total);
}

/**
 * @param {ScopeFilter} scope
 * @returns {Promise<number>}
 */
async function countUpcomingReturns(scope = {}) {
  const { departmentId, employeeId } = scope;
  const conditions = [
    `status = 'Active'`,
    `expected_return_date IS NOT NULL`,
    `expected_return_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)`,
  ];
  const values = [];

  if (departmentId !== undefined) {
    conditions.push('department_id = ?');
    values.push(departmentId);
  }

  if (employeeId !== undefined) {
    conditions.push('employee_id = ?');
    values.push(employeeId);
  }

  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
       FROM asset_allocations
      WHERE ${conditions.join(' AND ')}`,
    values
  );
  return Number(rows[0].total);
}

/**
 * @param {ScopeFilter} scope
 * @returns {Promise<object[]>}
 */
async function findOverdueReturns(scope = {}) {
  const { departmentId, employeeId } = scope;
  const conditions = [
    `aa.status = 'Active'`,
    `aa.expected_return_date IS NOT NULL`,
    `aa.expected_return_date < CURDATE()`,
  ];
  const values = [];

  if (departmentId !== undefined) {
    conditions.push('aa.department_id = ?');
    values.push(departmentId);
  }

  if (employeeId !== undefined) {
    conditions.push('aa.employee_id = ?');
    values.push(employeeId);
  }

  const [rows] = await pool.query(
    `SELECT aa.id,
            a.asset_tag,
            a.name AS asset_name,
            u.name AS holder_name,
            aa.expected_return_date,
            aa.status AS allocation_status
       FROM asset_allocations aa
      INNER JOIN assets a ON a.id = aa.asset_id
       LEFT JOIN users u ON u.id = aa.employee_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY aa.expected_return_date ASC`,
    values
  );
  return rows;
}

module.exports = {
  countAvailableAssets,
  countAllocatedAssets,
  countMaintenanceToday,
  countActiveBookings,
  countPendingTransfers,
  countUpcomingReturns,
  findOverdueReturns,
>>>>>>> develop
};
