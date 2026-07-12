// Handles incoming HTTP requests for audits and coordinates responses via the service layer.

const { validationResult } = require('express-validator');
const asyncHandler = require('../../utils/asyncHandler');
const sendSuccess = require('../../utils/sendSuccess');
const AppError = require('../../utils/AppError');
const service = require('./service');

function assertValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, errors.array());
  }
}

const getAllAuditCycles = asyncHandler(async (req, res) => {
  assertValid(req);

  const { status, department_id: departmentId } = req.query;
  const cycles = await service.listAuditCycles({ status, departmentId });

  return sendSuccess(res, 200, 'Audit cycles retrieved successfully', cycles);
});

const getAuditCycleById = asyncHandler(async (req, res) => {
  assertValid(req);

  const cycle = await service.getAuditCycleById(req.params.id);

  return sendSuccess(res, 200, 'Audit cycle retrieved successfully', cycle);
});

const createAuditCycle = asyncHandler(async (req, res) => {
  assertValid(req);

  const cycle = await service.createAuditCycle(req.body);

  return sendSuccess(res, 201, 'Audit cycle created successfully', cycle);
});

const populateAuditItems = asyncHandler(async (req, res) => {
  assertValid(req);

  const result = await service.populateAuditItems(req.params.id);

  return sendSuccess(res, 201, 'Audit items populated successfully', result);
});

const assignAuditors = asyncHandler(async (req, res) => {
  assertValid(req);

  const result = await service.assignAuditors(req.params.id, req.body.auditorIds);

  return sendSuccess(res, 200, 'Auditors assigned successfully', result);
});

const getAuditItems = asyncHandler(async (req, res) => {
  assertValid(req);

  const { verification_status: verificationStatus } = req.query;
  const items = await service.listAuditItems(req.params.id, { verificationStatus });

  return sendSuccess(res, 200, 'Audit items retrieved successfully', items);
});

const updateItemVerification = asyncHandler(async (req, res) => {
  assertValid(req);

  const item = await service.updateItemVerification(req.params.itemId, req.body);

  return sendSuccess(res, 200, 'Audit item verification updated successfully', item);
});

const forceCloseAuditCycle = asyncHandler(async (req, res) => {
  assertValid(req);

  const result = await service.forceCloseAuditCycle(req.params.id);

  return sendSuccess(res, 200, 'Audit cycle force-closed successfully', result);
});

const getDiscrepancyReports = asyncHandler(async (req, res) => {
  assertValid(req);

  const reports = await service.listDiscrepancyReports(req.params.id);

  return sendSuccess(res, 200, 'Discrepancy reports retrieved successfully', reports);
});

module.exports = {
  getAllAuditCycles,
  getAuditCycleById,
  createAuditCycle,
  populateAuditItems,
  assignAuditors,
  getAuditItems,
  updateItemVerification,
  forceCloseAuditCycle,
  getDiscrepancyReports,
};