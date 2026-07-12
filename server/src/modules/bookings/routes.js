const express = require('express');

const router = express.Router();
const controller = require('./controller');

router.get('/', controller.getAllBookings);
router.get('/:id', controller.getBookingById);
router.post('/', controller.createBooking);
router.patch('/:id', controller.updateBooking);
router.delete('/:id', controller.cancelBooking);

module.exports = router;