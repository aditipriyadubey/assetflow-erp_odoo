/**
 * server/src/modules/allocations/service.js
 * Owner: Developer 2
 *
 * Pure business logic for asset allocations (SDD §8 layering). Never
 * touches req/res. Every failure path throws a typed AppError.
 */

let repository;

try {
  repository = require('./repository');
} catch (err) {
  repository = null;
}

const AppError = require('../../utils/AppError');

/**
 * @param {object|null} allocation
 * @returns {object|null}
 */
function sanitizeAllocation(allocation) {
  if (!allocation) return null;

  return {
    id: allocation.id,
    asset_id: allocation.asset_id,
    employee_id: allocation.employee_id,
    department_id: allocation.department_id,
    allocated_date: allocation.allocated_date,
    expected_return_date: allocation.expected_return_date,
    actual_return_date: allocation.actual_return_date,
    condition_checkin_notes: allocation.condition_checkin_notes,
    status: allocation.status,
    allocated_by: allocation.allocated_by,
    created_at: allocation.created_at,
    updated_at: allocation.updated_at,
  };
}

/**
 * @returns {any}
 */
function getRepository() {
  if (!repository) {
    throw new AppError('NOT_IMPLEMENTED', 'Allocations repository is not available yet.', 500);
  }

  return repository;
}

/**
 * Maps repository / MySQL constraint failures to typed AppErrors.
 * @param {Error & {code?: string, message?: string}} err
 */
function handleRepositoryError(err) {
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    throw new AppError('NOT_FOUND', 'Referenced record not found.', 404);
  }

  if (err.code === 'ER_DUP_ENTRY') {
    throw new AppError(
      'VALIDATION_ERROR',
      'An active allocation already exists for this asset.',
      409,
      { asset_id: 'An active allocation already exists for this asset.' }
    );
  }

  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    throw new AppError(
      'VALIDATION_ERROR',
      'This allocation cannot be deleted because it is referenced by other records.',
      409
    );
  }

  throw err;
}

/**
 * Defense-in-depth: validators.js should reject these keys, but the
 * service layer never trusts raw client input.
 * @param {object} allocationData
 * @param {'create'|'update'} mode
 */
function rejectClientControlledFields(allocationData, mode) {
  const forbidden = ['id', 'created_at', 'updated_at'];

  if (mode === 'create') {
    forbidden.push('status');
  }

  for (const field of forbidden) {
    if (Object.prototype.hasOwnProperty.call(allocationData, field)) {
      const message =
        field === 'status' && mode === 'create'
          ? 'Status cannot be set when creating an allocation.'
          : `${field} cannot be set by the client.`;

      throw new AppError('VALIDATION_ERROR', message, 400, { [field]: message });
    }
  }
}

/**
 * Enforces the schema-backed rule that there can be at most one active
 * allocation per asset.
 * @param {number} assetId
 * @param {number|null} [excludeAllocationId]
 */
async function assertNoActiveAllocationForAsset(assetId, excludeAllocationId = null) {
  if (!assetId) {
    return;
  }

  const repo = getRepository();
  if (typeof repo.findActiveByAssetId !== 'function') {
    throw new AppError('NOT_IMPLEMENTED', 'Allocations repository is missing active-allocation lookup.', 500);
  }

  const existing = await repo.findActiveByAssetId(assetId);
  if (existing && existing.id !== excludeAllocationId) {
    throw new AppError(
      'VALIDATION_ERROR',
      'An active allocation already exists for this asset.',
      409,
      { asset_id: 'An active allocation already exists for this asset.' }
    );
  }
}

/**
 * @returns {Promise<object[]>}
 */
async function getAllAllocations() {
  const repo = getRepository();
  const allocations = await repo.findAll();
  return allocations.map(sanitizeAllocation);
}

/**
 * @param {number} id
 * @returns {Promise<object>}
 */
