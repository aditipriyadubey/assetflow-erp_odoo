/**
 * server/src/modules/activityLogs/routes.js
 * Owner: Developer 3
 *
 * Mounted at /api/v1/activity-logs (SDD §14.13). Admin only — the log
 * is a system-wide audit trail, not a per-user feed like notifications.
 */

const express = require('express');

const { authenticate } = require('../../middlewares/auth');
const { requireRole } = require('../../middlewares/rbac');
const { validate } = require('../../middlewares/validate');
const controller = require('./controller');
const { listActivityLogsValidators } = require('./validators');

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  requireRole('Admin'),
  listActivityLogsValidators,
  validate,
  controller.listActivityLogs
);

module.exports = router;