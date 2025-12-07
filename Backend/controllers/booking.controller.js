import Booking from '../models/booking.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const {
      mentorId,
      sessionTitle,
      sessionDescription,
      sessionType,
      sessionDate,
      sessionTime,
      duration,
      timezone,
      topics,
      skills,
      studentNotes,
      isRecurring,
      recurringPattern
    } = req.body;

    const studentId = req.user.id;

    // Validate mentor exists
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    // Check if mentor is trying to book with themselves
    if (studentId === mentorId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book a session with yourself'
      });
    }

    // Validate session date is in the future
    const sessionDateTime = new Date(sessionDate);
    if (sessionDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Session date must be in the future'
      });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      mentor: mentorId,
      sessionDate: sessionDateTime,
      sessionTime: sessionTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Calculate price (for now, using mentor's hourly rate or free)
    const price = mentor.hourlyRate || 0;

    // Generate unique room ID for the session
    const roomId = `session_${uuidv4()}`;

    // Create booking data
    const bookingData = {
      student: studentId,
      mentor: mentorId,
      sessionTitle: sessionTitle || `Mentoring Session with ${mentor.name}`,
      sessionDescription,
      sessionType: sessionType || 'one-on-one',
      sessionDate: sessionDateTime,
      sessionTime,
      duration: duration || 60,
      timezone: timezone || 'Asia/Kolkata',
      topics: topics || [],
      skills: skills || [],
      studentNotes,
      price,
      currency: 'USD',
      paymentStatus: price > 0 ? 'pending' : 'paid',
      isRecurring: isRecurring || false,
      recurringPattern: isRecurring ? recurringPattern : undefined,
      bookingSource: 'web',
      roomId: roomId,
      meetingStatus: 'not_started'
    };

    const booking = new Booking(bookingData);
    await booking.save();

    // Populate the booking with user details
    await booking.populate([
      { path: 'student', select: 'name email profilePicture' },
      { path: 'mentor', select: 'name email profilePicture' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all bookings for a user (student or mentor)
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, type = 'all', page = 1, limit = 10 } = req.query;

    // Build query based on user role and filters
    let query = {};
    
    if (type === 'upcoming') {
      query = {
        $or: [{ student: userId }, { mentor: userId }],
        sessionDate: { $gte: new Date() },
        status: { $in: ['pending', 'confirmed'] }
      };
    } else if (type === 'past') {
      query = {
        $or: [{ student: userId }, { mentor: userId }],
        status: { $in: ['completed', 'cancelled', 'no-show'] }
      };
    } else {
      query = {
        $or: [{ student: userId }, { mentor: userId }]
      };
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .populate('student', 'name email profilePicture')
      .populate('mentor', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    console.log(`📚 getUserBookings - UserID: ${userId}, Found ${bookings.length} bookings`);
    bookings.forEach(booking => {
      console.log(`  📖 Booking ID: ${booking._id}, Student: ${booking.student?._id}, Mentor: ${booking.mentor?._id}, RoomID: ${booking.roomId || 'No room ID'}`);
    });

    res.status(200).json({
      success: true,
      bookings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: bookings.length,
        totalBookings: total
      }
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get a specific booking by ID
const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate('student', 'name email profilePicture')
      .populate('mentor', 'name email profilePicture');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to view this booking
    if (booking.student._id.toString() !== userId && booking.mentor._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update booking status (confirm, cancel, etc.)
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, reason, meetingLink } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const isStudent = booking.student.toString() === userId;
    const isMentor = booking.mentor.toString() === userId;
    
    if (!isStudent && !isMentor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Validate status transitions
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no-show', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Business logic for status updates
    if (status === 'confirmed' && !isMentor) {
      return res.status(403).json({
        success: false,
        message: 'Only mentors can confirm bookings'
      });
    }

    if (status === 'cancelled') {
      booking.cancellationReason = reason;
      booking.cancelledBy = userId;
      booking.cancellationDate = new Date();
    }

    if (status === 'confirmed' && meetingLink) {
      booking.meetingLink = meetingLink;
    }

    if (status === 'completed') {
      booking.sessionCompleted = true;
      booking.sessionEndTime = new Date();
    }

    booking.status = status;
    await booking.save();

    await booking.populate([
      { path: 'student', select: 'name email profilePicture' },
      { path: 'mentor', select: 'name email profilePicture' }
    ]);

    // Log the status change for notification purposes
    console.log(`Booking ${bookingId} status changed to ${status} by user ${userId}`);
    
    // TODO: Add email/push notification to the other party
    if (status === 'confirmed') {
      console.log(`Notification: Session confirmed by mentor ${booking.mentor.name} for student ${booking.student.name}`);
      // Future: Send email to student about confirmation
    } else if (status === 'cancelled') {
      const cancelledBy = isMentor ? 'mentor' : 'student';
      console.log(`Notification: Session cancelled by ${cancelledBy} ${isMentor ? booking.mentor.name : booking.student.name}`);
      // Future: Send email to the other party about cancellation
    }

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add rating and review to a completed session
const addSessionReview = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if session is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed sessions'
      });
    }

    // Determine if user is student or mentor
    const isStudent = booking.student.toString() === userId;
    const isMentor = booking.mentor.toString() === userId;

    if (!isStudent && !isMentor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this booking'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Add review
    if (isStudent) {
      booking.sessionRating.student = { rating, review };
    } else {
      booking.sessionRating.mentor = { rating, review };
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Review added successfully',
      booking
    });

  } catch (error) {
    console.error('Add session review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get booking statistics for a user
const getBookingStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const matchStage = userRole === 'mentor' 
      ? { mentor: new mongoose.Types.ObjectId(userId) }
      : { student: new mongoose.Types.ObjectId(userId) };

    const stats = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          upcomingSessions: {
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $in: ['$status', ['pending', 'confirmed']] },
                    { $gte: ['$sessionDate', new Date()] }
                  ]
                }, 
                1, 
                0
              ]
            }
          },
          totalHours: {
            $sum: { 
              $cond: [
                { $eq: ['$status', 'completed'] },
                { $divide: ['$duration', 60] },
                0
              ]
            }
          },
          averageRating: {
            $avg: userRole === 'mentor' 
              ? '$sessionRating.mentor.rating'
              : '$sessionRating.student.rating'
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalBookings: 0,
      completedSessions: 0,
      cancelledSessions: 0,
      upcomingSessions: 0,
      totalHours: 0,
      averageRating: 0
    };

    res.json({
      success: true,
      stats: result
    });

  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get mentor bookings (bookings where current user is the mentor)
