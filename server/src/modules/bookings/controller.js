/**
 * server/src/modules/bookings/controller.js
 * Owner: Developer 4
 *
 * REPLACES a corrupted file: the original had `getAllBookings`
 * declared twice (a `SyntaxError: Identifier 'getAllBookings' has
 * already been declared`), referenced an undefined `getBookingById`,
 * and had a second, conflicting `module.exports` block containing
 * stub service-layer code pasted in by mistake. The file could not
 * have been `require()`-d successfully in its original state.
 *
 * Thin HTTP layer only: parses the request, delegates to service.js,
 * shapes the response envelope. `booked_by` is taken from the
 * authenticated user (req.user.id), never trusted from the request
 * body (SDD §31 — never trust client-provided identity fields).
 */

const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/responseEnvelope');
const service = require('./service');

/** GET /bookings */
const getAllBookings = asyncHandler(async (req, res) => {
  const { asset_id, from, to, status } = req.query;
  const bookings = await service.getAllBookings({ asset_id, from, to, status });
  return sendSuccess(res, 200, bookings);
});

/** GET /bookings/:id */
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await service.getBookingById(Number(req.params.id));
  return sendSuccess(res, 200, booking);
});

/** POST /bookings */
const createBooking = asyncHandler(async (req, res) => {
  const booking = await service.createBooking({
    asset_id: req.body.asset_id,
    booked_by: req.user.id,
    department_id: req.body.department_id ?? null,
    purpose: req.body.purpose ?? null,
    start_time: req.body.start_time,
    end_time: req.body.end_time,
  });
  return sendSuccess(res, 201, booking);
});

/** PATCH /bookings/:id/cancel */
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await service.cancelBooking(Number(req.params.id));
  return sendSuccess(res, 200, booking);
});

/** PATCH /bookings/:id/reschedule */
const rescheduleBooking = asyncHandler(async (req, res) => {
  const booking = await service.rescheduleBooking(Number(req.params.id), {
    start_time: req.body.start_time,
    end_time: req.body.end_time,
  });
  return sendSuccess(res, 200, booking);
});

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  rescheduleBooking,
};
