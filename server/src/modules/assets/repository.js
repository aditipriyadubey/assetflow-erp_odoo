/**
 * server/src/modules/assets/repository.js
 * Owner: Developer 2
 *
 * Raw SQL only — no business logic (SDD §8 layering: routes ->
 * controllers -> services -> repositories -> MySQL). All queries use
 * mysql2 parameterized `?` placeholders, never string interpolation
 * (SDD §28 / §31).
 */

const pool = require('../../config/db');

const ASSET_COLUMNS = `id, asset_tag, name, category_id, serial_number, qr_code_value,
       acquisition_date, acquisition_cost, \`condition\`, location, photo_url,
       is_bookable, status, created_at, updated_at`;

/**
 * @returns {Promise<object[]>}
 */
async function findAll() {
  const [rows] = await pool.query(
    `SELECT ${ASSET_COLUMNS}
       FROM assets
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
    `SELECT ${ASSET_COLUMNS}
       FROM assets
      WHERE id = ?
      LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * @param {string} assetTag
 * @returns {Promise<object|null>}
 */
async function findByAssetTag(assetTag) {
  const [rows] = await pool.query(
    `SELECT ${ASSET_COLUMNS}
       FROM assets
      WHERE asset_tag = ?
      LIMIT 1`,
    [assetTag]
  );
  return rows[0] || null;
}

/**
 * @param {string} serialNumber
 * @returns {Promise<object|null>}
 */
async function findBySerialNumber(serialNumber) {
  const [rows] = await pool.query(
    `SELECT ${ASSET_COLUMNS}
       FROM assets
      WHERE serial_number = ?
      LIMIT 1`,
    [serialNumber]
  );
  return rows[0] || null;
}

/**
 * @param {{
 *   asset_tag: string,
 *   name: string,
 *   category_id: number,
 *   serial_number?: string|null,
 *   qr_code_value?: string|null,
 *   acquisition_date?: string|null,
 *   acquisition_cost?: number|null,
 *   condition?: string,
 *   location?: string|null,
 *   photo_url?: string|null,
 *   is_bookable?: boolean,
 *   status?: string,
 * }} asset
 * @returns {Promise<number>} newly inserted asset id
 */
async function createAsset(asset) {
  const {
    asset_tag,
    name,
    category_id,
    serial_number,
    qr_code_value,
    acquisition_date,
    acquisition_cost,
    condition,
    location,
    photo_url,
    is_bookable,
    status,
  } = asset;

  const [result] = await pool.query(
    `INSERT INTO assets (
       asset_tag, name, category_id, serial_number, qr_code_value,
       acquisition_date, acquisition_cost, \`condition\`, location,
       photo_url, is_bookable, status
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      asset_tag,
      name,
      category_id,
      serial_number,
      qr_code_value,
      acquisition_date,
      acquisition_cost,
      condition,
      location,
      photo_url,
      is_bookable,
      status,
    ]
  );
  return result.insertId;
}

/**
 * @param {number} id
 * @param {object} asset partial column map (only provided keys are updated)
 */
async function updateAsset(id, asset) {
  const columnMap = {
    name: 'name',
    category_id: 'category_id',
    serial_number: 'serial_number',
    acquisition_date: 'acquisition_date',
    acquisition_cost: 'acquisition_cost',
    condition: '`condition`',
    location: 'location',
    photo_url: 'photo_url',
    is_bookable: 'is_bookable',
    status: 'status',
  };

  const sets = [];
  const values = [];

  for (const [key, column] of Object.entries(columnMap)) {
    if (Object.prototype.hasOwnProperty.call(asset, key)) {
      sets.push(`${column} = ?`);
      values.push(asset[key]);
    }
  }

  if (sets.length === 0) {
    return;
  }

  values.push(id);

  await pool.query(
    `UPDATE assets
        SET ${sets.join(', ')}
      WHERE id = ?`,
    values
  );
}

/**
 * @param {number} id
 * @param {string} status
 */
async function updateAssetStatus(id, status) {
  await pool.query(
    `UPDATE assets
        SET status = ?
      WHERE id = ?`,
    [status, id]
  );
}

/**
 * @param {number} id
 */
async function deleteAsset(id) {
  await pool.query(
    `DELETE FROM assets
      WHERE id = ?`,
    [id]
  );
}

/**
 * @param {{
 *   category_id?: number,
 *   status?: string,
 *   condition?: string,
 *   location?: string,
 *   is_bookable?: boolean,
 *   name?: string,
 *   asset_tag?: string,
 * }} filters
 * @returns {Promise<object[]>}
 */
async function searchAssets(filters = {}) {
  const conditions = [];
  const values = [];

  if (Object.prototype.hasOwnProperty.call(filters, 'category_id')) {
    conditions.push('category_id = ?');
    values.push(filters.category_id);
  }

  if (Object.prototype.hasOwnProperty.call(filters, 'status')) {
    conditions.push('status = ?');
    values.push(filters.status);
  }

  if (Object.prototype.hasOwnProperty.call(filters, 'condition')) {
    conditions.push('`condition` = ?');
    values.push(filters.condition);
  }

  if (Object.prototype.hasOwnProperty.call(filters, 'location')) {
    conditions.push('location = ?');
    values.push(filters.location);
  }

  if (Object.prototype.hasOwnProperty.call(filters, 'is_bookable')) {
    conditions.push('is_bookable = ?');
    values.push(filters.is_bookable);
  }

  if (Object.prototype.hasOwnProperty.call(filters, 'name')) {
    conditions.push('name LIKE ?');
    values.push(`%${filters.name}%`);
  }

  if (Object.prototype.hasOwnProperty.call(filters, 'asset_tag')) {
    conditions.push('asset_tag LIKE ?');
    values.push(`%${filters.asset_tag}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT ${ASSET_COLUMNS}
       FROM assets
      ${whereClause}
      ORDER BY id ASC`,
    values
  );
  return rows;
}

module.exports = {
  findAll,
  findById,
  findByAssetTag,
  findBySerialNumber,
  createAsset,
  updateAsset,
  updateAssetStatus,
  deleteAsset,
  searchAssets,
};
