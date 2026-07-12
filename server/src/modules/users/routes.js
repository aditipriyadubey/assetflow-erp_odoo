/**
 * server/src/modules/users/routes.js
 * Owner: Developer 3
 *
 * Mounted at /api/v1/users (SDD §14.2). Every route requires
 * authentication; list/update/role/deactivate are Admin-only, and
 * GET /:id additionally allows the user to fetch their own profile.
 */

const express = require('express');

const { authenticate } = require('../../middlewares/auth');
const { requireRole, allowSelfOrRoles } = require('../../middlewares/rbac');
const { validate } = require('../../middlewares/validate');
const controller = require('./controller');
const {
  listUsersValidators,
  idParamValidator,
  updateUserValidators,
  changeRoleValidators,
  deactivateUserValidators,
} = require('./validators');

const router = express.Router();

router.use(authenticate);

router.get('/', requireRole('Admin'), listUsersValidators, validate, controller.listUsers);
router.get('/:id', idParamValidator, validate, allowSelfOrRoles('id', 'Admin'), controller.getUser);
router.patch('/:id', requireRole('Admin'), updateUserValidators, validate, controller.updateUser);
router.patch('/:id/role', requireRole('Admin'), changeRoleValidators, validate, controller.changeRole);
router.patch(
  '/:id/deactivate',
  requireRole('Admin'),
  deactivateUserValidators,
  validate,
  controller.deactivateUser
);

module.exports = router;