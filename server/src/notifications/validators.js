/**
 * server/src/modules/notifications/validators.js
 * Owner: Developer 3
 *
 * express-validator chains only — no business logic. Controllers
 * never trust raw req.query/req.params directly (SDD §28).
 */

const { param, query } = require('express-validator');

const idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('A valid notification id is required.'),
];

const listNotificationsValidators = [
  query('is_read').optional().isIn(['true', 'false']).withMessage('is_read must be true or false.'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100.'),
];

module.exports = {
  idParamValidator,
  listNotificationsValidators,
};