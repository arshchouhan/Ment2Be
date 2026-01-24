import express from 'express';
import {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  addSessionReview,
  getBookingStats,
  getMentorBookings,
  deleteBooking,
  joinSession,
  updateMeetingStatus,
  getCompletedSessionsByDate,
  getMentorStats
} from '../controllers/booking.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { 
  createBookingSchema, 
  updateBookingStatusSchema, 
  addSessionReviewSchema,
  updateMeetingStatusSchema 
} from '../utils/zodSchemas.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private (Students only)
router.post('/', validateRequest(createBookingSchema), createBooking);

// @route   GET /api/bookings
// @desc    Get all bookings for the authenticated user
// @access  Private
// @query   ?status=pending&type=upcoming&page=1&limit=10
router.get('/', getUserBookings);

// @route   GET /api/bookings/mentor
// @desc    Get all bookings where the authenticated user is the mentor
// @access  Private (Mentors only)
router.get('/mentor', getMentorBookings);

// @route   GET /api/bookings/stats
// @desc    Get booking statistics for the authenticated user
// @access  Private
router.get('/stats', getBookingStats);

// @route   GET /api/bookings/completed-by-date
// @desc    Get completed sessions grouped by date for contribution graph
// @access  Private (Mentors only)
// @query   ?year=2025
router.get('/completed-by-date', getCompletedSessionsByDate);

// @route   GET /api/bookings/mentor/stats
// @desc    Get mentor statistics including actual mentoring time
// @access  Private (Mentors)
// @query   ?mentorId=optional (if not provided, uses authenticated user)
router.get('/mentor/stats', getMentorStats);

// @route   GET /api/bookings/:bookingId
// @desc    Get a specific booking by ID
// @access  Private (Student or Mentor involved in the booking)
router.get('/:bookingId', getBookingById);

// @route   PUT /api/bookings/:bookingId/status
// @desc    Update booking status (confirm, cancel, complete, etc.)
// @access  Private (Student or Mentor involved in the booking)
router.put('/:bookingId/status', validateRequest(updateBookingStatusSchema), updateBookingStatus);

// @route   PUT /api/bookings/:bookingId/confirm
// @desc    Confirm a pending booking (Mentors only)
// @access  Private (Mentors only)
router.put('/:bookingId/confirm', (req, res) => {
  req.body.status = 'confirmed';
  updateBookingStatus(req, res);
});

// @route   PUT /api/bookings/:bookingId/reject
// @desc    Reject a pending booking (Mentors only)
// @access  Private (Mentors only)
router.put('/:bookingId/reject', (req, res) => {
  req.body.status = 'cancelled';
  req.body.reason = 'Rejected by mentor';
  updateBookingStatus(req, res);
});

// @route   PUT /api/bookings/:bookingId/cancel
// @desc    Cancel a confirmed booking
// @access  Private (Student or Mentor involved in the booking)
router.put('/:bookingId/cancel', (req, res) => {
  req.body.status = 'cancelled';
  req.body.reason = req.body.reason || 'Cancelled by user';
  updateBookingStatus(req, res);
});

// @route   POST /api/bookings/:bookingId/review
// @desc    Add rating and review to a completed session
// @access  Private (Student or Mentor involved in the booking)
router.post('/:bookingId/review', validateRequest(addSessionReviewSchema), addSessionReview);

// @route   DELETE /api/bookings/:bookingId
// @desc    Delete a booking (only pending bookings by the student)
// @access  Private (Student who created the booking)
router.delete('/:bookingId', deleteBooking);

// @route   POST /api/bookings/:sessionId/join
// @desc    Join a session and get room details
// @access  Private (Student or Mentor involved in the session)
router.post('/:sessionId/join', joinSession);

// @route   PUT /api/bookings/:sessionId/meeting-status
// @desc    Update meeting status (waiting, active, ended)
// @access  Private (Student or Mentor involved in the session)
router.put('/:sessionId/meeting-status', validateRequest(updateMeetingStatusSchema), updateMeetingStatus);

// @route   PUT /api/bookings/:bookingId/expire
// @desc    Mark a session as expired when time has passed
// @access  Private (Student or Mentor involved in the booking)
router.put('/:bookingId/expire', (req, res) => {
  req.body.status = 'expired';
  updateBookingStatus(req, res);
});

export default router;
