/**
 * server/src/modules/categories/service.js
 * Owner: Developer 3
 *
 * Pure business logic for Asset Categories (SDD §8 layering, FR-2.2).
 * Never touches req/res. Every failure path throws a typed AppError
 * (SDD §28); the central error-handling middleware converts that into
 * the standard error envelope (SDD Shared Contracts §A.1/A.2).
 */

const repository = require('./repository');
const AppError = require('../../utils/AppError');

/**
 * GET /categories (all authenticated).
 * @returns {Promise<object[]>}
 */
async function listCategories() {
  return repository.findAll();
}

/**
 * @param {number} id
 */
async function getCategoryById(id) {
  const category = await repository.findById(id);
  if (!category) {
    throw new AppError('NOT_FOUND', 'Asset category not found.', 404);
  }
  return category;
}

/**
 * POST /categories (Admin only, SDD §14.4).
 * @param {{name:string, description?:string, custom_fields?:object}} input
 */
async function createCategory({ name, description, custom_fields }) {
  const existing = await repository.findByName(name);
  if (existing) {
    throw new AppError('VALIDATION_ERROR', 'A category with this name already exists.', 400, {
      name: 'A category with this name already exists.',
    });
  }

  const id = await repository.create({ name, description, custom_fields });
  return getCategoryById(id);
}

/**
 * PUT /categories/:id (Admin only, SDD §14.4).
 * @param {number} id
 * @param {{name:string, description?:string, custom_fields?:object}} input
 */
async function updateCategory(id, { name, description, custom_fields }) {
  const existing = await repository.findById(id);
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Asset category not found.', 404);
  }

  const duplicate = await repository.findByName(name);
  if (duplicate && duplicate.id !== id) {
    throw new AppError('VALIDATION_ERROR', 'A category with this name already exists.', 400, {
      name: 'A category with this name already exists.',
    });
  }

  await repository.update(id, { name, description, custom_fields });
  return getCategoryById(id);
}

/**
 * DELETE /categories/:id (Admin only, SDD §14.4). Blocked with 409 if
 * any asset still references this category.
 * @param {number} id
 */
async function deleteCategory(id) {
  const existing = await repository.findById(id);
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Asset category not found.', 404);
  }

  const assetCount = await repository.countAssetsInCategory(id);
  if (assetCount > 0) {
    throw new AppError(
      'VALIDATION_ERROR',
      'This category is still assigned to one or more assets and cannot be deleted.',
      409
    );
  }

  await repository.remove(id);
}

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};