// Defines HTTP routes for the audits module and maps them to controller handlers.

const express = require('express');
const controller = require('./controller');
const validators = require('./validators');

const router = express.Router();

router.get('/', validators.listAuditCycles, controller.getAllAuditCycles);

router.get('/:id', validators.idParam, controller.getAuditCycleById);

router.post('/', validators.createAuditCycle, controller.createAuditCycle);

router.post('/:id/populate-items', validators.idParam, controller.populateAuditItems);

router.post('/:id/auditors', validators.assignAuditors, controller.assignAuditors);

router.get('/:id/items', validators.listAuditItems, controller.getAuditItems);

router.patch('/items/:itemId', validators.updateItemVerification, controller.updateItemVerification);

router.post('/:id/force-close', validators.idParam, controller.forceCloseAuditCycle);

router.get('/:id/discrepancy-reports', validators.idParam, controller.getDiscrepancyReports);

module.exports = router;