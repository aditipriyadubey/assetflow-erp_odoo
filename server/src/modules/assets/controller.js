/**
 * server/src/modules/assets/controller.js
 * Owner: Developer 2
 *
 * Thin HTTP layer only: parses the request, delegates to service.js,
 * and shapes the success response envelope (SDD Shared Contracts §A.1).
 * No business logic and no try/catch here — asyncHandler forwards any
 * thrown AppError to the central error-handling middleware (SDD §28).
 */

const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/responseEnvelope');
const service = require('./service');

/** GET /assets */
const getAllAssets = asyncHandler(async (req, res) => {
  const assets = await service.getAllAssets();
  return sendSuccess(res, 200, assets);
});

/** GET /assets/:id */
const getAssetById = asyncHandler(async (req, res) => {
  const asset = await service.getAssetById(Number(req.params.id));
  return sendSuccess(res, 200, asset);
});

/** POST /assets */
const createAsset = asyncHandler(async (req, res) => {
  const asset = await service.createAsset(req.body);
  return sendSuccess(res, 201, asset);
});

/** PATCH /assets/:id */
const updateAsset = asyncHandler(async (req, res) => {
  const asset = await service.updateAsset(Number(req.params.id), req.body);
  return sendSuccess(res, 200, asset);
});

/** DELETE /assets/:id */
const deleteAsset = asyncHandler(async (req, res) => {
  await service.deleteAsset(Number(req.params.id));
  return sendSuccess(res, 200, {});
});

/** GET /assets/search */
const searchAssets = asyncHandler(async (req, res) => {
  const assets = await service.searchAssets(req.query);
  return sendSuccess(res, 200, assets);
});

/** GET /assets/:id/history */
const getAssetHistory = asyncHandler(async (req, res) => {
  const history = await service.getAssetHistory(Number(req.params.id));
  return sendSuccess(res, 200, history);
});

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  searchAssets,
  getAssetHistory,
};
