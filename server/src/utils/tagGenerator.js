/**
 * server/src/utils/tagGenerator.js
 *
 * Shared utilities for generating server-side asset identifiers.
 * Asset tags and QR code values are never accepted from clients;
 * callers use these helpers to produce unique, formatted values.
 */

const pool = require('../config/db');

const TAG_PREFIX = 'AF';
const TAG_PAD_LENGTH = 4;
const TAG_PATTERN = /^AF-(\d+)$/;

/**
 * @param {number} sequence
 * @returns {string}
 */
function formatAssetTag(sequence) {
  return `${TAG_PREFIX}-${String(sequence).padStart(TAG_PAD_LENGTH, '0')}`;
}

/**
 * Reads the highest numeric suffix from existing asset tags.
 * @returns {Promise<number>}
 */
async function getHighestSequence() {
  const [rows] = await pool.query(
    `SELECT asset_tag
       FROM assets
      WHERE asset_tag LIKE ?
      ORDER BY CAST(SUBSTRING(asset_tag, 4) AS UNSIGNED) DESC
      LIMIT 1`,
    [`${TAG_PREFIX}-%`]
  );

  if (rows.length === 0) {
    return 0;
  }

  const match = rows[0].asset_tag.match(TAG_PATTERN);
  if (!match) {
    return 0;
  }

  return parseInt(match[1], 10);
}

/**
 * Generates the next unique asset tag (e.g. AF-0006).
 * Retries when concurrent requests produce the same candidate.
 * @param {number} [maxAttempts=5]
 * @returns {Promise<string>}
 */
async function generateAssetTag(maxAttempts = 5) {
  const baseSequence = await getHighestSequence();

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = formatAssetTag(baseSequence + attempt + 1);

    const [existing] = await pool.query(
      'SELECT id FROM assets WHERE asset_tag = ? LIMIT 1',
      [candidate]
    );

    if (existing.length === 0) {
      return candidate;
    }
  }

  throw new Error('Unable to generate a unique asset tag.');
}

/**
 * Derives the QR code payload from a generated asset tag.
 * @param {string} assetTag
 * @returns {string}
 */
function generateQrCodeValue(assetTag) {
  return `QR-${assetTag}`;
}

module.exports = {
  formatAssetTag,
  generateAssetTag,
  generateQrCodeValue,
};
