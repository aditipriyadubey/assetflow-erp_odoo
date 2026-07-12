/**
 * server/src/modules/categories/routes.js
 * Owner: Developer 3
 *
 * Mounted at /api/v1/categories (SDD §14.4). GET is open to any
 * authenticated user; all writes are Admin-only.
 */

const express = require('express');

const { authenticate } = require('../../middlewares/auth');
const { requireRole } = require('../../middlewares/rbac');
const { validate } = require('../../middlewares/validate');
const controller = require('./controller');
const {
  createCategoryValidators,
  updateCategoryValidators,
  deleteCategoryValidators,
} = require('./validators');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.listCategories);
router.post(
  '/',
  requireRole('Admin'),
  createCategoryValidators,
  validate,
  controller.createCategory
);
router.put(
  '/:id',
  requireRole('Admin'),
  updateCategoryValidators,
  validate,
  controller.updateCategory
);
router.delete(
  '/:id',
  requireRole('Admin'),
  deleteCategoryValidators,
  validate,
  controller.deleteCategory
);

module.exports = router;