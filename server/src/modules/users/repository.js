/**
 * server/src/modules/users/repository.js
 * Owner: Developer 3
 *
 * Raw SQL only — no business logic (SDD §8 layering: routes ->
 * controllers -> services -> repositories -> MySQL). All queries use
 * mysql2 parameterized `?` placeholders, never string interpolation
 * (SDD §28 / §31).
 *
 * This module owns the Employee Directory queries (FR-2.3, SDD §14.2).
 * auth/repository.js remains the sole owner of credential-related
 * queries (findByEmail, password hash updates, reset tokens) — nothing
 * here duplicates that.
 */

const pool = require('../../config/db');

const SAFE_COLUMNS = 'id, name, email, role, department_id, status, created_at, updated_at';

/**
 * Paginated, filterable list for GET /users (Admin only, SDD §14.2).
 * @param {{department_id?:number, role?:string, status?:string, page:number, limit:number}} filters
 * @returns {Promise<{rows:object[], total:number}>}
 */
async function findAll({ department_id, role, status, page, limit }) {
  const where = [];
  const params = [];

  if (department_id !== undefined) {
    where.push('department_id = ?');
    params.push(department_id);
  }
  if (role) {
    where.push('role = ?');
    params.push(role);
  }
  if (status) {
    where.push('status = ?');
    params.push(status);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT ${SAFE_COLUMNS}
       FROM users
       ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM users ${whereClause}`,
    params
  );

  return { rows, total: countRows[0].total };
}

/**
 * @param {number} id
 * @returns {Promise<object|null>} safe-column row (never password_hash)
 */
async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${SAFE_COLUMNS} FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * PATCH /users/:id — updates department and/or status only (SDD
 * §14.2). Role is never touched here; see updateRole.
 * @param {number} id
 * @param {{department_id?:number|null, status?:string}} changes
 */
async function updateDepartmentAndStatus(id, { department_id, status }) {
  const sets = [];
  const params = [];

  if (department_id !== undefined) {
    sets.push('department_id = ?');
    params.push(department_id);
  }
  if (status !== undefined) {
    sets.push('status = ?');
    params.push(status);
  }

  if (sets.length === 0) return;

  params.push(id);
  await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, params);
}

/**
 * The ONLY function that may change a user's role (SDD §14.2 / §18 —
 * "Role changes: only PATCH /users/:id/role by Admin").
 * @param {number} id
 * @param {string} role
 */
async function updateRole(id, role) {
  await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
}

/**
 * @param {number} id
 */
async function deactivate(id) {
  await pool.query("UPDATE users SET status = 'Inactive' WHERE id = ?", [id]);
}

/**
 * Cross-module read used by the departments service (SDD Shared
 * Contracts §A.5) to block deactivating a department that still has
 * active employees assigned to it.
 * @param {number} departmentId
 * @returns {Promise<number>}
 */
async function countActiveUsersInDepartment(departmentId) {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total FROM users WHERE department_id = ? AND status = 'Active'",
    [departmentId]
  );
  return rows[0].total;
}

module.exports = {
  findAll,
  findById,
  updateDepartmentAndStatus,
  updateRole,
  deactivate,
  countActiveUsersInDepartment,
};