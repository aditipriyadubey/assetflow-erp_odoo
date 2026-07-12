/**
 * server/src/modules/dashboard/validators.js
 *
 * express-validator chains only — no business logic. Dashboard
 * endpoints are read-only GET routes with no request body or path
 * params per SDD §14.12.
 */

const kpisValidators = [];

const overdueValidators = [];

module.exports = {
  kpisValidators,
  overdueValidators,
};
