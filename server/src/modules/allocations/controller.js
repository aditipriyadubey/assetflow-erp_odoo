/**
 * server/src/modules/allocations/controller.js
 * Owner: Developer 2
 *
 * Thin HTTP layer only: parses the request, delegates to service.js,
 * and shapes the success response envelope.
 */

const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/responseEnvelope');
const service = require('./service');

/** GET /allocations */
const getAllAllocations = asyncHandler(async (req, res) => {
  const allocations = await service.getAllAllocations();
  return sendSuccess(res, 200, allocations);
});

/** GET /allocations/:id */
const getAllocationById = asyncHandler(async (req, res) => {
  const allocation = await service.getAllocationById(Number(req.params.id));
  return sendSuccess(res, 200, allocation);
});

/** POST /allocations */
const createAllocation = asyncHandler(async (req, res) => {
  const allocation = await service.createAllocation({
    asset_id: req.body.asset_id,
    employee_id: req.body.employee_id ?? null,
    department_id: req.body.department_id ?? null,
    allocated_date: req.body.allocated_date,
    expected_return_date: req.body.expected_return_date ?? null,
    actual_return_date: req.body.actual_return_date ?? null,
    condition_checkin_notes: req.body.condition_checkin_notes ?? null,
    allocated_by: req.user.id,
  });
  return sendSuccess(res, 201, allocation);
});

/** PATCH /allocations/:id */
const updateAllocation = asyncHandler(async (req, res) => {
  const allocation = await service.updateAllocation(Number(req.params.id), req.body);
  return sendSuccess(res, 200, allocation);
});

/** DELETE /allocations/:id */
const deleteAllocation = asyncHandler(async (req, res) => {
  await service.deleteAllocation(Number(req.params.id));
  return sendSuccess(res, 200, {});
});

module.exports = {
  getAllAllocations,
  getAllocationById,
  createAllocation,
  updateAllocation,
  deleteAllocation,
};
