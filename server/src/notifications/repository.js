/**
 * server/src/modules/notifications/repository.js
 * Owner: Developer 3
 *
 * Raw SQL only — no business logic (SDD §8 layering: routes ->
 * controllers -> services -> repositories -> MySQL). All queries use
 * mysql2 parameterized `?` placeholders, never string interpolation
 * (SDD §28 / §31).
 *
 * `create` is also the cross-module write path other modules' service
 * layers will use to emit notifications (SDD §23 Notification
 * Workflow: "each writes one notifications row per relevant recipient,
 * inside the same transaction as the state change that caused it") —
 * consumed via notifications/service.js per Shared Contracts §A.5,
 * never by importing this repository directly from another module.
 */

const pool = require('../../config/db');

const COLUMNS =
  'id, user_id, type, message, related_entity_type, related_entity_id, is_read, created_at';

/**
 * Paginated, filterable list scoped to a single user (SDD §14.13:
 * "GET /notifications | own notifications, ?is_read=").
 * @param {{user_id:number, is_read?:boolean, page:number, limit:number}} filters
 * @returns {Promise<{rows:object[], total:number}>}
 */
async function findAllForUser({ user_id, is_read, page, limit }) {
  const where = ['user_id = ?'];
  const params = [user_id];

  if (is_read !== undefined) {
    where.push('is_read = ?');
    params.push(is_read);
  }

  const whereClause = `WHERE ${where.join(' AND ')}`;
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT ${COLUMNS}
       FROM notifications
       ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM notifications ${whereClause}`,
    params
  );

  return { rows, total: countRows[0].total };
}

/**
 * Scoped lookup — only returns the row if it belongs to `userId`, so
 * the service layer can enforce "own notifications only" (SDD §14.13)
 * without a separate ownership query.
 * @param {number} id
 * @param {number} userId
 * @returns {Promise<object|null>}
 */
async function findByIdForUser(id, userId) {
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM notifications WHERE id = ? AND user_id = ? LIMIT 1`,
    [id, userId]
  );
  return rows[0] || null;
}

/**
 * @param {number} id
 */
async function markAsRead(id) {
  await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
}

/**
 * Inserts one notification row for one recipient (SDD §23: one row
 * per relevant recipient — callers loop for multi-recipient events).
 * @param {{user_id:number, type:string, message:string, related_entity_type?:string|null, related_entity_id?:number|null}} input
 * @returns {Promise<number>} newly inserted notification id
 */
async function create({
  user_id,
  type,
  message,
  related_entity_type = null,
  related_entity_id = null,
}) {
  const [result] = await pool.query(
    `INSERT INTO notifications
       (user_id, type, message, related_entity_type, related_entity_id, is_read)
     VALUES (?, ?, ?, ?, ?, FALSE)`,
    [user_id, type, message, related_entity_type, related_entity_id]
  );
  return result.insertId;
}

module.exports = {
  findAllForUser,
  findByIdForUser,
  markAsRead,
  create,
};