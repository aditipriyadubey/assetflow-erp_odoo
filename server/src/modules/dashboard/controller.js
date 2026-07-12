/**
 * server/src/modules/dashboard/controller.js
 *
 * Thin HTTP layer only. Delegates to the service layer.
 */

const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/responseEnvelope');
const service = require('./service');

const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await service.getDashboardSummary();
  return sendSuccess(res, 200, summary);
});

module.exports = {
  getDashboardSummary,
};
