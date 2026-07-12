const { body, param } = require('express-validator');

const BOOKING_STATUSES = [
  'Upcoming',
  'Ongoing',
  'Completed',
  'Cancelled',
];

const createBookingValidators = [
  body('asset_id')
    .notEmpty()
    .withMessage('Asset is required.')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Asset ID must be a positive integer.'),

  body('booked_by')
    .notEmpty()
    .withMessage('Booked by is required.')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Booked by must be a positive integer.'),

  body('department_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer.'),

  body('purpose')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Purpose must be at most 255 characters.'),

  body('start_time')
    .notEmpty()
    .withMessage('Start time is required.')
    .bail()
    .isISO8601()
    .withMessage('Start time must be a valid datetime.'),

  body('end_time')
    .notEmpty()
    .withMessage('End time is required.')
    .bail()
    .isISO8601()
    .withMessage('End time must be a valid datetime.')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.start_time)) {
        throw new Error('End time must be after start time.');
      }
      return true;
    }),
];

const updateBookingValidators = [
  body('status')
    .optional()
    .isIn(BOOKING_STATUSES)
    .withMessage(
      'Status must be one of: Upcoming, Ongoing, Completed, Cancelled.'
    ),
];

const bookingIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Booking ID must be a positive integer.'),
];

module.exports = {
  createBookingValidators,
  updateBookingValidators,
  bookingIdValidator,
};