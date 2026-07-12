/**
 * server/src/modules/reports/repository.js
 *
 * Raw SQL only — no business logic (SDD §8 layering: routes ->
 * controllers -> services -> repositories -> MySQL). All queries use
 * mysql2 parameterized `?` placeholders, never string interpolation
 * (SDD §28 / §31).
 */

const pool = require('../../config/db');

/**
 * @typedef {{ startDate: string, endDate: string, departmentId?: number }} ReportFilter
 */

/**
 * Per-asset allocation and booking activity within a date range (SDD §25).
 * @param {ReportFilter} filter
 * @returns {Promise<object[]>}
 */
async function findUtilizationRows({ startDate, endDate, departmentId }) {
  const periodStart = `${startDate} 00:00:00`;
  const periodEnd = `${endDate} 23:59:59`;
  const allocationValues = [endDate, endDate, startDate, endDate, endDate, startDate, endDate, startDate];
  const bookingValues = [periodEnd, periodStart, periodStart, periodEnd, periodEnd, periodStart];
  const allocationDeptClause =
    departmentId !== undefined ? 'AND aa.department_id = ?' : '';
  const bookingDeptClause =
    departmentId !== undefined ? 'AND b.department_id = ?' : '';

  if (departmentId !== undefined) {
    allocationValues.push(departmentId);
    bookingValues.push(departmentId);
  }

  const assetFilterClause =
    departmentId !== undefined
      ? 'WHERE alloc.asset_id IS NOT NULL OR book.asset_id IS NOT NULL'
      : '';

  const [rows] = await pool.query(
    `SELECT a.id AS asset_id,
            a.asset_tag,
            a.name AS asset_name,
            a.category_id,
            COALESCE(alloc.allocation_days, 0) AS allocation_days,
            COALESCE(book.booking_hours, 0) AS booking_hours
       FROM assets a
       LEFT JOIN (
             SELECT aa.asset_id,
                    SUM(
                      CASE
                        WHEN LEAST(COALESCE(aa.actual_return_date, ?), ?)
                             >= GREATEST(aa.allocated_date, ?)
                        THEN DATEDIFF(
                               LEAST(COALESCE(aa.actual_return_date, ?), ?),
                               GREATEST(aa.allocated_date, ?)
                             ) + 1
                        ELSE 0
                      END
                    ) AS allocation_days
               FROM asset_allocations aa
              WHERE aa.allocated_date <= ?
                AND (aa.actual_return_date IS NULL OR aa.actual_return_date >= ?)
                AND aa.status IN ('Active', 'Returned', 'Overdue')
                ${allocationDeptClause}
              GROUP BY aa.asset_id
            ) alloc ON alloc.asset_id = a.id
       LEFT JOIN (
             SELECT b.asset_id,
                    SUM(
                      CASE
                        WHEN LEAST(b.end_time, ?) > GREATEST(b.start_time, ?)
                        THEN TIMESTAMPDIFF(
                               HOUR,
                               GREATEST(b.start_time, ?),
                               LEAST(b.end_time, ?)
                             )
                        ELSE 0
                      END
                    ) AS booking_hours
               FROM bookings b
              WHERE b.status != 'Cancelled'
                AND b.start_time < ?
                AND b.end_time > ?
                ${bookingDeptClause}
              GROUP BY b.asset_id
            ) book ON book.asset_id = a.id
      ${assetFilterClause}
      ORDER BY a.id ASC`,
    [...allocationValues, ...bookingValues]
  );

  return rows;
}

/**
 * @param {ReportFilter} filter
 * @returns {Promise<object[]>}
 */
async function findMaintenanceFrequencyByAsset({ startDate, endDate }) {
  const [rows] = await pool.query(
    `SELECT mr.asset_id,
            a.asset_tag,
            a.name AS asset_name,
            COUNT(*) AS request_count
       FROM maintenance_requests mr
      INNER JOIN assets a ON a.id = mr.asset_id
      WHERE DATE(mr.created_at) BETWEEN ? AND ?
      GROUP BY mr.asset_id, a.asset_tag, a.name
      ORDER BY request_count DESC, a.asset_tag ASC`,
    [startDate, endDate]
  );
  return rows;
}