const getMentorBookings = async (req, res) => {
  try {
    const mentorId = req.user.id;

    // Find all bookings where current user is the mentor
    const bookings = await Booking.find({ mentor: mentorId })
      .populate('student', 'name email profilePicture')
      .populate('mentor', 'name email profilePicture')
      .sort({ createdAt: -1 });

    console.log(`👨‍🏫 getMentorBookings - MentorID: ${mentorId}, Found ${bookings.length} bookings`);
    bookings.forEach(booking => {
      console.log(`  📖 Booking ID: ${booking._id}, Student: ${booking.student?._id}, Mentor: ${booking.mentor?._id}, RoomID: ${booking.roomId || 'No room ID'}`);
    });

    res.status(200).json({
      success: true,
      bookings,
      count: bookings.length
    });

  } catch (error) {
    console.error('Get mentor bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching mentor bookings'
    });
  }
};

// Delete a booking (only if pending and by the student who created it)
const deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only student who created the booking can delete it
    if (booking.student.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this booking'
      });
    }

    // Can only delete pending bookings
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only delete pending bookings'
      });
    }

    await Booking.findByIdAndDelete(bookingId);

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });

  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Join a session - Get room ID and validate access
const joinSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    console.log(`🔍 Join session request - SessionID: ${sessionId}, UserID: ${userId}`);

    // Find the booking/session
    const booking = await Booking.findById(sessionId)
      .populate('student', 'name email profilePicture')
      .populate('mentor', 'name email profilePicture');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is authorized to join (must be either mentor or student)
    const isAuthorized = booking.student._id.toString() === userId || 
                        booking.mentor._id.toString() === userId;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to join this session'
      });
    }

    // Allow joining sessions regardless of status (removed confirmation check)

    // Temporarily removed time restrictions for testing - users can join anytime

    // Generate room ID if it doesn't exist (for existing bookings)
    if (!booking.roomId) {
      booking.roomId = `session_${uuidv4()}`;
      console.log(`🆕 Generated new room ID: ${booking.roomId} for session: ${sessionId}`);
    } else {
      console.log(`♻️ Using existing room ID: ${booking.roomId} for session: ${sessionId}`);
    }

    // Update meeting status if this is the first person joining
    if (booking.meetingStatus === 'not_started') {
      booking.meetingStatus = 'waiting';
    }
    
    // Save any updates (roomId and/or meetingStatus)
    await booking.save();

    console.log(`✅ User ${userId} joining room: ${booking.roomId}`);

    // Return room details
    res.status(200).json({
      success: true,
      data: {
        roomId: booking.roomId,
        sessionId: booking._id,
        sessionTitle: booking.sessionTitle,
        mentor: booking.mentor,
        student: booking.student,
        duration: booking.duration,
        meetingStatus: booking.meetingStatus,
        userRole: booking.student._id.toString() === userId ? 'student' : 'mentor'
      }
    });

  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join session'
    });
  }
};

// Update meeting status
const updateMeetingStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findById(sessionId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check authorization
    const isAuthorized = booking.student.toString() === userId || 
                        booking.mentor.toString() === userId;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Update meeting status
    booking.meetingStatus = status;
    
    // If session is ending, update session times
    if (status === 'ended') {
      booking.sessionEndTime = new Date();
      if (booking.sessionStartTime) {
        booking.actualDuration = Math.round((booking.sessionEndTime - booking.sessionStartTime) / (1000 * 60));
      }
    } else if (status === 'active' && !booking.sessionStartTime) {
      booking.sessionStartTime = new Date();
    }

    await booking.save();

    res.status(200).json({
      success: true,
      data: {
        meetingStatus: booking.meetingStatus,
        sessionStartTime: booking.sessionStartTime,
        sessionEndTime: booking.sessionEndTime,
        actualDuration: booking.actualDuration
      }
    });

  } catch (error) {
    console.error('Update meeting status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update meeting status'
    });
  }
};

export {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  addSessionReview,
  getBookingStats,
  getMentorBookings,
  deleteBooking,
  joinSession,
  updateMeetingStatus
};
