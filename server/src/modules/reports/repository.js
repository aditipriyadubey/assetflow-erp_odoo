/**
 * server/src/modules/reports/repository.js
 *
 * Parameterized SQL only. No business logic.
 */

const pool = require('../../config/db');

async function getAssetInventory() {
  const [rows] = await pool.query(
    `SELECT a.id,
            a.asset_tag,
            a.name,
            a.category_id,
            ac.name AS category_name,
            a.serial_number,
            a.status,
            a.location,
            a.condition,
            a.is_bookable,
            a.acquisition_date,
            a.acquisition_cost
       FROM assets a
       LEFT JOIN asset_categories ac ON ac.id = a.category_id
      ORDER BY a.id ASC`
  );
  return rows;
}

async function getAllocationSummary() {
  const [rows] = await pool.query(
    `SELECT al.id,
            al.asset_id,
            a.asset_tag,
            a.name AS asset_name,
            al.employee_id,
            u.name AS employee_name,
            al.department_id,
            d.name AS department_name,
            al.allocated_date,
            al.expected_return_date,
            al.actual_return_date,
            al.status
       FROM asset_allocations al
       LEFT JOIN assets a ON a.id = al.asset_id
       LEFT JOIN users u ON u.id = al.employee_id
       LEFT JOIN departments d ON d.id = al.department_id
      ORDER BY al.id ASC`
  );
  return rows;
}

async function getTransferSummary() {
  const [rows] = await pool.query(
    `SELECT tr.id,
            tr.asset_id,
            a.asset_tag,
            a.name AS asset_name,
            tr.from_user_id,
            uf.name AS from_user_name,
            tr.to_user_id,
            ut.name AS to_user_name,
            tr.requested_by,
            rb.name AS requested_by_name,
            tr.status,
            tr.requested_at,
            tr.resolved_at
       FROM transfer_requests tr
       LEFT JOIN assets a ON a.id = tr.asset_id
       LEFT JOIN users uf ON uf.id = tr.from_user_id
       LEFT JOIN users ut ON ut.id = tr.to_user_id
       LEFT JOIN users rb ON rb.id = tr.requested_by
      ORDER BY tr.id ASC`
  );
  return rows;
}

async function getMaintenanceSummary() {
  const [rows] = await pool.query(
    `SELECT mr.id,
            mr.asset_id,
            a.asset_tag,
            a.name AS asset_name,
            mr.priority,
            mr.status,
            mr.technician_name,
            mr.created_at,
            mr.resolved_at
       FROM maintenance_requests mr
       LEFT JOIN assets a ON a.id = mr.asset_id
      ORDER BY mr.id ASC`
  );
  return rows;
}

async function getAuditSummary() {
  const [rows] = await pool.query(
    `SELECT ac.id,
            ac.name,
            ac.status,
            ac.start_date,
            ac.end_date,
            ac.department_id,
            d.name AS department_name,
            ac.created_by,
            u.name AS created_by_name
       FROM audit_cycles ac
       LEFT JOIN departments d ON d.id = ac.department_id
       LEFT JOIN users u ON u.id = ac.created_by
      ORDER BY ac.id ASC`
  );
  return rows;
}

module.exports = {
  getAssetInventory,
  getAllocationSummary,
  getTransferSummary,
  getMaintenanceSummary,
  getAuditSummary,
};
