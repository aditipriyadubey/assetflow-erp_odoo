/**
 * server/src/modules/auth/repository.js
 * Owner: Developer 3
 *
 * Raw SQL only — no business logic (SDD §8 layering: routes ->
 * controllers -> services -> repositories -> MySQL). All queries use
 * mysql2 parameterized `?` placeholders, never string interpolation
 * (SDD §28 / §31).
 */

const pool = require('../../config/db');

/**
 * @param {string} email
 * @returns {Promise<object|null>} full row including password_hash
 *   (only used internally by service.js for credential comparison —
 *   never returned to a client as-is).
 */
async function findByEmail(email) {
  const [rows] = await pool.query(
    `SELECT id, name, email, password_hash, role, department_id, status,
            created_at, updated_at
       FROM users
      WHERE email = ?
      LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

/**
 * @param {number} id
 * @returns {Promise<object|null>}
 */
async function findById(id) {
  const [rows] = await pool.query(
    `SELECT id, name, email, password_hash, role, department_id, status,
            created_at, updated_at
       FROM users
      WHERE id = ?
      LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Inserts a new user. `role` defaults to 'Employee' — callers outside
 * the signup flow must never pass anything else through this function
 * without going through the dedicated PATCH /users/:id/role endpoint
 * (the only role-change path per SDD §18).
 * @param {{name:string, email:string, passwordHash:string, role?:string}} input
 * @returns {Promise<number>} newly inserted user id
 */
async function createUser({ name, email, passwordHash, role = 'Employee' }) {
  const [result] = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, status)
     VALUES (?, ?, ?, ?, ?)`,
    [name, email, passwordHash, role, 'Active']
  );
  return result.insertId;
}

/**
 * Updates the password hash and clears any pending reset token in one
 * statement (used by both the reset-password flow and, potentially,
 * a future change-password flow).
 * @param {number} userId
 * @param {string} passwordHash
 */
async function updatePasswordHash(userId, passwordHash) {
  await pool.query(
    `UPDATE users
        SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL
      WHERE id = ?`,
    [passwordHash, userId]
  );
}

/**
 * @param {number} userId
 * @param {string} token
 * @param {Date} expiresAt
 */
async function setResetToken(userId, token, expiresAt) {
  await pool.query(
    `UPDATE users
        SET reset_token = ?, reset_token_expires = ?
      WHERE id = ?`,
    [token, expiresAt, userId]
  );
}

/**
 * @param {string} token
 * @returns {Promise<object|null>}
 */
async function findByResetToken(token) {
  const [rows] = await pool.query(
    `SELECT id, email, status, reset_token, reset_token_expires
       FROM users
      WHERE reset_token = ?
      LIMIT 1`,
    [token]
  );
  return rows[0] || null;
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  updatePasswordHash,
  setResetToken,
  findByResetToken,
};