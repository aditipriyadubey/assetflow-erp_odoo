/**
 * server/src/modules/allocations/repository.js
 * Owner: Developer 2
 *
 * Raw SQL only — no business logic (SDD §8 layering: routes ->
 * controllers -> services -> repositories -> MySQL).
 */

const pool = require('../../config/db');

const ALLOCATION_COLUMNS = `id, asset_id, employee_id, department_id,
  allocated_date, expected_return_date, actual_return_date,
  condition_checkin_notes, status, allocated_by, created_at, updated_at`;

/**
 * @returns {Promise<object[]>}
 */
async function findAll() {
  const [rows] = await pool.query(
    `SELECT ${ALLOCATION_COLUMNS}
       FROM asset_allocations
      ORDER BY id ASC`
  );
  return rows;
}

/**
 * @param {number} id
 * @returns {Promise<object|null>}
 */
async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${ALLOCATION_COLUMNS}
       FROM asset_allocations
      WHERE id = ?
      LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * @param {number} assetId
 * @returns {Promise<object|null>}
 */
async function findActiveByAssetId(assetId) {
  const [rows] = await pool.query(
    `SELECT ${ALLOCATION_COLUMNS}
       FROM asset_allocations
      WHERE asset_id = ? AND status = 'Active'
      LIMIT 1`,
    [assetId]
  );
  return rows[0] || null;
}

/**
 * @param {{asset_id:number, employee_id:number|null, department_id:number|null, allocated_date:string, expected_return_date:string|null, actual_return_date:string|null, condition_checkin_notes:string|null, status:string, allocated_by:number}} allocation
 * @returns {Promise<number>} newly inserted allocation id
 */
async function createAllocation(allocation) {
  const {
    asset_id,
    employee_id,
    department_id,
    allocated_date,
    expected_return_date,
    actual_return_date,
    condition_checkin_notes,
    status,
    allocated_by,
  } = allocation;

  const [result] = await pool.query(
    `INSERT INTO asset_allocations (
       asset_id, employee_id, department_id, allocated_date,
       expected_return_date, actual_return_date, condition_checkin_notes,
       status, allocated_by
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
    [
      asset_id,
      employee_id,
      department_id,
      allocated_date,
      expected_return_date,
      actual_return_date,
      condition_checkin_notes,
      status,
      allocated_by,
    ]
  );
  return result.insertId;
}

/**
 * @param {number} id
 * @param {object} allocation partial column map (only provided keys are updated)
 */
async function updateAllocation(id, allocation) {
  const columnMap = {
    asset_id: 'asset_id',
    employee_id: 'employee_id',
    department_id: 'department_id',
    allocated_date: 'allocated_date',
    expected_return_date: 'expected_return_date',
    actual_return_date: 'actual_return_date',
    condition_checkin_notes: 'condition_checkin_notes',
    status: 'status',
    allocated_by: 'allocated_by',
  };

  const sets = [];
  const values = [];

  for (const [key, column] of Object.entries(columnMap)) {
    if (Object.prototype.hasOwnProperty.call(allocation, key)) {
      sets.push(`${column} = ?`);
      values.push(allocation[key]);
    }
  }

  if (sets.length === 0) {
    return;
  }

  values.push(id);

  await pool.query(
    `UPDATE asset_allocations
        SET ${sets.join(', ')}
      WHERE id = ?`,
    values
  );
}

/**
 * @param {number} id
 */
async function deleteAllocation(id) {
  await pool.query(
    `DELETE FROM asset_allocations
      WHERE id = ?`,
    [id]
  );
}

module.exports = {
  findAll,
  findById,
  findActiveByAssetId,
  createAllocation,
  updateAllocation,
  deleteAllocation,
};
