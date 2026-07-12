/**
 * server/src/modules/notifications/service.js
 * Owner: Developer 3
 *
 * Pure business logic for Notifications (SDD §8 layering, FR-9.1,
 * §23 Notification Workflow). Never touches req/res. Every failure
 * path throws a typed AppError (SDD §28); the central error-handling
 * middleware converts that into the standard error envelope (SDD
 * Shared Contracts §A.1/A.2).
 *
 * `emitNotification` is the intended cross-module entry point: once
 * bookings/maintenance/transfers/audits land, their service layers
 * call this function (never notifications/repository.js directly,
 * per Shared Contracts §A.5) to write a notification as part of the
 * same business transaction that triggered it.
 */

const repository = require('./repository');
const AppError = require('../../utils/AppError');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Clamps pagination params into a valid range rather than erroring
 * (SDD §26: "pagination params ... silently clamps to valid range").
 * @param {number} page
 * @param {number} limit
 */
function clampPagination(page, limit) {
  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : DEFAULT_PAGE;
  const rawLimit = Number.isFinite(limit) && limit >= 1 ? Math.floor(limit) : DEFAULT_LIMIT;
  const safeLimit = Math.min(rawLimit, MAX_LIMIT);
  return { page: safePage, limit: safeLimit };
}

/**
 * @param {string|undefined} value
 * @returns {boolean|undefined}
 */
function parseIsRead(value) {
  if (value === undefined) return undefined;
  return value === 'true';
}

/**
 * GET /notifications — always scoped to the authenticated user; there
 * is no "all notifications" view for any role (SDD §14.13).
 * @param {number} userId
 * @param {{is_read?:string, page?:string, limit?:string}} query
 */
async function listNotifications(userId, query = {}) {
  const { page, limit } = clampPagination(Number(query.page), Number(query.limit));

  const { rows, total } = await repository.findAllForUser({
    user_id: userId,
    is_read: parseIsRead(query.is_read),
    page,
    limit,
  });

  return { notifications: rows, meta: { page, limit, total } };
}

/**
 * PATCH /notifications/:id/read — a user may only mark their own
 * notifications read (SDD §14.13).
 * @param {number} id
 * @param {number} userId
 */
async function markAsRead(id, userId) {
  const notification = await repository.findByIdForUser(id, userId);
  if (!notification) {
    throw new AppError('NOT_FOUND', 'Notification not found.', 404);
  }

  await repository.markAsRead(id);
  return repository.findByIdForUser(id, userId);
}

/**
 * Cross-module notification emitter (SDD §23). Intentionally has no
 * HTTP route — it's called from other modules' service layers as part
 * of the same transaction as the triggering state change.
 * @param {{user_id:number, type:string, message:string, related_entity_type?:string, related_entity_id?:number}} input
 * @returns {Promise<number>} newly inserted notification id
 */
async function emitNotification({ user_id, type, message, related_entity_type, related_entity_id }) {
  return repository.create({ user_id, type, message, related_entity_type, related_entity_id });
}

module.exports = {
  listNotifications,
  markAsRead,
  emitNotification,
};