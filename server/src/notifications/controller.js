/**
 * server/src/modules/notifications/controller.js
 * Owner: Developer 3
 *
 * Thin HTTP layer only: parses the request, delegates to service.js,
 * and shapes the success response envelope (SDD Shared Contracts §A.1).
 * No business logic and no try/catch here — asyncHandler forwards any
 * thrown AppError to the central error-handling middleware (SDD §28).
 */

const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/responseEnvelope');
const service = require('./service');

/** GET /notifications */
const listNotifications = asyncHandler(async (req, res) => {
  const { notifications, meta } = await service.listNotifications(req.user.id, req.query);
  return sendSuccess(res, 200, notifications, undefined, meta);
});

/** PATCH /notifications/:id/read */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await service.markAsRead(Number(req.params.id), req.user.id);
  return sendSuccess(res, 200, notification, 'Notification marked as read.');
});

module.exports = {
  listNotifications,
  markAsRead,
};