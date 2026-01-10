const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// ================== BOOKING REQUEST ROUTES ==================

// Create booking request or bid (new unified endpoint)
router.post('/create', bookingController.createBookingRequest);

// Create booking request or bid (legacy)
router.post('/requests', bookingController.createBookingRequest);

// Get all booking requests (filtered by area, request_type, status)
router.get('/requests', bookingController.getBookingRequests);

// Get booking request by ID
router.get('/requests/:id', bookingController.getBookingRequestById);

// Update booking status (approve, reject, or schedule visit)
router.put('/requests/:id/status', bookingController.updateBookingStatus);

// Approve booking
router.put('/requests/:id/approve', bookingController.approveBooking);

// Reject booking
router.put('/requests/:id/reject', bookingController.rejectBooking);

// Schedule visit
router.post('/requests/:id/schedule-visit', bookingController.scheduleVisit);

// Delete booking
router.delete('/requests/:id', bookingController.deleteBooking);

// ================== PROPERTY HOLD ROUTES ==================

// Check if property is on hold
router.get('/hold/:property_id', bookingController.checkPropertyHold);

// Release property hold
router.put('/hold/:property_id/release', bookingController.releasePropertyHold);

module.exports = router;
