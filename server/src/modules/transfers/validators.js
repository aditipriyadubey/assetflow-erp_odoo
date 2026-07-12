/**
 * server/src/modules/transfers/validators.js
 * Owner: Developer 2
 *
 * express-validator chains only — no business logic.
 */

const { body, param } = require('express-validator');

const createTransferValidators = [
  body('id').not().exists().withMessage('Transfer ID cannot be set by the client.'),
  body('asset_id')
    .notEmpty()
    .withMessage('Asset is required.')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Asset ID must be a positive integer.'),
  body('from_user_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('From user ID must be a positive integer.'),
  body('to_user_id')
    .notEmpty()
    .withMessage('Destination user is required.')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Destination user ID must be a positive integer.'),
  body('requested_by').not().exists().withMessage('Requested by cannot be set by the client.'),
  body('status').not().exists().withMessage('Status cannot be set when creating a transfer request.'),
  body('approved_by').not().exists().withMessage('Approved by cannot be set by the client.'),
  body('resolved_at').not().exists().withMessage('Resolved at cannot be set by the client.'),
];

const transferIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Transfer ID must be a positive integer.'),
];

module.exports = {
  createTransferValidators,
  transferIdValidator,
};
