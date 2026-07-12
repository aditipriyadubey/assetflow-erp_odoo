// Contains maintenance business logic and orchestrates operations between controllers and the repository.

const AppError = require('../../utils/AppError');
const repository = require('./repository');

// TODO: Assets module dependency unavailable at implementation time.
// Creating a maintenance request should verify the asset exists via something like
// assetsService.getAssetById(assetId) / assetsService.assertExists(assetId) from
// server/src/modules/assets/service.js once that module exposes it. It may also need
// to transition assets.status (e.g. -> 'Under Maintenance' on approval, back to
// 'Active' on resolution). Not invoked here to avoid assuming an API shape.

// TODO: Notifications module dependency unavailable at implementation time.
// Status transitions (Approved/Rejected/TechnicianAssigned/InProgress/Resolved) and
// closure should notify the requester (raised_by) via something like
// notificationsService.createNotification({ userId, type, message, relatedEntityType,
// relatedEntityId }) from server/src/modules/notifications/service.js once available.

const VALID_STATUSES = [
  'Pending',
  'Approved',
  'Rejected',
  'TechnicianAssigned',
  'InProgress',
  'Resolved',
];

const TERMINAL_STATUSES = ['Rejected', 'Resolved'];

function assertValidTransition(currentStatus, nextStatus) {
  if (!VALID_STATUSES.includes(nextStatus)) {
    throw new AppError(`Invalid maintenance status: ${nextStatus}`, 400);
  }

  if (TERMINAL_STATUSES.includes(currentStatus)) {
    throw new AppError(
      `Maintenance request cannot be updated because it is already ${currentStatus}`,
      409
    );
  }
}

async function getAllMaintenanceRequests(filters) {
  return repository.findAll(filters);
}

async function getMaintenanceRequestById(id) {
  const request = await repository.findById(id);
  if (!request) {
    throw new AppError('Maintenance request not found', 404);
  }
  return request;
}

async function createMaintenanceRequest(data) {
  const { assetId, raisedBy, issueDescription, priority, photoUrl } = data;

  // TODO: validate asset exists via assetsService once available.

  return repository.create({
    assetId,
    raisedBy,
    issueDescription,
    priority: priority || 'Medium',
    photoUrl: photoUrl || null,
  });
}

async function updateMaintenanceStatus(id, data) {
  const { status, approvedBy, technicianName } = data;

  const existing = await repository.findById(id);
  if (!existing) {
    throw new AppError('Maintenance request not found', 404);
  }

  assertValidTransition(existing.status, status);

  if (status === 'Approved' && !approvedBy) {
    throw new AppError('approvedBy is required when approving a maintenance request', 400);
  }

  if (status === 'TechnicianAssigned' && !technicianName) {
    throw new AppError(
      'technicianName is required when assigning a technician',
      400
    );
  }

  const resolvedAt = status === 'Resolved' ? new Date() : null;

  const updated = await repository.updateStatus(id, {
    status,
    approvedBy: approvedBy || existing.approved_by,
    technicianName: technicianName || existing.technician_name,
    resolvedAt,
  });

  // TODO: call notificationsService.createNotification(...) here once available.
  // TODO: call assetsService to sync assets.status once available.

  return updated;
}

async function closeMaintenanceRequest(id) {
  const existing = await repository.findById(id);
  if (!existing) {
    throw new AppError('Maintenance request not found', 404);
  }

  if (existing.status === 'Resolved') {
    return existing;
  }

  if (existing.status === 'Rejected') {
    throw new AppError('Maintenance request cannot be closed because it was rejected', 409);
  }

  const closed = await repository.close(id);

  // TODO: call notificationsService.createNotification(...) here once available.
  // TODO: call assetsService to revert assets.status once available.

  return closed;
}

module.exports = {
  getAllMaintenanceRequests,
  getMaintenanceRequestById,
  createMaintenanceRequest,
  updateMaintenanceStatus,
  closeMaintenanceRequest,
};