/**
 * server/src/modules/assets/routes.js
 * Owner: Developer 2
 *
 * Mounted at /api/v1/assets (SDD §14.5). GET routes are open to any
 * authenticated user; writes and asset history require Admin or
 * AssetManager (seed/demo flow: AssetManager registers and manages
 * assets; QuickActionsBar "Register Asset" mirrors POST /).
 */

const express = require('express');

const { authenticate } = require('../../middlewares/auth');
const { requireRole } = require('../../middlewares/rbac');
const { validate } = require('../../middlewares/validate');
const controller = require('./controller');
const {
  createAssetValidators,
  updateAssetValidators,
  assetIdValidator,
} = require('./validators');

const router = express.Router();

router.use(authenticate);

router.get('/search', controller.searchAssets);
router.get('/', controller.getAllAssets);
router.get(
  '/:id/history',
  requireRole('Admin', 'AssetManager'),
  assetIdValidator,
  validate,
  controller.getAssetHistory
);
router.get('/:id', assetIdValidator, validate, controller.getAssetById);
router.post(
  '/',
  requireRole('Admin', 'AssetManager'),
  createAssetValidators,
  validate,
  controller.createAsset
);
router.patch(
  '/:id',
  requireRole('Admin', 'AssetManager'),
  assetIdValidator,
  updateAssetValidators,
  validate,
  controller.updateAsset
);
router.delete(
  '/:id',
  requireRole('Admin', 'AssetManager'),
  assetIdValidator,
  validate,
  controller.deleteAsset
);

module.exports = router;
