/**
 * server/src/middlewares/auth.js
 * Owner: Developer 3
 *
 * Verifies the JWT access token on every protected route and attaches
 * the decoded payload to `req.user`. This is the authoritative
 * authentication check (SDD §14: all routes except
 * /auth/signup, /auth/login, /auth/forgot-password, /auth/reset-password
 * require `Authorization: Bearer <JWT>`).
 *
 * RBAC (role checking) is a separate, composable middleware
 * (see rbac.js) so a route can require "must be logged in" and,
 * independently, "must be one of these roles".
 *
 * Failures are thrown as AppError and passed to next(err) so the
 * central error-handling middleware formats the standard error
 * envelope — this file never writes to `res` directly.
 */

const jwt = require('jsonwebtoken');
const { JWT_ACCESS_SECRET } = require('../config/env');
const AppError = require('../utils/AppError');

/**
 * Extracts a Bearer token from the Authorization header.
 * @param {import('express').Request} req
 * @returns {string|null}
 */
function extractToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token || null;
}

/**
 * Express middleware: requires a valid, non-expired access token.
 * On success, sets req.user = { id, role, department_id, email, name }.
 */
function authenticate(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return next(new AppError('UNAUTHENTICATED', 'Authentication token is required.', 401));
  }

  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET);
    req.user = {
      id: payload.sub,
      role: payload.role,
      department_id: payload.department_id ?? null,
      email: payload.email,
      name: payload.name,
    };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(
        new AppError('TOKEN_EXPIRED', 'Your session has expired. Please log in again.', 401)
      );
    }
    return next(new AppError('UNAUTHENTICATED', 'Invalid or malformed authentication token.', 401));
  }
}

module.exports = { authenticate, extractToken };