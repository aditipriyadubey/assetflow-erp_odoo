/**
 * server/src/modules/assets/validators.js
 * Owner: Developer 2
 *
 * express-validator chains only — no business logic. Controllers never
 * trust raw req.body directly (SDD §28). Field constraints follow
 * server/database/schema.sql (assets table, SDD §13.4).
 */

const { body, param } = require('express-validator');

const ASSET_CONDITIONS = ['New', 'Good', 'Fair', 'Poor', 'Damaged'];

const ASSET_STATUSES = [
  'Available',
  'Allocated',
  'Reserved',
  'Under Maintenance',
  'Lost',
  'Retired',
  'Disposed',
];

/** Reject columns that must never be supplied by the client on create. */
const rejectServerGeneratedOnCreate = [
  body('id').not().exists().withMessage('Asset ID cannot be set by the client.'),
  body('asset_tag').not().exists().withMessage('Asset tag cannot be set by the client.'),
  body('qr_code_value').not().exists().withMessage('QR code value cannot be set by the client.'),
  body('status').not().exists().withMessage('Status cannot be set when creating an asset.'),
  body('created_at').not().exists().withMessage('Created at cannot be set by the client.'),
  body('updated_at').not().exists().withMessage('Updated at cannot be set by the client.'),
];

/** Reject immutable / server-managed columns on update. */
const rejectServerGeneratedOnUpdate = [
  body('id').not().exists().withMessage('Asset ID cannot be set by the client.'),
  body('asset_tag').not().exists().withMessage('Asset tag cannot be changed.'),
  body('qr_code_value').not().exists().withMessage('QR code value cannot be changed.'),
  body('created_at').not().exists().withMessage('Created at cannot be set by the client.'),
  body('updated_at').not().exists().withMessage('Updated at cannot be set by the client.'),
];

const createAssetValidators = [
  ...rejectServerGeneratedOnCreate,
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .bail()
    .isLength({ max: 150 })
    .withMessage('Name must be at most 150 characters.'),
  body('category_id')
    .notEmpty()
    .withMessage('Category is required.')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Category must be a positive integer.'),
  body('serial_number')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Serial number must be at most 100 characters.'),
  body('acquisition_date')
    .optional({ nullable: true })
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('Acquisition date must be a valid date (YYYY-MM-DD).'),
  body('acquisition_cost')
    .optional({ nullable: true })
    .isFloat({ max: 9999999999.99 })
    .withMessage('Acquisition cost must be a number with at most 12 digits and 2 decimal places.'),
  body('condition')
    .optional()
    .isIn(ASSET_CONDITIONS)
    .withMessage('Condition must be one of: New, Good, Fair, Poor, Damaged.'),
  body('location')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage('Location must be at most 150 characters.'),
  body('photo_url')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Photo URL must be at most 255 characters.'),
  body('is_bookable')
    .optional()
    .isBoolean()
    .withMessage('Is bookable must be a boolean.'),
];

const updateAssetValidators = [
  ...rejectServerGeneratedOnUpdate,
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty.')
    .bail()
    .isLength({ max: 150 })
    .withMessage('Name must be at most 150 characters.'),
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category must be a positive integer.'),
  body('serial_number')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Serial number must be at most 100 characters.'),
  body('acquisition_date')
    .optional({ nullable: true })
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('Acquisition date must be a valid date (YYYY-MM-DD).'),
  body('acquisition_cost')
    .optional({ nullable: true })
    .isFloat({ max: 9999999999.99 })
    .withMessage('Acquisition cost must be a number with at most 12 digits and 2 decimal places.'),
  body('condition')
    .optional()
    .isIn(ASSET_CONDITIONS)
    .withMessage('Condition must be one of: New, Good, Fair, Poor, Damaged.'),
  body('location')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage('Location must be at most 150 characters.'),
  body('photo_url')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Photo URL must be at most 255 characters.'),
  body('is_bookable')
    .optional()
    .isBoolean()
    .withMessage('Is bookable must be a boolean.'),
  body('status')
    .optional()
    .isIn(ASSET_STATUSES)
    .withMessage(
      'Status must be one of: Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed.'
    ),
];

const assetIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Asset ID must be a positive integer.'),
];

module.exports = {
  createAssetValidators,
  updateAssetValidators,
  assetIdValidator,
};
