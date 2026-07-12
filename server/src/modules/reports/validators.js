/**
 * server/src/modules/reports/validators.js
 *
 * express-validator rules only.
 */

const { query } = require('express-validator');

const reportQueryValidators = [
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
  reportQueryValidators,
};
