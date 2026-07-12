// Defines HTTP routes for the maintenance module and maps them to controller handlers.

const express = require('express');
const controller = require('./controller');
const validators = require('./validators');

const router = express.Router();

router.get('/', validators.listMaintenanceRequests, controller.getAllMaintenanceRequests);

router.get('/:id', validators.idParam, controller.getMaintenanceRequestById);

router.post('/', validators.createMaintenanceRequest, controller.createMaintenanceRequest);

router.patch('/:id', validators.updateMaintenanceStatus, controller.updateMaintenanceStatus);

router.delete('/:id', validators.idParam, controller.closeMaintenanceRequest);

module.exports = router;