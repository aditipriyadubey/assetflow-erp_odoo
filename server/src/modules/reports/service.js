/**
 * server/src/modules/reports/service.js
 *
 * Report generation only.
 */

const repository = require('./repository');

async function getInventoryReport() {
  return repository.getAssetInventory();
}

async function getAllocationReport() {
  return repository.getAllocationSummary();
}

async function getTransferReport() {
  return repository.getTransferSummary();
}

async function getMaintenanceReport() {
  return repository.getMaintenanceSummary();
}

async function getAuditReport() {
  return repository.getAuditSummary();
}

module.exports = {
  getInventoryReport,
  getAllocationReport,
  getTransferReport,
  getMaintenanceReport,
  getAuditReport,
};
