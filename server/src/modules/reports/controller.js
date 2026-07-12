/**
 * server/src/modules/reports/controller.js
 *
 * Thin HTTP layer only: parses the request, delegates to service.js,
 * and shapes the success response envelope (SDD Shared Contracts §A.1).
 * No business logic and no try/catch here — asyncHandler forwards any
 * thrown AppError to the central error-handling middleware (SDD §28).
 */

const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/responseEnvelope');
const service = require('./service');

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
};
