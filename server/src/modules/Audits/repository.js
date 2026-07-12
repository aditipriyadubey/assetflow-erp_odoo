// Manages data access operations for audits, including database queries and persistence.

const pool = require('../../config/db');

const CYCLE_SELECT = `
  SELECT id, name, department_id, location, start_date, end_date,
         status, created_by, closed_at
  FROM audit_cycles
`;

const ITEM_SELECT = `
  SELECT id, audit_cycle_id, asset_id, verification_status, notes,
         verified_by, verified_at
  FROM audit_items
`;

const DISCREPANCY_SELECT = `
  SELECT id, audit_item_id, issue_type, description, resolution_status, created_at
  FROM discrepancy_reports
`;

async function withTransaction(work) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// ---------------------------------------------------------------------
// audit_cycles
// ---------------------------------------------------------------------

async function findAllCycles({ status, departmentId } = {}) {
  const clauses = [];
  const params = [];

  if (status) {
    clauses.push('status = ?');
    params.push(status);
  }

  if (departmentId) {
    clauses.push('department_id = ?');
    params.push(departmentId);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const [rows] = await pool.query(`${CYCLE_SELECT} ${where} ORDER BY start_date DESC`, params);
  return rows;
}

async function findCycleById(id) {
  const [rows] = await pool.query(`${CYCLE_SELECT} WHERE id = ?`, [id]);
  return rows[0] || null;
}

async function findCycleByIdForUpdate(conn, id) {
  const [rows] = await conn.query(`${CYCLE_SELECT} WHERE id = ? FOR UPDATE`, [id]);
  return rows[0] || null;
}

async function createCycle({ name, departmentId, location, startDate, endDate, createdBy }) {
  const [result] = await pool.query(
    `INSERT INTO audit_cycles
       (name, department_id, location, start_date, end_date, status, created_by)
     VALUES (?, ?, ?, ?, ?, 'Draft', ?)`,
    [name, departmentId, location, startDate, endDate, createdBy]
  );

  const [rows] = await pool.query(`${CYCLE_SELECT} WHERE id = ?`, [result.insertId]);
  return rows[0];
}

async function updateCycleStatus(conn, id, { status, closedAt = null }) {
  await conn.query(
    `UPDATE audit_cycles
     SET status = ?, closed_at = ?
     WHERE id = ?`,
    [status, closedAt, id]
  );

  const [rows] = await conn.query(`${CYCLE_SELECT} WHERE id = ?`, [id]);
  return rows[0];
}

// ---------------------------------------------------------------------
// assets matching (scoping for auto-populate)
// ---------------------------------------------------------------------

// Matches assets by department (via an active allocation) and/or location.
// Excludes assets in terminal states, since auditing a disposed/retired asset
// is not meaningful.
async function findMatchingAssetIds(conn, { departmentId, location }) {
  const clauses = ["a.status NOT IN ('Retired', 'Disposed')"];
  const params = [];

  if (departmentId) {
    clauses.push(`a.id IN (
      SELECT aa.asset_id FROM asset_allocations aa
      WHERE aa.department_id = ? AND aa.status = 'Active'
    )`);
    params.push(departmentId);
  }

  if (location) {
    clauses.push('a.location = ?');
    params.push(location);
  }

  const sql = `SELECT a.id FROM assets a WHERE ${clauses.join(' AND ')}`;
  const [rows] = await conn.query(sql, params);
  return rows.map((row) => row.id);
}

// ---------------------------------------------------------------------
// audit_items
// ---------------------------------------------------------------------

async function bulkInsertAuditItems(conn, cycleId, assetIds) {
  if (!assetIds.length) {
    return 0;
  }

  const values = assetIds.map((assetId) => [cycleId, assetId, 'Pending']);

  const [result] = await conn.query(
    `INSERT IGNORE INTO audit_items (audit_cycle_id, asset_id, verification_status)
     VALUES ?`,
    [values]
  );

  return result.affectedRows;
}

async function findItemsByCycle(cycleId, { verificationStatus } = {}) {
  const clauses = ['audit_cycle_id = ?'];
  const params = [cycleId];

  if (verificationStatus) {
    clauses.push('verification_status = ?');
    params.push(verificationStatus);
  }

  const [rows] = await pool.query(
    `${ITEM_SELECT} WHERE ${clauses.join(' AND ')} ORDER BY id ASC`,
    params
  );
  return rows;
}

async function findItemByIdForUpdate(conn, itemId) {
  const [rows] = await conn.query(`${ITEM_SELECT} WHERE id = ? FOR UPDATE`, [itemId]);
  return rows[0] || null;
}

async function findItemsByStatusForUpdate(conn, cycleId, statuses) {
  const placeholders = statuses.map(() => '?').join(', ');
  const [rows] = await conn.query(
    `${ITEM_SELECT} WHERE audit_cycle_id = ? AND verification_status IN (${placeholders}) FOR UPDATE`,
    [cycleId, ...statuses]
  );
  return rows;
}

async function updateItemVerification(conn, itemId, { verificationStatus, notes, verifiedBy, verifiedAt }) {
  await conn.query(
    `UPDATE audit_items
     SET verification_status = ?, notes = ?, verified_by = ?, verified_at = ?
     WHERE id = ?`,
    [verificationStatus, notes, verifiedBy, verifiedAt, itemId]
  );

  const [rows] = await conn.query(`${ITEM_SELECT} WHERE id = ?`, [itemId]);
  return rows[0];
}

// ---------------------------------------------------------------------
// audit_cycle_auditors
// ---------------------------------------------------------------------

async function assignAuditors(conn, cycleId, auditorIds) {
  const values = auditorIds.map((auditorId) => [cycleId, auditorId]);

  await conn.query(
    `INSERT IGNORE INTO audit_cycle_auditors (audit_cycle_id, auditor_id) VALUES ?`,
    [values]
  );
}

async function listAuditors(conn, cycleId) {
  const [rows] = await conn.query(
    `SELECT audit_cycle_id, auditor_id FROM audit_cycle_auditors WHERE audit_cycle_id = ?`,
    [cycleId]
  );
  return rows;
}

// ---------------------------------------------------------------------
// discrepancy_reports
// ---------------------------------------------------------------------

async function upsertDiscrepancyReport(conn, { auditItemId, issueType, description }) {
  const [existingRows] = await conn.query(
    `${DISCREPANCY_SELECT} WHERE audit_item_id = ? FOR UPDATE`,
    [auditItemId]
  );

  if (existingRows.length > 0) {
    await conn.query(
      `UPDATE discrepancy_reports
       SET issue_type = ?, description = ?
       WHERE audit_item_id = ?`,
      [issueType, description, auditItemId]
    );
  } else {
    await conn.query(
      `INSERT INTO discrepancy_reports (audit_item_id, issue_type, description, resolution_status)
       VALUES (?, ?, ?, 'Open')`,
      [auditItemId, issueType, description]
    );
  }

  const [rows] = await conn.query(`${DISCREPANCY_SELECT} WHERE audit_item_id = ?`, [auditItemId]);
  return rows[0];
}

async function findDiscrepancyReportsByCycle(cycleId) {
  const sql = `
    SELECT dr.id, dr.audit_item_id, dr.issue_type, dr.description,
           dr.resolution_status, dr.created_at
    FROM discrepancy_reports dr
    INNER JOIN audit_items ai ON ai.id = dr.audit_item_id
    WHERE ai.audit_cycle_id = ?
    ORDER BY dr.created_at DESC
  `;
  const [rows] = await pool.query(sql, [cycleId]);
  return rows;
}

module.exports = {
  withTransaction,
  findAllCycles,
  findCycleById,
  findCycleByIdForUpdate,
  createCycle,
  updateCycleStatus,
  findMatchingAssetIds,
  bulkInsertAuditItems,
  findItemsByCycle,
  findItemByIdForUpdate,
  findItemsByStatusForUpdate,
  updateItemVerification,
  assignAuditors,
  listAuditors,
  upsertDiscrepancyReport,
  findDiscrepancyReportsByCycle,
};