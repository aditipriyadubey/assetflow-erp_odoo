/**
 * server/src/modules/categories/repository.js
 * Owner: Developer 3
 *
 * Raw SQL only — no business logic (SDD §8 layering). All queries use
 * mysql2 parameterized `?` placeholders, never string interpolation
 * (SDD §28 / §31).
 */

const pool = require('../../config/db');

const COLUMNS = 'id, name, description, custom_fields, created_at, updated_at';

/**
 * @returns {Promise<object[]>}
 */
async function findAll() {
  const [rows] = await pool.query(`SELECT ${COLUMNS} FROM asset_categories ORDER BY name ASC`);
  return rows;
}

/**
 * @param {number} id
 * @returns {Promise<object|null>}
 */
async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM asset_categories WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * @param {string} name
 * @returns {Promise<object|null>}
 */
async function findByName(name) {
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM asset_categories WHERE name = ? LIMIT 1`,
    [name]
  );
  return rows[0] || null;
}

/**
 * @param {{name:string, description?:string|null, custom_fields?:object|null}} input
 * @returns {Promise<number>} newly inserted category id
 */
async function create({ name, description = null, custom_fields = null }) {
  const [result] = await pool.query(
    `INSERT INTO asset_categories (name, description, custom_fields)
     VALUES (?, ?, ?)`,
    [name, description, custom_fields ? JSON.stringify(custom_fields) : null]
  );
  return result.insertId;
}

/**
 * @param {number} id
 * @param {{name:string, description?:string|null, custom_fields?:object|null}} input
 */
async function update(id, { name, description = null, custom_fields = null }) {
  await pool.query(
    `UPDATE asset_categories
        SET name = ?, description = ?, custom_fields = ?
      WHERE id = ?`,
    [name, description, custom_fields ? JSON.stringify(custom_fields) : null, id]
  );
}

/**
 * @param {number} id
 */
async function remove(id) {
  await pool.query('DELETE FROM asset_categories WHERE id = ?', [id]);
}

/**
 * Blocks category deletion while assets still reference it (SDD
 * §14.4 / §26: "Deleting a category referenced by assets → 409
 * blocked."). Reads the `assets` table directly since its owning
 * module (Developer 2) has not landed yet in this phase — this should
 * be replaced with a call through assets/repository.js once that
 * module exists, per SDD Shared Contracts §A.5.
 * @param {number} categoryId
 * @returns {Promise<number>}
 */
async function countAssetsInCategory(categoryId) {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM assets WHERE category_id = ?', [
    categoryId,
  ]);
  return rows[0].total;
}

module.exports = {
  findAll,
  findById,
  findByName,
  create,
  update,
  remove,
  countAssetsInCategory,
};