/**
 * @param {ReportFilter} filter
 * @returns {Promise<object[]>}
 */
async function findMaintenanceFrequencyByCategory({ startDate, endDate }) {
  const [rows] = await pool.query(
    `SELECT ac.id AS category_id,
            ac.name AS category_name,
            COUNT(*) AS request_count
       FROM maintenance_requests mr
      INNER JOIN assets a ON a.id = mr.asset_id
      INNER JOIN asset_categories ac ON ac.id = a.category_id
      WHERE DATE(mr.created_at) BETWEEN ? AND ?
      GROUP BY ac.id, ac.name
      ORDER BY request_count DESC, ac.name ASC`,
    [startDate, endDate]
  );
  return rows;
}

/**
 * @param {number} retirementYears
 * @returns {Promise<object[]>}
 */
async function findDueForMaintenance(retirementYears) {
  const [rows] = await pool.query(
    `SELECT a.id AS asset_id,
            a.asset_tag,
            a.name AS asset_name,
            a.condition,
            a.acquisition_date,
            a.status,
            ac.id AS category_id,
            ac.name AS category_name
       FROM assets a
      INNER JOIN asset_categories ac ON ac.id = a.category_id
      WHERE a.status NOT IN ('Retired', 'Disposed', 'Lost')
        AND (
          a.condition IN ('Fair', 'Poor')
          OR (
            a.acquisition_date IS NOT NULL
            AND a.acquisition_date <= DATE_SUB(CURDATE(), INTERVAL ? YEAR)
          )
        )
      ORDER BY a.acquisition_date ASC, a.asset_tag ASC`,
    [retirementYears]
  );
  return rows;
}

/**
 * @param {{ departmentId?: number }} filter
 * @returns {Promise<object[]>}
 */
async function findDepartmentAllocation({ departmentId }) {
  const conditions = [`aa.status = 'Active'`];
  const values = [];

  if (departmentId !== undefined) {
    conditions.push('aa.department_id = ?');
    values.push(departmentId);
  }

  const [rows] = await pool.query(
    `SELECT aa.department_id,
            COALESCE(d.name, 'Unassigned') AS department_name,
            COUNT(*) AS active_allocations
       FROM asset_allocations aa
       LEFT JOIN departments d ON d.id = aa.department_id
      WHERE ${conditions.join(' AND ')}
      GROUP BY aa.department_id, d.name
      ORDER BY active_allocations DESC, department_name ASC`,
    values
  );
  return rows;
}

/**
 * @param {ReportFilter} filter
 * @returns {Promise<object[]>}
 */
async function findBookingHeatmap({ startDate, endDate, departmentId }) {
  const conditions = [
    `b.status != 'Cancelled'`,
    `b.start_time >= ?`,
    `b.start_time <= ?`,
  ];
  const values = [startDate, `${endDate} 23:59:59`];

  if (departmentId !== undefined) {
    conditions.push('b.department_id = ?');
    values.push(departmentId);
  }

  const [rows] = await pool.query(
    `SELECT HOUR(b.start_time) AS hour_of_day,
            DAYOFWEEK(b.start_time) AS day_of_week,
            COUNT(*) AS booking_count
       FROM bookings b
      WHERE ${conditions.join(' AND ')}
      GROUP BY HOUR(b.start_time), DAYOFWEEK(b.start_time)
      ORDER BY day_of_week ASC, hour_of_day ASC`,
    values
  );
  return rows;
}

module.exports = {
  findUtilizationRows,
  findMaintenanceFrequencyByAsset,
  findMaintenanceFrequencyByCategory,
  findDueForMaintenance,
  findDepartmentAllocation,
  findBookingHeatmap,
};
