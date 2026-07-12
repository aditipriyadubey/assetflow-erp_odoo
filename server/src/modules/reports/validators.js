/**
 * server/src/modules/reports/validators.js
 *
 * express-validator chains only — no business logic (SDD §26).
 */

const { query } = require('express-validator');

const dateRangeValidators = [
  query('start_date')
    .optional()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('Start date must be a valid date (YYYY-MM-DD).'),
  query('end_date')
    .optional()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('End date must be a valid date (YYYY-MM-DD).'),
];

const utilizationValidators = [...dateRangeValidators];

const maintenanceFrequencyValidators = [...dateRangeValidators];

const dueForMaintenanceValidators = [];

const departmentAllocationValidators = [];

const bookingHeatmapValidators = [...dateRangeValidators];

const exportValidators = [
  query('type')
    .notEmpty()
    .withMessage('Export type is required.')
    .bail()
    .equals('csv')
    .withMessage('Only CSV export is supported.'),
];

module.exports = {
  utilizationValidators,
  maintenanceFrequencyValidators,
  dueForMaintenanceValidators,
  departmentAllocationValidators,
  bookingHeatmapValidators,
  exportValidators,
};
