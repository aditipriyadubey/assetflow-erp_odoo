// Validates and sanitizes incoming maintenance request data before it reaches the controller.

const { param, query, body } = require('express-validator');

const VALID_STATUSES = [
  'Pending',
  'Approved',
  'Rejected',
  'TechnicianAssigned',
  'InProgress',
  'Resolved',
];

const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const idParam = [
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
];

const listMaintenanceRequests = [
  query('status').optional().isIn(VALID_STATUSES).withMessage('Invalid status filter'),
  query('priority').optional().isIn(VALID_PRIORITIES).withMessage('Invalid priority filter'),
  query('asset_id').optional().isInt({ gt: 0 }).withMessage('asset_id must be a positive integer'),
];

const createMaintenanceRequest = [
  body('assetId').isInt({ gt: 0 }).withMessage('assetId is required and must be a positive integer'),
  body('raisedBy').isInt({ gt: 0 }).withMessage('raisedBy is required and must be a positive integer'),
  body('issueDescription')
    .isString()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('issueDescription is required and must be at most 1000 characters'),
  body('priority').optional().isIn(VALID_PRIORITIES).withMessage('Invalid priority'),
  body('photoUrl').optional().isString().isLength({ max: 255 }).withMessage('photoUrl must be at most 255 characters'),
];

const updateMaintenanceStatus = [
  param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer'),
  body('status').isIn(VALID_STATUSES).withMessage('Invalid status'),
  body('approvedBy').optional().isInt({ gt: 0 }).withMessage('approvedBy must be a positive integer'),
  body('technicianName').optional().isString().trim().isLength({ min: 1, max: 120 }).withMessage('technicianName must be at most 120 characters'),
];

module.exports = {
  idParam,
  listMaintenanceRequests,
  createMaintenanceRequest,
  updateMaintenanceStatus,
};