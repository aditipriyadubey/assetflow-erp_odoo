/**
 * server/src/modules/users/service.js
 * Owner: Developer 3
 *
 * Pure business logic for the Employee Directory (SDD §8 layering,
 * FR-2.3). Never touches req/res. Every failure path throws a typed
 * AppError (SDD §28); the central error-handling middleware converts
 * that into the standard error envelope (SDD Shared Contracts §A.1/A.2).
 *
 * changeRole() is the sole enforcement point for role changes
 * referenced by SDD §18 — no other function in this module (or any
 * other) writes to users.role.
 */

const repository = require('./repository');
const departmentsRepository = require('../departments/repository');
const AppError = require('../../utils/AppError');

const ASSIGNABLE_ROLES = ['AssetManager', 'DepartmentHead', 'Employee'];

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Clamps pagination params into a valid range rather than erroring
 * (SDD §26: "pagination params ... silently clamps to valid range").
 * @param {number} page
 * @param {number} limit
 */
function clampPagination(page, limit) {
  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : DEFAULT_PAGE;
  const rawLimit = Number.isFinite(limit) && limit >= 1 ? Math.floor(limit) : DEFAULT_LIMIT;
  const safeLimit = Math.min(rawLimit, MAX_LIMIT);
  return { page: safePage, limit: safeLimit };
}

/**
 * Passwords are never returned in any API response (SDD §31) — the
 * repository already excludes password_hash from SAFE_COLUMNS, this
 * is a second layer of defense at the service boundary.
 * @param {object} user
 */
function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department_id: user.department_id,
    status: user.status,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

/**
 * GET /users (Admin only). Scoped filters map 1:1 to SDD §14.2.
 * @param {{department_id?:string, role?:string, status?:string, page?:string, limit?:string}} query
 */
async function listUsers(query = {}) {
  const { page, limit } = clampPagination(Number(query.page), Number(query.limit));

  const filters = {
    department_id:
      query.department_id !== undefined && query.department_id !== ''
        ? Number(query.department_id)
        : undefined,
    role: query.role,
    status: query.status,
    page,
    limit,
  };

  const { rows, total } = await repository.findAll(filters);

  return {
    users: rows.map(sanitizeUser),
    meta: { page, limit, total },
  };
}

/**
 * GET /users/:id (Admin, or self — RBAC enforced at route level via
 * allowSelfOrRoles).
 * @param {number} id
 */
async function getUserById(id) {
  const user = await repository.findById(id);
  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found.', 404);
  }
  return sanitizeUser(user);
}

/**
 * Validates that a department, if provided, exists and is Active
 * (SDD §26: "Selected department is inactive or does not exist.").
 * @param {number} departmentId
 */
async function assertDepartmentAssignable(departmentId) {
  const department = await departmentsRepository.findById(departmentId);
  if (!department || department.status !== 'Active') {
    throw new AppError(
      'VALIDATION_ERROR',
      'Selected department is inactive or does not exist.',
      400,
      { department_id: 'Selected department is inactive or does not exist.' }
    );
  }
}

/**
 * PATCH /users/:id — Admin only; updates department and/or status
 * (SDD §14.2). Role can never be set through this path.
 * @param {number} id
 * @param {{department_id?:number|null, status?:string}} changes
 */
async function updateUser(id, { department_id, status }) {
  const existing = await repository.findById(id);
  if (!existing) {
    throw new AppError('NOT_FOUND', 'User not found.', 404);
  }

  if (department_id !== undefined && department_id !== null) {
    await assertDepartmentAssignable(department_id);
  }

  await repository.updateDepartmentAndStatus(id, { department_id, status });
  return getUserById(id);
}

/**
 * PATCH /users/:id/role — the ONLY role-change endpoint (SDD
 * §14.2/§18). Admin-only; enforced further up by RBAC middleware.
 * @param {number} id
 * @param {string} role
 */
async function changeRole(id, role) {
  if (!ASSIGNABLE_ROLES.includes(role)) {
    throw new AppError('VALIDATION_ERROR', 'You are not authorized to change roles.', 400, {
      role: 'Role must be one of AssetManager, DepartmentHead, or Employee.',
    });
  }

  const existing = await repository.findById(id);
  if (!existing) {
    throw new AppError('NOT_FOUND', 'User not found.', 404);
  }

  await repository.updateRole(id, role);
  return getUserById(id);
}

/**
 * PATCH /users/:id/deactivate — Admin only (SDD §14.2).
 * @param {number} id
 */
async function deactivateUser(id) {
  const existing = await repository.findById(id);
  if (!existing) {
    throw new AppError('NOT_FOUND', 'User not found.', 404);
  }
  await repository.deactivate(id);
  return getUserById(id);
}

module.exports = {
  listUsers,
  getUserById,
  updateUser,
  changeRole,
  deactivateUser,
};