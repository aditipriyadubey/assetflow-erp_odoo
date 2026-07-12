/**
 * server/src/modules/dashboard/routes.js
 *
 * Mounted at /api/v1/dashboard (SDD §14.12 / §16). All authenticated
 * roles may access dashboard endpoints; KPI counts are role-scoped
 * inside the service layer (SDD §24).
 */

const express = require('express');

const { authenticate } = require('../../middlewares/auth');
const { requireRole } = require('../../middlewares/rbac');
const { validate } = require('../../middlewares/validate');
const controller = require('./controller');
const { kpisValidators, overdueValidators } = require('./validators');

const router = express.Router();

const DASHBOARD_ROLES = ['Admin', 'AssetManager', 'DepartmentHead', 'Employee'];

router.get(
  '/kpis',
  authenticate,
  requireRole(...DASHBOARD_ROLES),
  kpisValidators,
  validate,
  controller.getKpis
);

router.get(
  '/overdue',
  authenticate,
  requireRole(...DASHBOARD_ROLES),
  overdueValidators,
  validate,
  controller.getOverdueReturns
);

module.exports = router;
