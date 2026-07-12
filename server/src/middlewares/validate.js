/**
 * server/src/middlewares/validate.js
 * Owner: Developer 3
 *
 * Runs after a module's express-validator chain(s) (SDD §26/§28:
 * "every write endpoint validates with express-validator in a
 * dedicated validators.js per module; controllers never trust raw
 * req.body"). Every routes.js in every module places this middleware
 * immediately after its *Validators array and before the controller.
 *
 * On failure, responds directly with the standard error envelope
 * (SDD Shared Contracts §A.1) — it does not call next(), since there
 * is nothing further for the central error handler to add here.
 */

const { validationResult } = require('express-validator');
const { sendError } = require('../utils/responseEnvelope');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function validate(req, res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const details = result.array({ onlyFirstError: true }).map((err) => ({
    field: err.type === 'field' ? err.path : err.type,
    message: err.msg,
  }));

  return sendError(res, 400, 'VALIDATION_ERROR', 'Validation failed', details);
}

module.exports = { validate };