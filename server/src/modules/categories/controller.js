/**
 * server/src/modules/categories/controller.js
 * Owner: Developer 3
 *
 * Thin HTTP layer only: parses the request, delegates to service.js,
 * and shapes the success response envelope (SDD Shared Contracts §A.1).
 * No business logic and no try/catch here — asyncHandler forwards any
 * thrown AppError to the central error-handling middleware (SDD §28).
 */

const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/responseEnvelope');
const service = require('./service');

/** GET /categories */
const listCategories = asyncHandler(async (req, res) => {
  const categories = await service.listCategories();
  return sendSuccess(res, 200, categories);
});

/** POST /categories */
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, custom_fields } = req.body;
  const category = await service.createCategory({ name, description, custom_fields });
  return sendSuccess(res, 201, category);
});

/** PUT /categories/:id */
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, custom_fields } = req.body;
  const category = await service.updateCategory(Number(req.params.id), {
    name,
    description,
    custom_fields,
  });
  return sendSuccess(res, 200, category, 'Category updated successfully.');
});

/** DELETE /categories/:id */
const deleteCategory = asyncHandler(async (req, res) => {
  await service.deleteCategory(Number(req.params.id));
  return sendSuccess(res, 200, {}, 'Category deleted successfully.');
});

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};