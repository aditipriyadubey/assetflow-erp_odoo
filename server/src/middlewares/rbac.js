/**
 * server/src/middlewares/rbac.js
 * Owner: Developer 3
 *
 * Server-side RBAC enforcement (SDD §31: "RBAC enforced server-side
 * on every route — the frontend hiding a button is a UX nicety, not a
 * security boundary"). Must run after `authenticate` (auth.js) has
 * populated req.user.
 *
 * Roles are exactly the Shared Contracts ROLES enum:
 * ['Admin','AssetManager','DepartmentHead','Employee'].
 */

const AppError = require('../utils/AppError');

/**
 * Requires the authenticated user's role to be one of `allowedRoles`.
 * @param {...string} allowedRoles
 * @returns {import('express').RequestHandler}
 */
function requireRole(...allowedRoles) {
  return function rbacMiddleware(req, res, next) {
    if (!req.user) {
      return next(
        new AppError('UNAUTHENTICATED', 'Authentication is required before role checks can run.', 401)
      );
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError('FORBIDDEN_ROLE', 'You do not have permission to perform this action.', 403)
      );
    }
    return next();
  };
}

/**
 * Requires either that the authenticated user IS the resource owner
 * (req.params[paramName] === req.user.id) OR has one of allowedRoles.
 * Used for endpoints like "GET /users/:id | Admin, or self" (SDD §14.2).
 * @param {string} paramName - route param holding the target user id
 * @param {...string} allowedRoles
 * @returns {import('express').RequestHandler}
 */
function allowSelfOrRoles(paramName, ...allowedRoles) {
  return function selfOrRoleMiddleware(req, res, next) {
    if (!req.user) {
      return next(
        new AppError('UNAUTHENTICATED', 'Authentication is required before role checks can run.', 401)
      );
    }
    const targetId = Number(req.params[paramName]);
    const isSelf = Number.isFinite(targetId) && targetId === req.user.id;
    const hasRole = allowedRoles.includes(req.user.role);

    if (isSelf || hasRole) {
      return next();
    }
    return next(
      new AppError('FORBIDDEN_ROLE', 'You do not have permission to perform this action.', 403)
    );
  };
}

module.exports = { requireRole, allowSelfOrRoles };