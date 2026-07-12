/**
 * server/src/modules/reports/routes.js
 *
 * Mounted at /api/v1/reports (SDD §14.11 / §16). RBAC matches the
 * SDD endpoint table; Department Head access is limited to utilization,
 * department allocation, and booking heatmap reports.
 */

const express = require('express');

const { authenticate } = require('../../middlewares/auth');
const { requireRole } = require('../../middlewares/rbac');
const { validate } = require('../../middlewares/validate');
const controller = require('./controller');
const {
  utilizationValidators,
  maintenanceFrequencyValidators,
  dueForMaintenanceValidators,
  departmentAllocationValidators,
  bookingHeatmapValidators,
  exportValidators,
} = require('./validators');

const router = express.Router();

router.get(
  '/utilization',
  authenticate,
  requireRole('Admin', 'AssetManager', 'DepartmentHead'),
  utilizationValidators,
  validate,
  controller.getUtilization
);

router.get(
  '/maintenance-frequency',
  authenticate,
  requireRole('Admin', 'AssetManager'),
  maintenanceFrequencyValidators,
  validate,
  controller.getMaintenanceFrequency
);

router.get(
  '/due-for-maintenance',
  authenticate,
  requireRole('Admin', 'AssetManager'),
  dueForMaintenanceValidators,
  validate,
  controller.getDueForMaintenance
);

router.get(
  '/department-allocation',
  authenticate,
  requireRole('Admin', 'AssetManager', 'DepartmentHead'),
  departmentAllocationValidators,
  validate,
  controller.getDepartmentAllocation
);

router.get(
  '/booking-heatmap',
  authenticate,
  requireRole('Admin', 'AssetManager', 'DepartmentHead'),
  bookingHeatmapValidators,
  validate,
  controller.getBookingHeatmap
);

router.get(
  '/export',
  authenticate,
  requireRole('Admin', 'AssetManager'),
  exportValidators,
  validate,
  controller.exportReport
);

module.exports = router;