async function getAllocationById(id) {
  const repo = getRepository();
  const allocation = await repo.findById(id);

  if (!allocation) {
    throw new AppError('NOT_FOUND', 'Allocation not found.', 404);
  }

  return sanitizeAllocation(allocation);
}

/**
 * Creates a new allocation.
 * @param {object} allocationData
 * @returns {Promise<object>}
 */
async function createAllocation(allocationData) {
  rejectClientControlledFields(allocationData, 'create');

  const {
    asset_id,
    employee_id = null,
    department_id = null,
    allocated_date,
    expected_return_date = null,
    actual_return_date = null,
    condition_checkin_notes = null,
    allocated_by,
  } = allocationData;

  await assertNoActiveAllocationForAsset(asset_id);

  const repo = getRepository();
  if (typeof repo.createAllocation !== 'function') {
    throw new AppError('NOT_IMPLEMENTED', 'Allocations repository is missing allocation creation.', 500);
  }

  let allocationId;
  try {
    allocationId = await repo.createAllocation({
      asset_id,
      employee_id,
      department_id,
      allocated_date,
      expected_return_date,
      actual_return_date,
      condition_checkin_notes,
      status: 'Active',
      allocated_by,
    });
  } catch (err) {
    handleRepositoryError(err);
  }

  return getAllocationById(allocationId);
}

/**
 * Partially updates an allocation.
 * @param {number} id
 * @param {object} allocationData
 * @returns {Promise<object>}
 */
async function updateAllocation(id, allocationData) {
  const existing = await getAllocationById(id);
  rejectClientControlledFields(allocationData, 'update');

  const repo = getRepository();
  if (typeof repo.updateAllocation !== 'function') {
    throw new AppError('NOT_IMPLEMENTED', 'Allocations repository is missing allocation updates.', 500);
  }

  const targetAssetId = Object.prototype.hasOwnProperty.call(allocationData, 'asset_id')
    ? allocationData.asset_id
    : existing.asset_id;
  const targetStatus = Object.prototype.hasOwnProperty.call(allocationData, 'status')
    ? allocationData.status
    : existing.status;

  if (targetStatus === 'Active') {
    await assertNoActiveAllocationForAsset(targetAssetId, id);
  }

  try {
    await repo.updateAllocation(id, allocationData);
  } catch (err) {
    handleRepositoryError(err);
  }

  return getAllocationById(id);
}

/**
 * @param {number} id
 */
async function deleteAllocation(id) {
  const existing = await getAllocationById(id);
  const repo = getRepository();

  if (typeof repo.deleteAllocation !== 'function') {
    throw new AppError('NOT_IMPLEMENTED', 'Allocations repository is missing allocation deletion.', 500);
  }

  try {
    await repo.deleteAllocation(id);
  } catch (err) {
    handleRepositoryError(err);
  }
}

/**
 * @param {object} filters
 * @returns {Promise<object[]>}
 */
async function searchAllocations(filters = {}) {
  const repo = getRepository();
  const allocations = typeof repo.searchAllocations === 'function'
    ? await repo.searchAllocations(filters)
    : await repo.findAll();

  return allocations
    .filter((allocation) => {
      if (Object.prototype.hasOwnProperty.call(filters, 'asset_id') && allocation.asset_id !== filters.asset_id) {
        return false;
      }
      if (Object.prototype.hasOwnProperty.call(filters, 'employee_id') && allocation.employee_id !== filters.employee_id) {
        return false;
      }
      if (Object.prototype.hasOwnProperty.call(filters, 'department_id') && allocation.department_id !== filters.department_id) {
        return false;
      }
      if (Object.prototype.hasOwnProperty.call(filters, 'status') && allocation.status !== filters.status) {
        return false;
      }
      return true;
    })
    .map(sanitizeAllocation);
}

module.exports = {
  getAllAllocations,
  getAllocationById,
  createAllocation,
  updateAllocation,
  deleteAllocation,
  searchAllocations,
};
