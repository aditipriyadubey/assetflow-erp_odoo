const express = require('express');

const { authenticate } = require('../../middlewares/auth');
const { requireRole } = require('../../middlewares/rbac');
const { validate } = require('../../middlewares/validate');
const controller = require('./controller');
const {
  createAllocationValidators,
  updateAllocationValidators,
  allocationIdValidator,
} = require('./validators');

const router = express.Router();

router.get('/', authenticate, requireRole('Admin', 'AssetManager', 'DepartmentHead'), controller.getAllAllocations);
router.post(
  '/',
  authenticate,
  requireRole('Admin', 'AssetManager', 'DepartmentHead'),
  createAllocationValidators,
  validate,
  controller.createAllocation
);
router.get(
  '/:id',
  authenticate,
  requireRole('Admin', 'AssetManager', 'DepartmentHead'),
  allocationIdValidator,
  validate,
  controller.getAllocationById
);
router.patch(
  '/:id',
  authenticate,
  requireRole('Admin', 'AssetManager', 'DepartmentHead'),
  allocationIdValidator,
  updateAllocationValidators,
  validate,
  controller.updateAllocation
);
router.delete(
  '/:id',
  authenticate,
  requireRole('Admin', 'AssetManager', 'DepartmentHead'),
  allocationIdValidator,
  validate,
  controller.deleteAllocation
);

module.exports = router;
