// Handles incoming HTTP requests for maintenance requests and coordinates responses via the service layer.

const { validationResult } = require('express-validator');
const asyncHandler = require('../../utils/asyncHandler');
const sendSuccess = require('../../utils/sendSuccess');
const AppError = require('../../utils/AppError');
const service = require('./service');

function assertValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, errors.array());
  }
}

const getAllMaintenanceRequests = asyncHandler(async (req, res) => {
  assertValid(req);

  const { status, priority, asset_id: assetId } = req.query;
  const requests = await service.getAllMaintenanceRequests({ status, priority, assetId });

  return sendSuccess(res, 200, 'Maintenance requests retrieved successfully', requests);
});

const getMaintenanceRequestById = asyncHandler(async (req, res) => {
  assertValid(req);

  const request = await service.getMaintenanceRequestById(req.params.id);

  return sendSuccess(res, 200, 'Maintenance request retrieved successfully', request);
});

const createMaintenanceRequest = asyncHandler(async (req, res) => {
  assertValid(req);

  const request = await service.createMaintenanceRequest(req.body);

  return sendSuccess(res, 201, 'Maintenance request created successfully', request);
});

const updateMaintenanceStatus = asyncHandler(async (req, res) => {
  assertValid(req);

  const request = await service.updateMaintenanceStatus(req.params.id, req.body);

  return sendSuccess(res, 200, 'Maintenance request status updated successfully', request);
});

const closeMaintenanceRequest = asyncHandler(async (req, res) => {
  assertValid(req);

  const request = await service.closeMaintenanceRequest(req.params.id);

  return sendSuccess(res, 200, 'Maintenance request closed successfully', request);
});

module.exports = {
  getAllMaintenanceRequests,
  getMaintenanceRequestById,
  createMaintenanceRequest,
  updateMaintenanceStatus,
  closeMaintenanceRequest,
};