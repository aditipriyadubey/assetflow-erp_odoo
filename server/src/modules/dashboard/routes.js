/**
 * server/src/modules/dashboard/routes.js
<<<<<<< HEAD
=======
 *
 * Mounted at /api/v1/dashboard (SDD §14.12 / §16). All authenticated
 * roles may access dashboard endpoints; KPI counts are role-scoped
 * inside the service layer (SDD §24).
>>>>>>> develop
 */

const express = require('express');

const { authenticate } = require('../../middlewares/auth');
const { requireRole } = require('../../middlewares/rbac');
const { validate } = require('../../middlewares/validate');
const controller = require('./controller');
<<<<<<< HEAD
const { dashboardOverviewValidators } = require('./validators');

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  requireRole('Admin', 'AssetManager', 'DepartmentHead'),
  dashboardOverviewValidators,
  validate,
  controller.getDashboardSummary
=======
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
>>>>>>> develop
);

module.exports = router;
