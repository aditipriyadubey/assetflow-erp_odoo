/**
 * server/src/modules/departments/controller.js
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

/** GET /departments */
const listDepartments = asyncHandler(async (req, res) => {
  const departments = await service.listDepartments(req.query);
  return sendSuccess(res, 200, departments);
});

/** POST /departments */
const createDepartment = asyncHandler(async (req, res) => {
  const { name, head_user_id, parent_department_id } = req.body;
  const department = await service.createDepartment({ name, head_user_id, parent_department_id });
  return sendSuccess(res, 201, department);
});

/** PUT /departments/:id */
const updateDepartment = asyncHandler(async (req, res) => {
  const { name, head_user_id, parent_department_id } = req.body;
  const department = await service.updateDepartment(Number(req.params.id), {
    name,
    head_user_id,
    parent_department_id,
  });
  return sendSuccess(res, 200, department, 'Department updated successfully.');
});

/** PATCH /departments/:id/status */
const updateDepartmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const department = await service.updateDepartmentStatus(Number(req.params.id), status);
  return sendSuccess(res, 200, department, 'Department status updated successfully.');
});

module.exports = {
  listDepartments,
  createDepartment,
  updateDepartment,
  updateDepartmentStatus,
};