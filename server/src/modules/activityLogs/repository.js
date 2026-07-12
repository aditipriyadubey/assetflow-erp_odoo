/**
 * server/src/modules/activityLogs/repository.js
 * Owner: Developer 3
 *
 * Raw SQL only — no business logic (SDD §8 layering). All queries use
 * mysql2 parameterized `?` placeholders, never string interpolation
 * (SDD §28 / §31).
 *
 * The activity log is append-only (SDD §31: "no update/delete
 * endpoint exposed so it remains a trustworthy audit trail") — this
 * file intentionally exposes no update or delete function at all.
 *
 * `create` is the cross-module write path other modules' service
 * layers will use to record actions (SDD §9, §28, §31) — consumed via
 * activityLogs/service.js per Shared Contracts §A.5, never by
 * importing this repository directly from another module.
 */

const pool = require('../../config/db');

const COLUMNS = 'id, user_id, action, entity_type, entity_id, details, created_at';

/**
 * Paginated, filterable list for GET /activity-logs (Admin only,
 * SDD §14.13: "?entity_type=&entity_id=&user_id=").
 * @param {{entity_type?:string, entity_id?:number, user_id?:number, page:number, limit:number}} filters
 * @returns {Promise<{rows:object[], total:number}>}
 */
async function findAll({ entity_type, entity_id, user_id, page, limit }) {
  const where = [];
  const params = [];

  if (entity_type) {
    where.push('entity_type = ?');
    params.push(entity_type);
  }
  if (entity_id !== undefined) {
    where.push('entity_id = ?');
    params.push(entity_id);
  }
  if (user_id !== undefined) {
    where.push('user_id = ?');
    params.push(user_id);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT ${COLUMNS}
       FROM activity_logs
       ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM activity_logs ${whereClause}`,
    params
  );

  return { rows, total: countRows[0].total };
}

/**
 * Inserts one immutable audit-trail row (SDD FR-9.2: "actor, action,
 * entity type/id, timestamp, metadata — immutable, append-only").
 * @param {{user_id:number, action:string, entity_type:string, entity_id:number, details?:object|null}} input
 * @returns {Promise<number>} newly inserted log id
 */
async function create({ user_id, action, entity_type, entity_id, details = null }) {
  const [result] = await pool.query(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, action, entity_type, entity_id, details ? JSON.stringify(details) : null]
  );
  return result.insertId;
}

module.exports = {
  findAll,
  create,
};