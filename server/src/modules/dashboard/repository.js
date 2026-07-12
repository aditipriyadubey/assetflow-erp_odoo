/**
 * server/src/modules/dashboard/repository.js
 *
 * Parameterized SQL only. No business logic.
 */

const pool = require('../../config/db');

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
};
