/**
 * server/src/modules/departments/routes.js
 * Owner: Developer 3
 *
 * Mounted at /api/v1/departments (SDD §14.3). GET is open to any
 * authenticated user; all writes are Admin-only.
 */

const express = require('express');

const { authenticate } = require('../../middlewares/auth');
const { requireRole } = require('../../middlewares/rbac');
const { validate } = require('../../middlewares/validate');
const controller = require('./controller');
const {
  listDepartmentsValidators,
  createDepartmentValidators,
  updateDepartmentValidators,
  updateStatusValidators,
} = require('./validators');

const router = express.Router();

router.use(authenticate);

router.get('/', listDepartmentsValidators, validate, controller.listDepartments);
router.post(
  '/',
  requireRole('Admin'),
  createDepartmentValidators,
  validate,
  controller.createDepartment
);
router.put(
  '/:id',
  requireRole('Admin'),
  updateDepartmentValidators,
  validate,
  controller.updateDepartment
);
router.patch(
  '/:id/status',
  requireRole('Admin'),
  updateStatusValidators,
  validate,
  controller.updateDepartmentStatus
);

module.exports = router;