/**
 * server/src/modules/departments/service.js
 * Owner: Developer 3
 *
 * Pure business logic for Organization Setup / Departments (SDD §8
 * layering, FR-2.1). Never touches req/res. Every failure path throws
 * a typed AppError (SDD §28); the central error-handling middleware
 * converts that into the standard error envelope (SDD Shared
 * Contracts §A.1/A.2).
 *
 * Cross-module reads go through the owning module's repository per
 * SDD Shared Contracts §A.5 (never its controller) — here that's
 * users/repository.js for head-user and active-employee checks.
 */

const repository = require('./repository');
const usersRepository = require('../users/repository');
const AppError = require('../../utils/AppError');

/**
 * @param {number} userId
 */
async function assertHeadUserExists(userId) {
  const user = await usersRepository.findById(userId);
  if (!user || user.status !== 'Active') {
    throw new AppError(
      'VALIDATION_ERROR',
      'Selected department head is inactive or does not exist.',
      400,
      { head_user_id: 'Selected department head is inactive or does not exist.' }
    );
  }
}

/**
 * @param {number} departmentId
 */
async function assertParentExists(departmentId) {
  const parent = await repository.findById(departmentId);
  if (!parent) {
    throw new AppError(
      'VALIDATION_ERROR',
      'Selected parent department does not exist.',
      400,
      { parent_department_id: 'Selected parent department does not exist.' }
    );
  }
}

/**
 * Builds a parent/children tree from the flat list — the default
 * GET /departments shape (SDD §14.3: "tree or flat list ?flat=true").
 * @param {object[]} rows
 */
function buildTree(rows) {
  const byId = new Map(rows.map((row) => [row.id, { ...row, children: [] }]));
  const roots = [];

  for (const row of byId.values()) {
    if (row.parent_department_id && byId.has(row.parent_department_id)) {
      byId.get(row.parent_department_id).children.push(row);
    } else {
      roots.push(row);
    }
  }

  return roots;
}

/**
 * GET /departments (all authenticated).
 * @param {{flat?:string}} query
 */
async function listDepartments({ flat } = {}) {
  const rows = await repository.findAll();
  return flat === 'true' ? rows : buildTree(rows);
}

/**
 * @param {number} id
 */
async function getDepartmentById(id) {
  const department = await repository.findById(id);
  if (!department) {
    throw new AppError('NOT_FOUND', 'Department not found.', 404);
  }
  return department;
}

/**
 * POST /departments (Admin only, SDD §14.3).
 * @param {{name:string, head_user_id?:number, parent_department_id?:number}} input
 */
async function createDepartment({ name, head_user_id, parent_department_id }) {
  const existing = await repository.findByName(name);
  if (existing) {
    throw new AppError('VALIDATION_ERROR', 'A department with this name already exists.', 400, {
      name: 'A department with this name already exists.',
    });
  }

  if (head_user_id !== undefined && head_user_id !== null) {
    await assertHeadUserExists(head_user_id);
  }
  if (parent_department_id !== undefined && parent_department_id !== null) {
    await assertParentExists(parent_department_id);
  }

  const id = await repository.create({ name, head_user_id, parent_department_id });
  return getDepartmentById(id);
}

/**
 * PUT /departments/:id (Admin only, SDD §14.3).
 * @param {number} id
 * @param {{name:string, head_user_id?:number, parent_department_id?:number}} input
 */
async function updateDepartment(id, { name, head_user_id, parent_department_id }) {
  const existing = await repository.findById(id);
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Department not found.', 404);
  }

  const duplicate = await repository.findByName(name);
  if (duplicate && duplicate.id !== id) {
    throw new AppError('VALIDATION_ERROR', 'A department with this name already exists.', 400, {
      name: 'A department with this name already exists.',
    });
  }

  if (head_user_id !== undefined && head_user_id !== null) {
    await assertHeadUserExists(head_user_id);
  }
  if (parent_department_id !== undefined && parent_department_id !== null) {
    if (Number(parent_department_id) === Number(id)) {
      throw new AppError(
        'VALIDATION_ERROR',
        'A department cannot be its own parent.',
        400,
        { parent_department_id: 'A department cannot be its own parent.' }
      );
    }
    await assertParentExists(parent_department_id);
  }

  await repository.update(id, { name, head_user_id, parent_department_id });
  return getDepartmentById(id);
}

/**
 * PATCH /departments/:id/status (Admin only, SDD §14.3). Deactivating
 * a department that still has active employees, or child departments,
 * is blocked (SDD §26 edge cases: "must reassign first").
 * @param {number} id
 * @param {string} status
 */
async function updateDepartmentStatus(id, status) {
  const existing = await repository.findById(id);
  if (!existing) {
    throw new AppError('NOT_FOUND', 'Department not found.', 404);
  }

  if (status === 'Inactive') {
    const activeUsers = await usersRepository.countActiveUsersInDepartment(id);
    if (activeUsers > 0) {
      throw new AppError(
        'VALIDATION_ERROR',
        'This department still has active employees assigned. Reassign them before deactivating.',
        409
      );
    }

    const childDepartments = await repository.countChildDepartments(id);
    if (childDepartments > 0) {
      throw new AppError(
        'VALIDATION_ERROR',
        'This department still has sub-departments. Reassign or deactivate them first.',
        409
      );
    }
  }

  await repository.updateStatus(id, status);
  return getDepartmentById(id);
}

module.exports = {
  listDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  updateDepartmentStatus,
};