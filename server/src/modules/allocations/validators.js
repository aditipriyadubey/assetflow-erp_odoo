/**
 * server/src/modules/allocations/validators.js
 * Owner: Developer 2
 *
 * express-validator chains only — no business logic.
 */

const { body, param } = require('express-validator');

const ALLOCATION_STATUSES = ['Active', 'Returned', 'Overdue'];

const createAllocationValidators = [
  body('id').not().exists().withMessage('Allocation ID cannot be set by the client.'),
  body('asset_id')
    .notEmpty()
    .withMessage('Asset is required.')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Asset ID must be a positive integer.'),
  body('employee_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Employee ID must be a positive integer.'),
  body('department_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer.'),
  body('allocated_date')
    .notEmpty()
    .withMessage('Allocation date is required.')
    .bail()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('Allocation date must be a valid date (YYYY-MM-DD).'),
  body('expected_return_date')
    .optional({ nullable: true })
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('Expected return date must be a valid date (YYYY-MM-DD).'),
  body('actual_return_date')
    .optional({ nullable: true })
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('Actual return date must be a valid date (YYYY-MM-DD).'),
  body('condition_checkin_notes')
    .optional({ nullable: true })
    .isLength({ max: 500 })
    .withMessage('Condition check-in notes must be at most 500 characters.'),
  body('allocated_by')
    .notEmpty()
    .withMessage('Allocated by is required.')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Allocated by must be a positive integer.'),
  body('status').not().exists().withMessage('Status cannot be set when creating an allocation.'),
  body('created_at').not().exists().withMessage('Created at cannot be set by the client.'),
  body('updated_at').not().exists().withMessage('Updated at cannot be set by the client.'),
];

const updateAllocationValidators = [
  body('id').not().exists().withMessage('Allocation ID cannot be set by the client.'),
  body('asset_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Asset ID must be a positive integer.'),
  body('employee_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Employee ID must be a positive integer.'),
  body('department_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer.'),
  body('allocated_date')
    .optional()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('Allocation date must be a valid date (YYYY-MM-DD).'),
  body('expected_return_date')
    .optional({ nullable: true })
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('Expected return date must be a valid date (YYYY-MM-DD).'),
  body('actual_return_date')
    .optional({ nullable: true })
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('Actual return date must be a valid date (YYYY-MM-DD).'),
  body('condition_checkin_notes')
    .optional({ nullable: true })
    .isLength({ max: 500 })
    .withMessage('Condition check-in notes must be at most 500 characters.'),
  body('allocated_by')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Allocated by must be a positive integer.'),
  body('status')
    .optional()
    .isIn(ALLOCATION_STATUSES)
    .withMessage('Status must be one of: Active, Returned, Overdue.'),
  body('created_at').not().exists().withMessage('Created at cannot be set by the client.'),
  body('updated_at').not().exists().withMessage('Updated at cannot be set by the client.'),
];

const allocationIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Allocation ID must be a positive integer.'),
];

module.exports = {
  createAllocationValidators,
  updateAllocationValidators,
  allocationIdValidator,
};
