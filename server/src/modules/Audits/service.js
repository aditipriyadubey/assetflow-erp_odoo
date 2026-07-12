// Contains audits business logic and orchestrates operations between controllers and the repository.

const AppError = require('../../utils/AppError');
const repository = require('./repository');

// TODO: Assets module dependency unavailable at implementation time.
// - populateAuditItems() should exclude assets in terminal states (e.g. Retired,
//   Disposed) via something like assetsService.listActiveAssets({ departmentId, location })
//   from server/src/modules/assets/service.js. Currently queried directly here against
//   the assets table because no Assets service API was available to call instead.
// - forceCloseAuditCycle() / updateItemVerification() should update assets.status to
//   'Lost' for items verified/left as Missing via something like
//   assetsService.markAssetLost(assetId) / assetsService.updateAssetCondition(assetId, condition).
//   Not invoked here — see the "Update Lost Assets" TODO markers below.

// TODO: Notifications module dependency unavailable at implementation time.
// Auditor assignment, item verification, and force-close should notify relevant users
// via something like notificationsService.createNotification({ userId, type, message,
// relatedEntityType, relatedEntityId }) from server/src/modules/notifications/service.js
// once available.

const CYCLE_STATUSES = ['Draft', 'InProgress', 'Closed'];
const ITEM_VERIFICATION_STATUSES = ['Pending', 'Verified', 'Missing', 'Damaged'];
const DISCREPANCY_ISSUE_TYPES = ['Missing', 'Damaged'];

async function listAuditCycles(filters) {
  return repository.findAllCycles(filters);
}

async function getAuditCycleById(id) {
  const cycle = await repository.findCycleById(id);
  if (!cycle) {
    throw new AppError('Audit cycle not found', 404);
  }
  return cycle;
}

async function createAuditCycle(data) {
  const { name, departmentId, location, startDate, endDate, createdBy } = data;

  if (new Date(endDate) < new Date(startDate)) {
    throw new AppError('endDate must be on or after startDate', 400);
  }

  return repository.createCycle({
    name,
    departmentId: departmentId || null,
    location: location || null,
    startDate,
    endDate,
    createdBy,
  });
}

async function populateAuditItems(cycleId) {
  return repository.withTransaction(async (conn) => {
    const cycle = await repository.findCycleByIdForUpdate(conn, cycleId);
    if (!cycle) {
      throw new AppError('Audit cycle not found', 404);
    }

    if (cycle.status !== 'Draft') {
      throw new AppError(
        `Audit items can only be populated while the cycle is Draft (current status: ${cycle.status})`,
        409
      );
    }

    // Scope: assets matching the cycle's department (via active allocation) and/or
    // location. If neither is set on the cycle, all non-terminal assets are included.
    // See TODO above regarding delegating this scoping to an Assets service API.
    const assetIds = await repository.findMatchingAssetIds(conn, {
      departmentId: cycle.department_id,
      location: cycle.location,
    });

    const insertedCount = await repository.bulkInsertAuditItems(conn, cycleId, assetIds);

    const updatedCycle = await repository.updateCycleStatus(conn, cycleId, {
      status: 'InProgress',
    });

    return {
      cycle: updatedCycle,
      matchedAssetCount: assetIds.length,
      insertedItemCount: insertedCount,
    };
  });
}

async function assignAuditors(cycleId, auditorIds) {
  return repository.withTransaction(async (conn) => {
    const cycle = await repository.findCycleByIdForUpdate(conn, cycleId);
    if (!cycle) {
      throw new AppError('Audit cycle not found', 404);
    }

    if (cycle.status === 'Closed') {
      throw new AppError('Cannot assign auditors to a closed audit cycle', 409);
    }

    await repository.assignAuditors(conn, cycleId, auditorIds);

    // TODO: call notificationsService.createNotification(...) for each auditor here.

    return repository.listAuditors(conn, cycleId);
  });
}

