/**
 * server/src/modules/activityLogs/controller.js
 * Owner: Developer 3
 *
 * Thin HTTP layer only: parses the request, delegates to service.js,
 * and shapes the success response envelope (SDD Shared Contracts §A.1).
 * No business logic and no try/catch here — asyncHandler forwards any
 * thrown AppError to the central error-handling middleware (SDD §28).
 *
 * Read-only by design (SDD §31: activity log is append-only) — no
 * create/update/delete handlers are exposed here.
 */

const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/responseEnvelope');
const service = require('./service');

/** GET /activity-logs */
const listActivityLogs = asyncHandler(async (req, res) => {
  const { logs, meta } = await service.listActivityLogs(req.query);
  return sendSuccess(res, 200, logs, undefined, meta);
});

module.exports = {
  listActivityLogs,
};