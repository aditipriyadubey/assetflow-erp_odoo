/**
 * server/src/modules/dashboard/controller.js
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
const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await service.getDashboardSummary();
  return sendSuccess(res, 200, summary);
});

module.exports = {
  getDashboardSummary,
=======
/** GET /dashboard/kpis */
const getKpis = asyncHandler(async (req, res) => {
  const kpis = await service.getKpis(req.user);
  return sendSuccess(res, 200, kpis);
});

/** GET /dashboard/overdue */
const getOverdueReturns = asyncHandler(async (req, res) => {
  const overdueReturns = await service.getOverdueReturns(req.user);
  return sendSuccess(res, 200, overdueReturns);
});

module.exports = {
  getKpis,
  getOverdueReturns,
>>>>>>> develop
};
