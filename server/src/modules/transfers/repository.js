/**
 * server/src/modules/transfers/repository.js
 * Owner: Developer 2
 *
 * Raw SQL only — no business logic (SDD §8 layering: routes ->
 * controllers -> services -> repositories -> MySQL).
 */

const pool = require('../../config/db');

const TRANSFER_COLUMNS = `id, asset_id, from_user_id, to_user_id, requested_by, status, approved_by, requested_at, resolved_at`;

/**
 * @returns {Promise<object[]>}
 */
async function findAll() {
  const [rows] = await pool.query(
    `SELECT ${TRANSFER_COLUMNS}
       FROM transfer_requests
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
    `SELECT ${TRANSFER_COLUMNS}
       FROM transfer_requests
      WHERE id = ?
      LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * @param {{asset_id:number, from_user_id:number|null, to_user_id:number, requested_by:number, status?:string}} transfer
 * @returns {Promise<number>} newly inserted transfer id
 */
async function createTransfer({ asset_id, from_user_id = null, to_user_id, requested_by, status = 'Requested' }) {
  const [result] = await pool.query(
    `INSERT INTO transfer_requests (asset_id, from_user_id, to_user_id, requested_by, status)
     VALUES (?, ?, ?, ?, ?)`,
    [asset_id, from_user_id, to_user_id, requested_by, status]
  );
  return result.insertId;
}

/**
 * @param {number} id
 * @param {{status:string, approved_by:number|null, resolved_at:Date|null}} update
 */
async function updateTransferStatus(id, { status, approved_by = null, resolved_at = null }) {
  await pool.query(
    `UPDATE transfer_requests
        SET status = ?, approved_by = ?, resolved_at = ?
      WHERE id = ?`,
    [status, approved_by, resolved_at, id]
  );
}

module.exports = {
  findAll,
  findById,
  createTransfer,
  updateTransferStatus,
};
