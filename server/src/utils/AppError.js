/**
 * server/src/utils/AppError.js
 * Owner: Developer 3
 *
 * Standard typed error class used by every service.js function that
 * needs to signal a business-rule/validation/auth failure (SDD §28:
 * "service.js functions ... throw typed errors (AppError(code,
 * message, status))"). Never thrown from controllers or repositories
 * — only from the service layer.
 *
 * asyncHandler.js forwards any thrown error to Express via next(err);
 * the central error-handling middleware (owned separately) reads
 * .errorCode / .statusCode / .details off an AppError instance and
 * renders it through responseEnvelope.js's sendError(), matching the
 * shared error envelope (SDD Shared Contracts §A.1) and the error
 * codes in §A.2.
 */

class AppError extends Error {
  /**
   * @param {string} errorCode - one of the Shared Contracts §A.2 error
   *   codes (e.g. 'VALIDATION_ERROR', 'NOT_FOUND', 'FORBIDDEN_ROLE').
   *   Extend that table rather than inventing ad-hoc strings elsewhere.
   * @param {string} message - human-readable message safe to show
   *   directly to the end user (SDD §31/§26 — never leaks internals).
   * @param {number} [statusCode=500] - HTTP status code to respond with.
   * @param {object|Array|null} [details=null] - optional extra context,
   *   e.g. field-level validation messages (SDD §A.7) or a
   *   pre-formatted list of validation issues (see validate.js).
   */
  constructor(errorCode, message, statusCode = 500, details = null) {
    super(message);

    this.name = 'AppError';
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.details = details;

    // Marks this as a known, expected failure (bad input, a business
    // rule conflict, an auth failure) rather than a programming bug —
    // the central error handler can use this to decide whether to log
    // a full stack trace / alert, versus just render the envelope.
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;