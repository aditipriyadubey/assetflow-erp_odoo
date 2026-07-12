// Validates and sanitizes incoming audit request data before it reaches the controller.

const { param, query, body } = require('express-validator');

const CYCLE_STATUSES = ['Draft', 'InProgress', 'Closed'];
const ITEM_VERIFICATION_STATUSES = ['Pending', 'Verified', 'Missing', 'Damaged'];

const idParam = [
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
];

const listAuditCycles = [
  query('status').optional().isIn(CYCLE_STATUSES).withMessage('Invalid status filter'),
  query('department_id').optional().isInt({ gt: 0 }).withMessage('department_id must be a positive integer'),
];

const createAuditCycle = [
  body('name').isString().trim().isLength({ min: 1, max: 150 }).withMessage('name is required and must be at most 150 characters'),
  body('departmentId').optional().isInt({ gt: 0 }).withMessage('departmentId must be a positive integer'),
  body('location').optional().isString().trim().isLength({ max: 150 }).withMessage('location must be at most 150 characters'),
  body('startDate').isISO8601().withMessage('startDate is required and must be a valid date'),
  body('endDate').isISO8601().withMessage('endDate is required and must be a valid date'),
  body('createdBy').isInt({ gt: 0 }).withMessage('createdBy is required and must be a positive integer'),
];

const assignAuditors = [
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  body('auditorIds')
    .isArray({ min: 1 })
    .withMessage('auditorIds is required and must be a non-empty array'),
  body('auditorIds.*').isInt({ gt: 0 }).withMessage('each auditorId must be a positive integer'),
];

const listAuditItems = [
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  query('verification_status')
    .optional()
    .isIn(ITEM_VERIFICATION_STATUSES)
    .withMessage('Invalid verification_status filter'),
];

const updateItemVerification = [
  param('itemId').isInt({ gt: 0 }).withMessage('itemId must be a positive integer'),
  body('verificationStatus')
    .isIn(ITEM_VERIFICATION_STATUSES)
    .withMessage('Invalid verificationStatus'),
  body('notes').optional().isString().isLength({ max: 500 }).withMessage('notes must be at most 500 characters'),
  body('verifiedBy').optional().isInt({ gt: 0 }).withMessage('verifiedBy must be a positive integer'),
];

module.exports = {
  idParam,
  listAuditCycles,
  createAuditCycle,
  assignAuditors,
  listAuditItems,
  updateItemVerification,
};