// Manages data access operations for maintenance requests, including database queries and persistence.

const pool = require('../../config/db');

const BASE_SELECT = `
  SELECT id, asset_id, raised_by, issue_description, priority, photo_url,
         status, approved_by, technician_name, resolved_at, created_at, updated_at
  FROM maintenance_requests
`;

async function findAll({ status, priority, assetId } = {}) {
  const clauses = [];
  const params = [];

  if (status) {
    clauses.push('status = ?');
    params.push(status);
  }

  if (priority) {
    clauses.push('priority = ?');
    params.push(priority);
  }

  if (assetId) {
    clauses.push('asset_id = ?');
    params.push(assetId);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const sql = `${BASE_SELECT} ${where} ORDER BY created_at DESC`;

  const [rows] = await pool.query(sql, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(`${BASE_SELECT} WHERE id = ?`, [id]);
  return rows[0] || null;
}

async function create({ assetId, raisedBy, issueDescription, priority, photoUrl }) {
  const [result] = await pool.query(
    `INSERT INTO maintenance_requests
       (asset_id, raised_by, issue_description, priority, photo_url, status)
     VALUES (?, ?, ?, ?, ?, 'Pending')`,
    [assetId, raisedBy, issueDescription, priority, photoUrl]
  );

  const [rows] = await pool.query(`${BASE_SELECT} WHERE id = ?`, [result.insertId]);
  return rows[0];
}

async function updateStatus(id, { status, approvedBy, technicianName, resolvedAt }) {
  await pool.query(
    `UPDATE maintenance_requests
     SET status = ?, approved_by = ?, technician_name = ?, resolved_at = ?
     WHERE id = ?`,
    [status, approvedBy || null, technicianName || null, resolvedAt, id]
  );

  const [rows] = await pool.query(`${BASE_SELECT} WHERE id = ?`, [id]);
  return rows[0];
}

async function close(id) {
  await pool.query(
    `UPDATE maintenance_requests
     SET status = 'Resolved', resolved_at = NOW()
     WHERE id = ?`,
    [id]
  );

  const [rows] = await pool.query(`${BASE_SELECT} WHERE id = ?`, [id]);
  return rows[0];
}

module.exports = {
  findAll,
  findById,
  create,
  updateStatus,
  close,
};