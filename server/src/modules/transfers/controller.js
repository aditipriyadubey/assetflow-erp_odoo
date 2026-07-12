/**
 * server/src/modules/transfers/controller.js
 * Owner: Developer 2
 *
 * Thin HTTP layer only: parses the request, delegates to service.js,
 * and shapes the success response envelope.
 */

const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/responseEnvelope');
const service = require('./service');

/** GET /transfers */
const getAllTransfers = asyncHandler(async (req, res) => {
  const transfers = await service.getAllTransfers();
  return sendSuccess(res, 200, transfers);
});

/** GET /transfers/:id */
const getTransferById = asyncHandler(async (req, res) => {
  const transfer = await service.getTransferById(Number(req.params.id));
  return sendSuccess(res, 200, transfer);
});

/** POST /transfers */
const createTransfer = asyncHandler(async (req, res) => {
  const transfer = await service.createTransfer({
    asset_id: req.body.asset_id,
    from_user_id: req.body.from_user_id ?? null,
    to_user_id: req.body.to_user_id,
    requested_by: req.user.id,
  });
  return sendSuccess(res, 201, transfer);
});

/** PATCH /transfers/:id/approve */
const approveTransfer = asyncHandler(async (req, res) => {
  const transfer = await service.approveTransfer(Number(req.params.id), req.user.id);
  return sendSuccess(res, 200, transfer);
});

/** PATCH /transfers/:id/reject */
const rejectTransfer = asyncHandler(async (req, res) => {
  const transfer = await service.rejectTransfer(Number(req.params.id), req.user.id);
  return sendSuccess(res, 200, transfer);
});

module.exports = {
  getAllTransfers,
  getTransferById,
  createTransfer,
  approveTransfer,
  rejectTransfer,
};
