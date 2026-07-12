/**
 * server/src/modules/departments/repository.js
 * Owner: Developer 3
 *
 * Raw SQL only — no business logic (SDD §8 layering). All queries use
 * mysql2 parameterized `?` placeholders, never string interpolation
 * (SDD §28 / §31). Developer 3 is the sole owner of schema.sql; this
 * file is the only place application code reads/writes `departments`.
 */

const pool = require('../../config/db');

const COLUMNS = 'id, name, head_user_id, parent_department_id, status, created_at, updated_at';

/**
 * @returns {Promise<object[]>} flat list of all departments
 */
async function findAll() {
  const [rows] = await pool.query(`SELECT ${COLUMNS} FROM departments ORDER BY name ASC`);
  return rows;
}

/**
 * @param {number} id
 * @returns {Promise<object|null>}
 */
async function findById(id) {
  const [rows] = await pool.query(`SELECT ${COLUMNS} FROM departments WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

/**
 * @param {string} name
 * @returns {Promise<object|null>}
 */
async function findByName(name) {
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM departments WHERE name = ? LIMIT 1`,
    [name]
  );
  return rows[0] || null;
}

/**
 * @param {{name:string, head_user_id?:number|null, parent_department_id?:number|null}} input
 * @returns {Promise<number>} newly inserted department id
 */
async function create({ name, head_user_id = null, parent_department_id = null }) {
  const [result] = await pool.query(
    `INSERT INTO departments (name, head_user_id, parent_department_id, status)
     VALUES (?, ?, ?, 'Active')`,
    [name, head_user_id, parent_department_id]
  );
  return result.insertId;
}

/**
 * @param {number} id
 * @param {{name:string, head_user_id?:number|null, parent_department_id?:number|null}} input
 */
async function update(id, { name, head_user_id = null, parent_department_id = null }) {
  await pool.query(
    `UPDATE departments
        SET name = ?, head_user_id = ?, parent_department_id = ?
      WHERE id = ?`,
    [name, head_user_id, parent_department_id, id]
  );
}

/**
 * @param {number} id
 * @param {string} status
 */
async function updateStatus(id, status) {
  await pool.query('UPDATE departments SET status = ? WHERE id = ?', [status, id]);
}

/**
 * Blocks deactivating a department that other departments still list
 * as their parent (avoids orphaning the hierarchy).
 * @param {number} id
 * @returns {Promise<number>}
 */
async function countChildDepartments(id) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS total FROM departments WHERE parent_department_id = ?',
    [id]
  );
  return rows[0].total;
}

module.exports = {
  findAll,
  findById,
  findByName,
  create,
  update,
  updateStatus,
  countChildDepartments,
};