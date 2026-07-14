/**
 * server/src/modules/bookings/repository.js
 * Owner: Developer 4
 *
 * MISSING FILE — this file was 0 bytes in the submitted ZIP. Raw
 * parameterized SQL only, no business logic (SDD §8 layering).
 */

const pool = require('../../config/db');

const BOOKING_COLUMNS = `id, asset_id, booked_by, department_id, purpose,
  start_time, end_time, status, created_at, updated_at`;

/**
 * @param {{asset_id?:number, from?:string, to?:string, status?:string}} filters
 * @returns {Promise<object[]>}
 */
async function findAll(filters = {}) {
  const clauses = [];
  const values = [];

  if (filters.asset_id) {
    clauses.push('asset_id = ?');
    values.push(filters.asset_id);
  }
  if (filters.status) {
    clauses.push('status = ?');
    values.push(filters.status);
  }
  if (filters.from) {
    clauses.push('end_time >= ?');
    values.push(filters.from);
  }
  if (filters.to) {
    clauses.push('start_time <= ?');
    values.push(filters.to);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT ${BOOKING_COLUMNS} FROM bookings ${where} ORDER BY start_time ASC`,
    values
  );
  return rows;
}

/**
 * @param {number} id
 * @returns {Promise<object|null>}
 */
async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${BOOKING_COLUMNS} FROM bookings WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Transactional overlap check + insert, per SDD §20's exact query
 * pattern. Runs both statements against the SAME connection inside a
 * transaction with FOR UPDATE, so two concurrent requests for the
 * same slot cannot both succeed (this is the actual "no double
 * booking" guarantee — not just an app-layer check).
 *
 * @param {{asset_id:number, booked_by:number, department_id:number|null, purpose:string|null, start_time:string, end_time:string}} booking
 * @returns {Promise<{id:number}|{conflict:true}>}
 */
async function createIfNoOverlap(booking) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [conflicts] = await conn.query(
      `SELECT id FROM bookings
        WHERE asset_id = ?
          AND status IN ('Upcoming','Ongoing')
          AND start_time < ?
          AND end_time > ?
        FOR UPDATE`,
      [booking.asset_id, booking.end_time, booking.start_time]
    );

    if (conflicts.length > 0) {
      await conn.rollback();
      return { conflict: true };
    }

    const [result] = await conn.query(
      `INSERT INTO bookings (asset_id, booked_by, department_id, purpose, start_time, end_time, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Upcoming')`,
      [
        booking.asset_id,
        booking.booked_by,
        booking.department_id,
        booking.purpose,
        booking.start_time,
        booking.end_time,
      ]
    );

    await conn.commit();
    return { id: result.insertId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * @param {number} id
 * @param {string} status
 */
async function updateStatus(id, status) {
  await pool.query(`UPDATE bookings SET status = ? WHERE id = ?`, [status, id]);
}

module.exports = {
  findAll,
  findById,
  createIfNoOverlap,
  updateStatus,
};
