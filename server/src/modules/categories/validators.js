/**
 * server/src/modules/categories/validators.js
 * Owner: Developer 3
 *
 * express-validator chains only — no business logic. Messages match
 * SDD §26 Validation Rules verbatim. Controllers never trust raw
 * req.body directly (SDD §28).
 */

const { body, param } = require('express-validator');

const idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('A valid category id is required.'),
];

const createCategoryValidators = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name is required (2–100 characters).'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Description cannot exceed 255 characters.'),
  body('custom_fields')
    .optional({ nullable: true })
    .isObject()
    .withMessage('Custom fields must be a valid JSON object.'),
];

const updateCategoryValidators = [...idParamValidator, ...createCategoryValidators];

const deleteCategoryValidators = [...idParamValidator];

module.exports = {
  idParamValidator,
  createCategoryValidators,
  updateCategoryValidators,
  deleteCategoryValidators,
};