/**
 * server/src/modules/reports/routes.js
 */

const express = require('express');

const { authenticate } = require('../../middlewares/auth');
const { requireRole } = require('../../middlewares/rbac');
const { validate } = require('../../middlewares/validate');
const controller = require('./controller');
const { reportQueryValidators } = require('./validators');

const router = express.Router();

router.use(authenticate);

router.get(
  '/inventory',
  requireRole('Admin', 'AssetManager', 'DepartmentHead'),
  reportQueryValidators,
  validate,
  controller.getInventoryReport
);
router.get(
  '/allocations',
  requireRole('Admin', 'AssetManager', 'DepartmentHead'),
  reportQueryValidators,
  validate,
  controller.getAllocationReport
);
router.get(
  '/transfers',
  requireRole('Admin', 'AssetManager', 'DepartmentHead'),
  reportQueryValidators,
  validate,
  controller.getTransferReport
);
router.get(
  '/maintenance',
  requireRole('Admin', 'AssetManager', 'DepartmentHead'),
  reportQueryValidators,
  validate,
  controller.getMaintenanceReport
);
router.get(
  '/audits',
  requireRole('Admin', 'AssetManager', 'DepartmentHead'),
  reportQueryValidators,
  validate,
  controller.getAuditReport
);

module.exports = router;
