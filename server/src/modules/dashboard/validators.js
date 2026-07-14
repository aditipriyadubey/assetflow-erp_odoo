/**
 * server/src/modules/dashboard/validators.js
 *
<<<<<<< HEAD
 * express-validator rules only.
 */

const { query } = require('express-validator');

const dashboardOverviewValidators = [
  query('from')
    .optional({ nullable: true })
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('The from date must be a valid ISO 8601 date.'),
  query('to')
    .optional({ nullable: true })
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('The to date must be a valid ISO 8601 date.'),
];

module.exports = {
  dashboardOverviewValidators,
=======
 * express-validator chains only — no business logic. Dashboard
 * endpoints are read-only GET routes with no request body or path
 * params per SDD §14.12.
 */

const kpisValidators = [];

const overdueValidators = [];

module.exports = {
  kpisValidators,
  overdueValidators,
>>>>>>> develop
};
