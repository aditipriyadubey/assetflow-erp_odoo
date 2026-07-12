/**
 * server/src/modules/assets/service.js
 * Owner: Developer 2
 *
 * Pure business logic for the assets module (SDD §8 layering). Never
 * touches req/res. Every failure path throws a typed AppError
 * (SDD §28); the central error-handling middleware converts that into
 * the standard error envelope (SDD Shared Contracts §A.1/A.2).
 */

const repository = require('./repository');
const AppError = require('../../utils/AppError');
const tagGenerator = require('../../utils/tagGenerator');

/**
 * @param {object} asset
 * @returns {object|null}
 */
function sanitizeAsset(asset) {
  if (!asset) return null;
  return {
    id: asset.id,
    asset_tag: asset.asset_tag,
    name: asset.name,
    category_id: asset.category_id,
    serial_number: asset.serial_number,
    qr_code_value: asset.qr_code_value,
    acquisition_date: asset.acquisition_date,
    acquisition_cost: asset.acquisition_cost,
    condition: asset.condition,
    location: asset.location,
    photo_url: asset.photo_url,
    is_bookable: Boolean(asset.is_bookable),
    status: asset.status,
    created_at: asset.created_at,
    updated_at: asset.updated_at,
  };
}

/**
 * Maps repository / MySQL constraint failures to typed AppErrors.
 * @param {Error & {code?: string, message?: string}} err
 */
function handleRepositoryError(err) {
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    throw new AppError('NOT_FOUND', 'Category not found.', 404);
  }

  if (err.code === 'ER_DUP_ENTRY') {
    if (err.message && err.message.includes('uq_assets_serial')) {
      throw new AppError(
        'VALIDATION_ERROR',
        'An asset with this serial number already exists.',
        409,
        { serial_number: 'An asset with this serial number already exists.' }
      );
    }

    throw new AppError('VALIDATION_ERROR', 'An asset with this identifier already exists.', 409);
  }

  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    throw new AppError(
      'VALIDATION_ERROR',
      'This asset cannot be deleted because it is referenced by other records.',
      409
    );
  }

  throw err;
}

/**
 * Defense-in-depth: validators.js already rejects these keys, but the
 * service layer never trusts raw client input (SDD §28).
 * @param {object} assetData
 * @param {'create'|'update'} mode
 */
function rejectClientControlledFields(assetData, mode) {
  const forbidden = ['id', 'asset_tag', 'qr_code_value', 'created_at', 'updated_at'];

  if (mode === 'create') {
    forbidden.push('status');
  }

  for (const field of forbidden) {
    if (Object.prototype.hasOwnProperty.call(assetData, field)) {
      const message =
        field === 'asset_tag'
          ? mode === 'create'
            ? 'Asset tag cannot be set by the client.'
            : 'Asset tag cannot be changed.'
          : field === 'status' && mode === 'create'
            ? 'Status cannot be set when creating an asset.'
            : `${field} cannot be set by the client.`;

      throw new AppError('VALIDATION_ERROR', message, 400, { [field]: message });
    }
  }
}

/**
 * @param {string|null|undefined} serialNumber
 * @param {number|null} [excludeAssetId]
 */
async function assertSerialNumberUnique(serialNumber, excludeAssetId = null) {
  if (!serialNumber) {
    return;
  }

  const existing = await repository.findBySerialNumber(serialNumber);
  if (existing && existing.id !== excludeAssetId) {
    throw new AppError(
      'VALIDATION_ERROR',
      'An asset with this serial number already exists.',
      409,
      { serial_number: 'An asset with this serial number already exists.' }
    );
  }
}

/**
 * @returns {Promise<object[]>}
 */
async function getAllAssets() {
  const assets = await repository.findAll();
  return assets.map(sanitizeAsset);
}

/**
 * @param {number} id
 * @returns {Promise<object>}
 */
async function getAssetById(id) {
  const asset = await repository.findById(id);
  if (!asset) {
    throw new AppError('NOT_FOUND', 'Asset not found.', 404);
  }
  return sanitizeAsset(asset);
}

/**
 * Registers a new asset. `asset_tag` and `qr_code_value` are always
 * generated server-side via tagGenerator.js; status defaults to
 * 'Available' per schema.sql.
 * @param {object} assetData
 * @returns {Promise<object>}
 */
async function createAsset(assetData) {
  rejectClientControlledFields(assetData, 'create');

  const {
    name,
    category_id,
    serial_number = null,
    acquisition_date = null,
    acquisition_cost = null,
    condition = 'New',
    location = null,
    photo_url = null,
    is_bookable = false,
  } = assetData;

  await assertSerialNumberUnique(serial_number);

  const assetTag = await tagGenerator.generateAssetTag();
  const qrCodeValue = tagGenerator.generateQrCodeValue(assetTag);

  let assetId;
  try {
    assetId = await repository.createAsset({
      asset_tag: assetTag,
      name,
      category_id,
      serial_number,
      qr_code_value: qrCodeValue,
      acquisition_date,
      acquisition_cost,
      condition,
      location,
      photo_url,
      is_bookable,
      status: 'Available',
    });
  } catch (err) {
    handleRepositoryError(err);
  }

  return getAssetById(assetId);
}

/**
 * Partially updates an asset. Status transition rules are enforced once
 * the SDD transition matrix is available in the workspace.
 * @param {number} id
 * @param {object} assetData
 * @returns {Promise<object>}
 */
async function updateAsset(id, assetData) {
  const existing = await repository.findById(id);
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Asset not found.', 404);
  }

  rejectClientControlledFields(assetData, 'update');

  if (Object.prototype.hasOwnProperty.call(assetData, 'serial_number')) {
    await assertSerialNumberUnique(assetData.serial_number, id);
  }

  try {
    await repository.updateAsset(id, assetData);
  } catch (err) {
    handleRepositoryError(err);
  }

  return getAssetById(id);
}

/**
 * @param {number} id
 */
async function deleteAsset(id) {
  const existing = await repository.findById(id);
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Asset not found.', 404);
  }

  try {
    await repository.deleteAsset(id);
  } catch (err) {
    handleRepositoryError(err);
  }
}

/**
 * @param {object} filters
 * @returns {Promise<object[]>}
 */
async function searchAssets(filters) {
  const assets = await repository.searchAssets(filters);
  return assets.map(sanitizeAsset);
}

/**
 * Returns the activity-log history for an asset. Requires the
 * activityLogs repository (Developer 3) — not yet available in this
 * workspace, so only the existence check can run here today.
 * @param {number} assetId
 * @returns {Promise<object[]>}
 */
async function getAssetHistory(assetId) {
  const asset = await repository.findById(assetId);
  if (!asset) {
    throw new AppError('NOT_FOUND', 'Asset not found.', 404);
  }

  throw new AppError(
    'VALIDATION_ERROR',
    'Asset history requires the activityLogs repository, which is not yet available.',
    400
  );
}

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  searchAssets,
  getAssetHistory,
};
