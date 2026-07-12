/**
 * server/src/modules/users/controller.js
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

/** GET /users */
const listUsers = asyncHandler(async (req, res) => {
  const { users, meta } = await service.listUsers(req.query);
  return sendSuccess(res, 200, users, undefined, meta);
});

/** GET /users/:id */
const getUser = asyncHandler(async (req, res) => {
  const user = await service.getUserById(Number(req.params.id));
  return sendSuccess(res, 200, user);
});

/** PATCH /users/:id */
const updateUser = asyncHandler(async (req, res) => {
  const { department_id, status } = req.body;
  const user = await service.updateUser(Number(req.params.id), { department_id, status });
  return sendSuccess(res, 200, user, 'User updated successfully.');
});

/** PATCH /users/:id/role */
const changeRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await service.changeRole(Number(req.params.id), role);
  return sendSuccess(res, 200, user, 'Role updated successfully.');
});

/** PATCH /users/:id/deactivate */
const deactivateUser = asyncHandler(async (req, res) => {
  const user = await service.deactivateUser(Number(req.params.id));
  return sendSuccess(res, 200, user, 'User deactivated successfully.');
});

module.exports = {
  listUsers,
  getUser,
  updateUser,
  changeRole,
  deactivateUser,
};