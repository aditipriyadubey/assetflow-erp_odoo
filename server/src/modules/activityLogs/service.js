/**
 * server/src/modules/activityLogs/service.js
 * Owner: Developer 3
 *
 * Pure business logic for the append-only activity log (SDD §8
 * layering, FR-9.2). Never touches req/res.
 *
 * `recordActivity` is the intended cross-module entry point: once
 * assets/allocations/bookings/maintenance/audits/transfers land,
 * their service layers call this function (never
 * activityLogs/repository.js directly, per Shared Contracts §A.5) to
 * log the state-changing action inside the same transaction.
 */

const repository = require('./repository');

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
 * GET /activity-logs (Admin only — enforced at the route level).
 * @param {{entity_type?:string, entity_id?:string, user_id?:string, page?:string, limit?:string}} query
 */
async function listActivityLogs(query = {}) {
  const { page, limit } = clampPagination(Number(query.page), Number(query.limit));

  const { rows, total } = await repository.findAll({
    entity_type: query.entity_type,
    entity_id: query.entity_id !== undefined ? Number(query.entity_id) : undefined,
    user_id: query.user_id !== undefined ? Number(query.user_id) : undefined,
    page,
    limit,
  });

  return { logs: rows, meta: { page, limit, total } };
}

/**
 * Cross-module activity recorder (SDD FR-9.2 / §28). Intentionally
 * has no HTTP route — the log is append-only and populated only as a
 * side effect of other modules' business transactions.
 * @param {{user_id:number, action:string, entity_type:string, entity_id:number, details?:object}} input
 * @returns {Promise<number>} newly inserted log id
 */
async function recordActivity({ user_id, action, entity_type, entity_id, details }) {
  return repository.create({ user_id, action, entity_type, entity_id, details });
}

module.exports = {
  listActivityLogs,
  recordActivity,
};