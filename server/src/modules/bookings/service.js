/**
 * server/src/modules/bookings/service.js
 * Owner: Developer 4
 *
 * MISSING FILE — this file was 0 bytes in the submitted ZIP, meaning
 * the booking-overlap engine (a headline requirement of the problem
 * statement — "two people can't book the same room at overlapping
 * times") did not exist anywhere in the codebase.
 */

const repository = require('./repository');
const AppError = require('../../utils/AppError');

function assertNotInPast(startTime) {
  if (new Date(startTime) < new Date()) {
    throw new AppError('VALIDATION_ERROR', 'Bookings cannot be made in the past.', 400, {
      start_time: 'Bookings cannot be made in the past.',
    });
  }
}

/** @param {object} filters */
async function getAllBookings(filters) {
  return repository.findAll(filters);
}

/** @param {number} id */
async function getBookingById(id) {
  const booking = await repository.findById(id);
  if (!booking) {
    throw new AppError('NOT_FOUND', 'Booking not found.', 404);
  }
  return booking;
}

/**
 * @param {{asset_id:number, booked_by:number, department_id:number|null, purpose:string|null, start_time:string, end_time:string}} data
 */
async function createBooking(data) {
  assertNotInPast(data.start_time);

  const result = await repository.createIfNoOverlap(data);

  if (result.conflict) {
    throw new AppError(
      'BOOKING_OVERLAP',
      'This resource is already booked for an overlapping time slot. Please choose another slot.',
      409,
      { start_time: 'This resource is already booked for an overlapping time slot.' }
    );
  }

  // TODO once notifications module is consumed here (not implemented
  // yet — see audit report): call notificationsService.createNotification
  // for the booker (Booking Confirmed) instead of writing to that table
  // directly (cross-module rule, Shared Contracts §B).

  return getBookingById(result.id);
}

/** @param {number} id */
async function cancelBooking(id) {
  const booking = await getBookingById(id);
  if (booking.status === 'Cancelled' || booking.status === 'Completed') {
    throw new AppError(
      'VALIDATION_ERROR',
      `Booking cannot be cancelled because it is already ${booking.status}.`,
      409
    );
  }
  await repository.updateStatus(id, 'Cancelled');
  return getBookingById(id);
}

/**
 * Reschedule = cancel + create, re-validated against overlaps (SDD §14.8/§20).
 * @param {number} id
 * @param {{start_time:string, end_time:string}} data
 */
async function rescheduleBooking(id, data) {
  const existing = await getBookingById(id);
  if (existing.status === 'Cancelled' || existing.status === 'Completed') {
    throw new AppError(
      'VALIDATION_ERROR',
      `Booking cannot be rescheduled because it is already ${existing.status}.`,
      409
    );
  }

  assertNotInPast(data.start_time);

  await repository.updateStatus(id, 'Cancelled');

  const result = await repository.createIfNoOverlap({
    asset_id: existing.asset_id,
    booked_by: existing.booked_by,
    department_id: existing.department_id,
    purpose: existing.purpose,
    start_time: data.start_time,
    end_time: data.end_time,
  });

  if (result.conflict) {
    // Roll the original booking back to Upcoming since the reschedule failed.
    await repository.updateStatus(id, existing.status);
    throw new AppError(
      'BOOKING_OVERLAP',
      'The new time slot overlaps with an existing booking. Please choose another slot.',
      409
    );
  }

  return getBookingById(result.id);
}

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  rescheduleBooking,
};
