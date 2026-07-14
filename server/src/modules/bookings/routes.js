/**
 * server/src/modules/bookings/routes.js
 * Owner: Developer 4
 *
 * REPLACES the original, which had no auth/RBAC middleware at all
 * (any unauthenticated request could hit any booking route) and used
 * `PATCH /:id` + `DELETE /:id` instead of the exact routes SDD §14.8
 * specifies: `PATCH /:id/cancel` and `PATCH /:id/reschedule`.
 */

const express = require('express');

const { authenticate } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');
const controller = require('./controller');
const {
  createBookingValidators,
  bookingIdValidator,
} = require('./validators');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.getAllBookings);
router.get('/:id', bookingIdValidator, validate, controller.getBookingById);
router.post('/', createBookingValidators, validate, controller.createBooking);
router.patch('/:id/cancel', bookingIdValidator, validate, controller.cancelBooking);
router.patch('/:id/reschedule', bookingIdValidator, validate, controller.rescheduleBooking);

module.exports = router;
