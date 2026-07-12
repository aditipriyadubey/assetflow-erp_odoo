/**
 * server/src/modules/departments/validators.js
 * Owner: Developer 3
 *
 * express-validator chains only — no business logic. Messages match
 * SDD §26 Validation Rules verbatim. Controllers never trust raw
 * req.body/req.query directly (SDD §28).
 */

const { body, param, query } = require('express-validator');

const idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('A valid department id is required.'),
];

const listDepartmentsValidators = [
  query('flat').optional().isIn(['true', 'false']).withMessage('flat must be true or false.'),
];

const createDepartmentValidators = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Name is required (2–150 characters).'),
  body('head_user_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Selected department head is inactive or does not exist.'),
  body('parent_department_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Selected parent department does not exist.'),
];

const updateDepartmentValidators = [...idParamValidator, ...createDepartmentValidators];

const updateStatusValidators = [
  ...idParamValidator,
  body('status').isIn(['Active', 'Inactive']).withMessage('status must be Active or Inactive.'),
];

module.exports = {
  idParamValidator,
  listDepartmentsValidators,
  createDepartmentValidators,
  updateDepartmentValidators,
  updateStatusValidators,
};