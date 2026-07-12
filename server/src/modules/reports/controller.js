/**
 * server/src/modules/reports/controller.js
 *
 * Thin HTTP layer only. Delegates to the service layer.
 */

const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/responseEnvelope');
const service = require('./service');

const getInventoryReport = asyncHandler(async (req, res) => {
  const data = await service.getInventoryReport();
  return sendSuccess(res, 200, data);
});

const getAllocationReport = asyncHandler(async (req, res) => {
  const data = await service.getAllocationReport();
  return sendSuccess(res, 200, data);
});

const getTransferReport = asyncHandler(async (req, res) => {
  const data = await service.getTransferReport();
  return sendSuccess(res, 200, data);
});

const getMaintenanceReport = asyncHandler(async (req, res) => {
  const data = await service.getMaintenanceReport();
  return sendSuccess(res, 200, data);
});

const getAuditReport = asyncHandler(async (req, res) => {
  const data = await service.getAuditReport();
  return sendSuccess(res, 200, data);
});

module.exports = {
  getInventoryReport,
  getAllocationReport,
  getTransferReport,
  getMaintenanceReport,
  getAuditReport,
};
