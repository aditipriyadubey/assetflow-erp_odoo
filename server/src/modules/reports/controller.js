/**
 * server/src/modules/reports/controller.js
 *
<<<<<<< HEAD
 * Thin HTTP layer only. Delegates to the service layer.
=======
 * Thin HTTP layer only: parses the request, delegates to service.js,
 * and shapes the success response envelope (SDD Shared Contracts §A.1).
 * No business logic and no try/catch here — asyncHandler forwards any
 * thrown AppError to the central error-handling middleware (SDD §28).
>>>>>>> develop
 */

const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/responseEnvelope');
const service = require('./service');

<<<<<<< HEAD
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
=======
/** GET /reports/utilization */
const getUtilization = asyncHandler(async (req, res) => {
  const report = await service.getUtilization(req.user, req.query);
  return sendSuccess(res, 200, report);
});

/** GET /reports/maintenance-frequency */
const getMaintenanceFrequency = asyncHandler(async (req, res) => {
  const report = await service.getMaintenanceFrequency(req.query);
  return sendSuccess(res, 200, report);
});

/** GET /reports/due-for-maintenance */
const getDueForMaintenance = asyncHandler(async (req, res) => {
  const report = await service.getDueForMaintenance();
  return sendSuccess(res, 200, report);
});

/** GET /reports/department-allocation */
const getDepartmentAllocation = asyncHandler(async (req, res) => {
  const report = await service.getDepartmentAllocation(req.user);
  return sendSuccess(res, 200, report);
});

/** GET /reports/booking-heatmap */
const getBookingHeatmap = asyncHandler(async (req, res) => {
  const report = await service.getBookingHeatmap(req.user, req.query);
  return sendSuccess(res, 200, report);
});

/** GET /reports/export?type=csv */
const exportReport = asyncHandler(async (req, res) => {
  const { csv, filename } = await service.exportReportCsv(req.user);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.status(200).send(csv);
});

module.exports = {
  getUtilization,
  getMaintenanceFrequency,
  getDueForMaintenance,
  getDepartmentAllocation,
  getBookingHeatmap,
  exportReport,
>>>>>>> develop
};
