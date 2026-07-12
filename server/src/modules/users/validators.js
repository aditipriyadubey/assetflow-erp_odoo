/**
 * server/src/modules/users/validators.js
 * Owner: Developer 3
 *
 * express-validator chains only — no business logic. Messages match
 * SDD §26 Validation Rules verbatim. Controllers never trust raw
 * req.body/req.query directly (SDD §28).
 */

const { param, query, body } = require('express-validator');

const ROLES = ['Admin', 'AssetManager', 'DepartmentHead', 'Employee'];
const ASSIGNABLE_ROLES = ['AssetManager', 'DepartmentHead', 'Employee'];
const STATUSES = ['Active', 'Inactive'];

const idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('A valid user id is required.'),
];

const listUsersValidators = [
  query('department_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('department_id must be a valid id.'),
  query('role').optional().isIn(ROLES).withMessage(`role must be one of ${ROLES.join(', ')}.`),
  query('status').optional().isIn(STATUSES).withMessage('status must be Active or Inactive.'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100.'),
];

// PATCH /users/:id updates department/status only — role is rejected
// here so the only way to change it is PATCH /users/:id/role (SDD §18).
const updateUserValidators = [
  ...idParamValidator,
  body('role').not().exists().withMessage('Role cannot be changed here — use PATCH /users/:id/role.'),
  body('department_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Selected department is inactive or does not exist.'),
  body('status').optional().isIn(STATUSES).withMessage('status must be Active or Inactive.'),
];

const changeRoleValidators = [
  ...idParamValidator,
  body('role')
    .exists()
    .withMessage('You are not authorized to change roles.')
    .bail()
    .isIn(ASSIGNABLE_ROLES)
    .withMessage('You are not authorized to change roles.'),
];

const deactivateUserValidators = [...idParamValidator];

module.exports = {
  idParamValidator,
  listUsersValidators,
  updateUserValidators,
  changeRoleValidators,
  deactivateUserValidators,
};