/**
 * server/src/config/constants.js
 * Owner: Developer 3
 *
 * MISSING FILE. SDD Part 1 §9 folder structure lists `config/constants.js`
 * explicitly, and Shared Contracts §A.3 requires these enums to be
 * "identical in backend constants.js and frontend utils/constants.js" —
 * but no backend constants.js existed anywhere in the ZIP. Individual
 * modules (e.g. bookings/validators.js) had each re-declared their own
 * local copy of a status list instead (e.g. a local BOOKING_STATUSES
 * array), which is exactly the drift this file exists to prevent.
 *
 * Mirrors client/src/utils/constants.js exactly. Do not edit one
 * without the other.
 */

const ASSET_STATUS = [
  'Available',
  'Allocated',
  'Reserved',
  'Under Maintenance',
  'Lost',
  'Retired',
  'Disposed',
];

const ALLOCATION_STATUS = ['Active', 'Returned', 'Overdue'];

const TRANSFER_STATUS = ['Requested', 'Approved', 'Rejected'];

const BOOKING_STATUS = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

const MAINTENANCE_STATUS = [
  'Pending',
  'Approved',
  'Rejected',
  'TechnicianAssigned',
  'InProgress',
  'Resolved',
];

const MAINTENANCE_PRIORITY = ['Low', 'Medium', 'High', 'Critical'];

const AUDIT_STATUS = ['Draft', 'InProgress', 'Closed'];

const AUDIT_ITEM_STATUS = ['Pending', 'Verified', 'Missing', 'Damaged'];

const ROLES = ['Admin', 'AssetManager', 'DepartmentHead', 'Employee'];

const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN_ROLE: 'FORBIDDEN_ROLE',
  NOT_FOUND: 'NOT_FOUND',
  ASSET_ALREADY_ALLOCATED: 'ASSET_ALREADY_ALLOCATED',
  ASSET_NOT_AVAILABLE_FOR_TRANSFER: 'ASSET_NOT_AVAILABLE_FOR_TRANSFER',
  BOOKING_OVERLAP: 'BOOKING_OVERLAP',
  BOOKING_PAST_TIME: 'BOOKING_PAST_TIME',
  AUDIT_CYCLE_CLOSED: 'AUDIT_CYCLE_CLOSED',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  SERVER_ERROR: 'SERVER_ERROR',
};

module.exports = {
  ASSET_STATUS,
  ALLOCATION_STATUS,
  TRANSFER_STATUS,
  BOOKING_STATUS,
  MAINTENANCE_STATUS,
  MAINTENANCE_PRIORITY,
  AUDIT_STATUS,
  AUDIT_ITEM_STATUS,
  ROLES,
  ERROR_CODES,
};
