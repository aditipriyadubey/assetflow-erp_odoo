/**
 * server/src/modules/notifications/routes.js
 * Owner: Developer 3
 *
 * Mounted at /api/v1/notifications (SDD §14.13). Every route requires
 * authentication; both routes are implicitly self-scoped in the
 * service layer — there is no admin "view all" endpoint here.
 */

const express = require('express');

const { authenticate } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');
const controller = require('./controller');
const { idParamValidator, listNotificationsValidators } = require('./validators');

const router = express.Router();

router.use(authenticate);

router.get('/', listNotificationsValidators, validate, controller.listNotifications);
router.patch('/:id/read', idParamValidator, validate, controller.markAsRead);

module.exports = router;