const express = require('express');

const { authenticate } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');
const controller = require('./controller');
const { createTransferValidators, transferIdValidator } = require('./validators');

const router = express.Router();

router.get('/', authenticate, controller.getAllTransfers);
router.post('/', authenticate, createTransferValidators, validate, controller.createTransfer);
router.get('/:id', authenticate, transferIdValidator, validate, controller.getTransferById);
router.patch('/:id/approve', authenticate, transferIdValidator, validate, controller.approveTransfer);
router.patch('/:id/reject', authenticate, transferIdValidator, validate, controller.rejectTransfer);

module.exports = router;
