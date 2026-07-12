/**
 * server/src/modules/bookings/controller.js
 * Owner: Developer 4
 *
 * Thin HTTP layer only: parses the request, delegates to service.js,
 * and shapes the success response envelope.
 */

const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/responseEnvelope');
const service = require('./service');
/** GET /bookings */
const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await service.getAllBookings();
  return sendSuccess(res, 200, bookings);
});
/** GET /bookings */
const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await service.getAllBookings();
  return sendSuccess(res, 200, bookings);
});
/** POST /bookings */
const createBooking = asyncHandler(async (req, res) => {
  const booking = await service.createBooking(req.body);
  return sendSuccess(res, 201, booking);
});
const updateBooking = asyncHandler(async (req, res) => {
  const booking = await service.updateBooking(Number(req.params.id), req.body);
  return sendSuccess(res, 200, booking);
});

const cancelBooking = asyncHandler(async (req, res) => {
  await service.cancelBooking(Number(req.params.id));
  return sendSuccess(res, 200, {});
});

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
};
module.exports = {
  getAllBookings: async () => [],
  getBookingById: async (id) => ({ id }),
  createBooking: async (data) => data,
  updateBooking: async (id, data) => ({ id, ...data }),
  cancelBooking: async () => true,
};