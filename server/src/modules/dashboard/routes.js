/**
 * server/src/modules/dashboard/routes.js
 */

const express = require('express');

const { authenticate } = require('../../middlewares/auth');
const { requireRole } = require('../../middlewares/rbac');
const { validate } = require('../../middlewares/validate');
const controller = require('./controller');
const { dashboardOverviewValidators } = require('./validators');

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  requireRole('Admin', 'AssetManager', 'DepartmentHead'),
  dashboardOverviewValidators,
  validate,
  controller.getDashboardSummary
);

module.exports = router;