async function listAuditItems(cycleId, filters) {
  const cycle = await repository.findCycleById(cycleId);
  if (!cycle) {
    throw new AppError('Audit cycle not found', 404);
  }

  return repository.findItemsByCycle(cycleId, filters);
}

async function updateItemVerification(itemId, data) {
  const { verificationStatus, notes, verifiedBy } = data;

  if (!ITEM_VERIFICATION_STATUSES.includes(verificationStatus)) {
    throw new AppError(`Invalid verification status: ${verificationStatus}`, 400);
  }

  return repository.withTransaction(async (conn) => {
    const item = await repository.findItemByIdForUpdate(conn, itemId);
    if (!item) {
      throw new AppError('Audit item not found', 404);
    }

    const cycle = await repository.findCycleByIdForUpdate(conn, item.audit_cycle_id);
    if (cycle.status === 'Closed') {
      throw new AppError('Cannot update items on a closed audit cycle', 409);
    }

    if (verificationStatus !== 'Pending' && !verifiedBy) {
      throw new AppError('verifiedBy is required when setting a non-Pending status', 400);
    }

    const verifiedAt = verificationStatus === 'Pending' ? null : new Date();

    const updatedItem = await repository.updateItemVerification(conn, itemId, {
      verificationStatus,
      notes: notes || null,
      verifiedBy: verifiedBy || null,
      verifiedAt,
    });

    if (DISCREPANCY_ISSUE_TYPES.includes(verificationStatus)) {
      await repository.upsertDiscrepancyReport(conn, {
        auditItemId: itemId,
        issueType: verificationStatus,
        description: notes || null,
      });

      // TODO: if verificationStatus === 'Missing', call assetsService.markAssetLost(item.asset_id)
      // TODO: if verificationStatus === 'Damaged', call assetsService.updateAssetCondition(item.asset_id, 'Damaged')
      // once the Assets service exposes these operations. Not invoked here — see module-level TODO.
    }

    // TODO: call notificationsService.createNotification(...) here once available.

    return updatedItem;
  });
}

async function forceCloseAuditCycle(cycleId) {
  return repository.withTransaction(async (conn) => {
    const cycle = await repository.findCycleByIdForUpdate(conn, cycleId);
    if (!cycle) {
      throw new AppError('Audit cycle not found', 404);
    }

    if (cycle.status === 'Closed') {
      throw new AppError('Audit cycle is already closed', 409);
    }

    // Any items left in a discrepant state (Missing/Damaged) must have a
    // discrepancy report generated even if updateItemVerification was bypassed.
    const discrepantItems = await repository.findItemsByStatusForUpdate(conn, cycleId, [
      'Missing',
      'Damaged',
    ]);

    for (const item of discrepantItems) {
      // eslint-disable-next-line no-await-in-loop
      await repository.upsertDiscrepancyReport(conn, {
        auditItemId: item.id,
        issueType: item.verification_status,
        description: item.notes || null,
      });

      // TODO: Update Lost Assets — call assetsService.markAssetLost(item.asset_id) for
      // Missing items / assetsService.updateAssetCondition(item.asset_id, 'Damaged') for
      // Damaged items once the Assets service exposes these operations.
    }

    const closedCycle = await repository.updateCycleStatus(conn, cycleId, {
      status: 'Closed',
      closedAt: new Date(),
    });

    // TODO: call notificationsService.createNotification(...) for assigned auditors/creator.

    return {
      cycle: closedCycle,
      discrepancyReportsGenerated: discrepantItems.length,
    };
  });
}

async function listDiscrepancyReports(cycleId) {
  const cycle = await repository.findCycleById(cycleId);
  if (!cycle) {
    throw new AppError('Audit cycle not found', 404);
  }

  return repository.findDiscrepancyReportsByCycle(cycleId);
}

module.exports = {
  listAuditCycles,
  getAuditCycleById,
  createAuditCycle,
  populateAuditItems,
  assignAuditors,
  listAuditItems,
  updateItemVerification,
  forceCloseAuditCycle,
  listDiscrepancyReports,
};