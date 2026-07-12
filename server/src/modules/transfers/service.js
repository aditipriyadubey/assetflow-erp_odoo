/**
 * server/src/modules/transfers/service.js
 * Owner: Developer 2
 *
 * Pure business logic for transfer requests (SDD §8 layering).
 * Never touches req/res. Every failure path throws a typed AppError.
 */

const repository = require('./repository');
const AppError = require('../../utils/AppError');

/**
 * @param {object|null} transfer
 * @returns {object|null}
 */
function sanitizeTransfer(transfer) {
  if (!transfer) return null;

  return {
    id: transfer.id,
    asset_id: transfer.asset_id,
    from_user_id: transfer.from_user_id,
    to_user_id: transfer.to_user_id,
    requested_by: transfer.requested_by,
    status: transfer.status,
    approved_by: transfer.approved_by,
    requested_at: transfer.requested_at,
    resolved_at: transfer.resolved_at,
  };
}

/**
 * Maps repository / MySQL constraint failures to typed AppErrors.
 * @param {Error & {code?: string, message?: string}} err
 */
function handleRepositoryError(err) {
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    throw new AppError('NOT_FOUND', 'Referenced record not found.', 404);
  }

  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    throw new AppError(
      'VALIDATION_ERROR',
      'This transfer request cannot be deleted because it is referenced by other records.',
      409
    );
  }

  throw err;
}

/**
 * @returns {Promise<object[]>}
 */
async function getAllTransfers() {
  const transfers = await repository.findAll();
  return transfers.map(sanitizeTransfer);
}

/**
 * @param {number} id
 * @returns {Promise<object>}
 */
async function getTransferById(id) {
  const transfer = await repository.findById(id);
  if (!transfer) {
    throw new AppError('NOT_FOUND', 'Transfer request not found.', 404);
  }
  return sanitizeTransfer(transfer);
}

/**
 * Creates a new transfer request.
 * @param {{asset_id:number, from_user_id:number|null, to_user_id:number, requested_by:number}} input
 * @returns {Promise<object>}
 */
async function createTransfer(input) {
  const { asset_id, from_user_id = null, to_user_id, requested_by } = input;

  let transferId;
  try {
    transferId = await repository.createTransfer({
      asset_id,
      from_user_id,
      to_user_id,
      requested_by,
      status: 'Requested',
    });
  } catch (err) {
    handleRepositoryError(err);
  }

  return getTransferById(transferId);
}

/**
 * Approves an existing transfer request.
 * @param {number} id
 * @param {number} approvedBy
 * @returns {Promise<object>}
 */
async function approveTransfer(id, approvedBy) {
  const transfer = await repository.findById(id);
  if (!transfer) {
    throw new AppError('NOT_FOUND', 'Transfer request not found.', 404);
  }

  if (transfer.status !== 'Requested') {
    throw new AppError('VALIDATION_ERROR', 'Only requested transfers can be approved.', 409);
  }

  try {
    await repository.updateTransferStatus(id, {
      status: 'Approved',
      approved_by: approvedBy,
      resolved_at: new Date(),
    });
  } catch (err) {
    handleRepositoryError(err);
  }

  return getTransferById(id);
}

/**
 * Rejects an existing transfer request.
 * @param {number} id
 * @param {number} rejectedBy
 * @returns {Promise<object>}
 */
async function rejectTransfer(id, rejectedBy) {
  const transfer = await repository.findById(id);
  if (!transfer) {
    throw new AppError('NOT_FOUND', 'Transfer request not found.', 404);
  }

  if (transfer.status !== 'Requested') {
    throw new AppError('VALIDATION_ERROR', 'Only requested transfers can be rejected.', 409);
  }

  try {
    await repository.updateTransferStatus(id, {
      status: 'Rejected',
      approved_by: rejectedBy,
      resolved_at: new Date(),
    });
  } catch (err) {
    handleRepositoryError(err);
  }

  return getTransferById(id);
}

module.exports = {
  getAllTransfers,
  getTransferById,
  createTransfer,
  approveTransfer,
  rejectTransfer,
};
