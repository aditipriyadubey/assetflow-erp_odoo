/**
 * server/src/utils/responseEnvelope.js
 * Owner: Developer 3
 *
 * The single place that shapes every HTTP response body in the
 * backend (SDD Shared Contracts §A.1 — "No endpoint may deviate from
 * this shape. Frontend api/*.js files assume it unconditionally.").
 *
 * Success:
 *   { success: true, message, data, meta }
 * Error:
 *   { success: false, error: { code, message, details } }
 *
 * `message` and `meta` are omitted from the success body when not
 * provided, rather than sent as null/undefined, so the frontend can
 * rely on simple truthy checks (`if (response.meta) ...`).
 */

/**
 * Sends a success envelope with an explicit status code. Every other
 * success helper below is a thin convenience wrapper around this one.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {*} data
 * @param {string} [message]
 * @param {{page:number, limit:number, total:number}} [meta]
 */
function sendSuccess(res, statusCode, data, message, meta) {
  const body = { success: true, data };

  if (message !== undefined) {
    body.message = message;
  }
  if (meta !== undefined) {
    body.meta = meta;
  }

  return res.status(statusCode).json(body);
}

/**
 * Convenience wrapper for the common "201 Created" case (SDD §14 —
 * every POST that creates a resource responds 201).
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} [message]
 */
function sendCreated(res, data, message) {
  return sendSuccess(res, 201, data, message);
}

/**
 * Sends the standard error envelope (SDD Shared Contracts §A.1/§A.2).
 * Used directly by validate.js for request-validation failures, and by
 * the central error-handling middleware (owned separately) for every
 * AppError/unexpected error thrown further down the stack.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} code - one of the Shared Contracts §A.2 error codes
 * @param {string} message - human-readable message
 * @param {object|Array|null} [details] - field-level errors or extra
 *   context; omitted from the body entirely when not provided
 */
function sendError(res, statusCode, code, message, details) {
  const error = { code, message };

  if (details !== undefined && details !== null) {
    error.details = details;
  }

  return res.status(statusCode).json({ success: false, error });
}

module.exports = {
  sendSuccess,
  sendCreated,
  sendError,
};