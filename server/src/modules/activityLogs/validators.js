/**
 * server/src/modules/activityLogs/validators.js
 * Owner: Developer 3
 *
 * express-validator chains only — no business logic. Controllers
 * never trust raw req.query directly (SDD §28).
 */

const { query } = require('express-validator');

const listActivityLogsValidators = [
  query('entity_type')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('entity_type must be a valid entity name.'),
  query('entity_id').optional().isInt({ min: 1 }).withMessage('entity_id must be a valid id.'),
  query('user_id').optional().isInt({ min: 1 }).withMessage('user_id must be a valid id.'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100.'),
];

module.exports = {
  listActivityLogsValidators,
};