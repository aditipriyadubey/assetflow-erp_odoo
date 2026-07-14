/**
 * server/src/middlewares/errorHandler.js
 * Owner: Developer 3
 *
 * MISSING FILE. Both server/src/utils/AppError.js and
 * responseEnvelope.js explicitly document a "central error-handling
 * middleware (owned separately)" that reads `.errorCode` / `.statusCode`
 * / `.details` off a thrown AppError and renders it via sendError() —
 * but that middleware was never actually written anywhere in the ZIP.
 * Without this, every thrown error (including every AppError from
 * every module) falls through to Express's default HTML error page,
 * breaking the response envelope contract for 100% of error paths.
 *
 * Must be registered LAST in app.js, after all routes and the 404
 * handler (SDD §16: "... routes → 404 handler → centralized errorHandler").
 */

const { sendError } = require('../utils/responseEnvelope');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Known, expected failures raised deliberately from a service.js
  // (see AppError.js's `isOperational` flag).
  if (err.isOperational) {
    return sendError(res, err.statusCode || 500, err.errorCode || 'SERVER_ERROR', err.message, err.details);
  }

  // Anything else is an unexpected bug — log the full stack server-side,
  // but never leak internals to the client (SDD §31).
  // eslint-disable-next-line no-console
  console.error('[AssetFlow] Unexpected error:', err);

  return sendError(res, 500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
}

module.exports = errorHandler;
