import Booking from '../models/booking.model.js';
import User from '../models/user.model.js';
import Connection from '../models/connection.model.js';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { getMentorRatingsMap } from '../services/mentorRatingService.js';
import { checkAchievements } from './achievement.controller.js';

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

    // Automatically connect student with mentor when booking is created
    try {
      const existingConnection = await Connection.findOne({
        student: studentId,
        mentor: mentorId
      });

      if (!existingConnection) {
        const connection = new Connection({
          student: studentId,
          mentor: mentorId,
          status: 'connected',
          connectedAt: new Date()
        });
        await connection.save();
        console.log(`✅ [createBooking] Auto-connected student ${studentId} with mentor ${mentorId}`);

        // Increment mentor's connection count
        await User.findByIdAndUpdate(
          mentorId,
          { $inc: { connectionsCount: 1 } },
          { new: true }
        );
      }
    } catch (connError) {
      console.error('⚠️ [createBooking] Error creating connection:', connError);
      // Don't fail the booking if connection creation fails
    }

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
      .populate('mentor', 'name email profilePicture headline company averageRating totalReviews')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const mentorIds = bookings
      .map((b) => b.mentor?._id)
      .filter(Boolean);

    console.log(`📚 getUserBookings - Mentor IDs to fetch ratings for:`, mentorIds.map(id => String(id)));

    const ratingsByMentorId = await getMentorRatingsMap(mentorIds);

    console.log(`📚 getUserBookings - Ratings map returned:`, Array.from(ratingsByMentorId.entries()));

    // Batch fetch mentor profile pictures to avoid N+1 query problem
    const MentorProfile = (await import('../models/mentorProfile.model.js')).default;

    // Get all mentor IDs that need profile pictures
    const mentorsNeedingPictures = bookings
      .filter(booking => booking.mentor && (!booking.mentor.profilePicture || booking.mentor.profilePicture === ''))
      .map(booking => booking.mentor._id);

    // Batch fetch all mentor profiles at once
    const mentorProfiles = mentorsNeedingPictures.length > 0
      ? await MentorProfile.find({
        user: { $in: mentorsNeedingPictures }
      }).select('user profilePicture')
      : [];

    // Create a map for quick lookup
    const profilePictureMap = new Map(
      mentorProfiles.map(profile => [profile.user.toString(), profile.profilePicture])
    );

    console.log(`📚 Batch fetched ${mentorProfiles.length} mentor profiles to avoid N+1 queries`);

    // Enrich bookings with ratings and profile pictures
    const bookingsWithRatings = bookings.map(booking => {
      const obj = booking.toObject({ virtuals: true });
      const mentorId = obj.mentor?._id ? String(obj.mentor._id) : null;
      const mentorRating = mentorId ? ratingsByMentorId.get(mentorId) : null;

      if (obj.mentor) {
        obj.mentor.averageRating = mentorRating?.averageRating ?? 0;
        obj.mentor.totalReviews = mentorRating?.totalReviews ?? 0;

        // Use batch-fetched profile picture if available
        if (!obj.mentor.profilePicture || obj.mentor.profilePicture === '') {
          const profilePicture = profilePictureMap.get(mentorId);
          if (profilePicture) {
            obj.mentor.profilePicture = profilePicture;
          }
        }
      }
      return obj;
    });

    const total = await Booking.countDocuments(query);

    console.log(`📚 getUserBookings - UserID: ${userId}, Found ${bookings.length} bookings`);
    bookings.forEach(booking => {
      console.log(`  📖 Booking ID: ${booking._id}, Student: ${booking.student?._id}, Mentor: ${booking.mentor?._id}, RoomID: ${booking.roomId || 'No room ID'}`);
    });

    // Debug: Log first booking with ratings
    if (bookingsWithRatings.length > 0) {
      console.log(`📚 Sample enriched booking mentor:`, {
        name: bookingsWithRatings[0].mentor?.name,
        averageRating: bookingsWithRatings[0].mentor?.averageRating,
        totalReviews: bookingsWithRatings[0].mentor?.totalReviews
      });
    }

    res.status(200).json({
      success: true,
      bookings: bookingsWithRatings,
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

      // Track actual session duration if provided
      if (req.body.actualDuration !== undefined) {
        booking.actualDuration = req.body.actualDuration;
      }
      if (req.body.sessionStartedAt) {
        booking.sessionStartedAt = new Date(req.body.sessionStartedAt);
      }
      if (req.body.sessionEndedAt) {
        booking.sessionEndedAt = new Date(req.body.sessionEndedAt);
      }
    }

    booking.status = status;
    await booking.save();

    // TRIGGER ACHIEVEMENT CHECK
    if (status === 'completed') {
      await checkAchievements(booking.student);
      await checkAchievements(booking.mentor);
    }

    await booking.populate([
      { path: 'student', select: 'name email profilePicture' },
      { path: 'mentor', select: 'name email profilePicture' }
    ]);

    // Send notifications based on status change
    const io = getIO();

    if (status === 'confirmed') {
      // Create notification for student
      const studentNotification = await Notification.create({
        recipient: booking.student._id,
        sender: booking.mentor._id,
        type: 'booking_confirmed',
        title: 'Booking Confirmed',
        message: `Your session "${booking.sessionTitle}" with ${booking.mentor.name} has been confirmed.`,
        data: { bookingId: booking._id },
        priority: 'high'
      });

      // Send real-time notification via Socket.IO
      if (io) {
        io.to(`user_${booking.student._id}`).emit('notification', studentNotification);
      }

      // Send email notification
      try {
        await sendBookingConfirmationEmail(
          booking.student.email,
          booking.student.name,
          booking.mentor.name,
          booking.sessionTitle,
          booking.sessionDate,
          booking.sessionTime
        );
        studentNotification.isEmailSent = true;
        await studentNotification.save();
      } catch (emailError) {
        console.error('Failed to send booking confirmation email:', emailError);
      }

      console.log(`✅ Notification sent: Session confirmed by mentor ${booking.mentor.name} for student ${booking.student.name}`);
    } else if (status === 'cancelled') {
      const cancelledBy = isMentor ? booking.mentor : booking.student;
      const recipient = isMentor ? booking.student : booking.mentor;

      // Create notification for the other party
      const cancellationNotification = await Notification.create({
        recipient: recipient._id,
        sender: cancelledBy._id,
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: `Your session "${booking.sessionTitle}" has been cancelled by ${cancelledBy.name}.`,
        data: { bookingId: booking._id },
        priority: 'high'
      });

      // Send real-time notification via Socket.IO
      if (io) {
        io.to(`user_${recipient._id}`).emit('notification', cancellationNotification);
      }

      // Send email notification
      try {
        await sendBookingCancellationEmail(
          recipient.email,
          recipient.name,
          booking.sessionTitle,
          isMentor ? booking.mentor.name : booking.student.name,
          booking.cancellationReason
        );
        cancellationNotification.isEmailSent = true;
        await cancellationNotification.save();
      } catch (emailError) {
        console.error('Failed to send booking cancellation email:', emailError);
      }

      console.log(`✅ Notification sent: Session cancelled by ${cancelledBy.name}`);
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
    let bookings = await Booking.find({ mentor: mentorId })
      .populate('student', 'name email profilePicture')
      .populate('mentor', 'name email profilePicture')
      .sort({ createdAt: -1 });

    // Batch update expired sessions to avoid multiple individual saves
    const now = new Date();
    const expiredResult = await Booking.updateMany(
      {
        mentor: mentorId,
        sessionDate: { $lt: now },
        status: { $in: ['pending', 'confirmed'] }
      },
      { status: 'expired' }
    );

    if (expiredResult.modifiedCount > 0) {
      console.log(`⏰ Batch updated ${expiredResult.modifiedCount} expired sessions`);
    }

    // Fetch updated bookings after marking expired ones
    bookings = await Booking.find({ mentor: mentorId })
      .populate('student', 'name email profilePicture')
      .populate('mentor', 'name email profilePicture')
      .sort({ createdAt: -1 });

    console.log(`👨‍🏫 getMentorBookings - MentorID: ${mentorId}, Found ${bookings.length} bookings`);
    bookings.forEach(booking => {
      console.log(`  📖 Booking ID: ${booking._id}, Student: ${booking.student?._id}, Mentor: ${booking.mentor?._id}, Status: ${booking.status}, RoomID: ${booking.roomId || 'No room ID'}`);
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

// Get completed sessions grouped by date for contribution graph
const getCompletedSessionsByDate = async (req, res) => {
  try {
    // Accept mentorId from query params, fallback to authenticated user
    const { mentorId: queryMentorId, year } = req.query;
    const mentorId = queryMentorId || req.user.id;
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    console.log('🔍 [getCompletedSessionsByDate] Starting...');
    console.log('👤 [getCompletedSessionsByDate] Mentor ID:', mentorId);
    console.log('📅 [getCompletedSessionsByDate] Selected year:', selectedYear);

    // Get all completed sessions for the mentor in the selected year
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31, 23, 59, 59);

    console.log('📆 [getCompletedSessionsByDate] Date range:', startDate, 'to', endDate);

    // First, let's check ALL bookings for this mentor to debug
    const allBookings = await Booking.find({ mentor: mentorId }).select('status sessionDate');
    console.log('🔎 [getCompletedSessionsByDate] ALL bookings for mentor:', allBookings.length);
    console.log('📋 [getCompletedSessionsByDate] All booking statuses:', allBookings.map(b => ({ status: b.status, date: b.sessionDate })));

    // Auto-mark past sessions as completed if they have sessionStartTime and sessionEndTime
    const now = new Date();
    const pastPendingSessions = await Booking.find({
      mentor: mentorId,
      status: { $in: ['pending', 'confirmed'] },
      sessionDate: { $lt: now },
      sessionStartTime: { $exists: true },
      sessionEndTime: { $exists: true }
    });

    console.log('⏰ [getCompletedSessionsByDate] Past sessions with start/end times:', pastPendingSessions.length);

    // Mark them as completed
    for (let session of pastPendingSessions) {
      session.status = 'completed';
      session.sessionCompleted = true;
      await session.save();
      console.log('✔️ [getCompletedSessionsByDate] Marked session as completed:', session._id);
    }

    // Now fetch completed sessions
    const completedSessions = await Booking.find({
      mentor: mentorId,
      status: 'completed',
      sessionDate: {
        $gte: startDate,
        $lte: endDate
      }
    }).select('sessionDate sessionEndTime duration');

    console.log('📊 [getCompletedSessionsByDate] Found COMPLETED sessions in year range:', completedSessions.length);
    console.log('📋 [getCompletedSessionsByDate] Sessions data:', completedSessions);

    // Group sessions by date
    const sessionsByDate = {};
    completedSessions.forEach(session => {
      const dateKey = new Date(session.sessionDate).toISOString().split('T')[0];
      if (!sessionsByDate[dateKey]) {
        sessionsByDate[dateKey] = {
          date: dateKey,
          count: 0,
          totalDuration: 0,
          sessions: []
        };
      }
      sessionsByDate[dateKey].count += 1;
      sessionsByDate[dateKey].totalDuration += session.duration || 0;
      sessionsByDate[dateKey].sessions.push({
        _id: session._id,
        sessionDate: session.sessionDate,
        duration: session.duration
      });
    });

    console.log('✅ [getCompletedSessionsByDate] Grouped sessions:', sessionsByDate);

    res.status(200).json({
      success: true,
      data: {
        year: selectedYear,
        totalCompletedSessions: completedSessions.length,
        sessionsByDate: sessionsByDate,
        dates: Object.values(sessionsByDate)
      }
    });

  } catch (error) {
    console.error('❌ [getCompletedSessionsByDate] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch completed sessions',
      error: error.message
    });
  }
};

// Get mentor statistics including actual mentoring time
const getMentorStats = async (req, res) => {
  try {
    const { mentorId } = req.query;

    // If mentorId is provided in query, use it. Otherwise use authenticated user's ID
    const targetMentorId = mentorId || req.user.id;

    console.log('📊 [getMentorStats] Fetching stats for mentor:', targetMentorId, 'Query mentorId:', mentorId, 'Auth user:', req.user.id);

    // Validate that targetMentorId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(targetMentorId)) {
      console.log('⚠️ [getMentorStats] Invalid mentor ID format:', targetMentorId);
      return res.status(200).json({
        success: true,
        data: {
          sessionsCompleted: 0,
          totalMentoringTime: '0 mins',
          karmaPoints: 0
        }
      });
    }

    // Get mentor user data including karma points
    const mentorUser = await User.findById(targetMentorId).select('karmaPoints');
    const karmaPoints = mentorUser?.karmaPoints || 0;
    console.log('🏆 [getMentorStats] Karma points:', karmaPoints);

    // Get all completed sessions for this mentor
    const completedSessions = await Booking.find({
      mentor: targetMentorId,
      status: 'completed'
    }).select('sessionStartTime sessionEndTime actualDuration duration sessionDate');

    console.log('✅ [getMentorStats] Found completed sessions:', completedSessions.length);

    // Calculate actual mentoring time
    let totalMinutes = 0;
    const sessionDetails = [];

    completedSessions.forEach(session => {
      let durationMinutes = 0;
      let isValidSession = false;

      // Only count sessions with actual start/end times (new sessions tracked properly)
      // Ignore old sessions that were just marked completed without proper time tracking
      if (session.sessionStartTime && session.sessionEndTime) {
        const startTime = new Date(session.sessionStartTime);
        const endTime = new Date(session.sessionEndTime);
        const durationMs = endTime - startTime;
        durationMinutes = Math.floor(durationMs / (1000 * 60));
        isValidSession = true;
        console.log(`✅ [getMentorStats] Session ${session._id}: Actual time tracked=${durationMinutes}m`);
      } else {
        // Skip sessions without proper time tracking (old sessions)
        console.log(`⏭️ [getMentorStats] Session ${session._id}: Skipped (no actual time tracking)`);
      }

      // Only add to total if it has actual time tracking
      if (isValidSession) {
        totalMinutes += durationMinutes;
        sessionDetails.push({
          _id: session._id,
          date: session.sessionDate,
          actualDuration: durationMinutes,
          scheduledDuration: session.duration,
          hasActualTimes: true
        });
      }
    });

    // Format total time
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    let timeString = '';
    if (hours > 0) {
      timeString = `${hours}h ${mins}m`;
    } else {
      timeString = `${mins} mins`;
    }

    console.log('📈 [getMentorStats] Total mentoring time:', timeString);
    console.log('📋 [getMentorStats] Session details:', sessionDetails);

    res.status(200).json({
      success: true,
      data: {
        mentorId: targetMentorId,
        sessionsCompleted: completedSessions.length,
        totalMinutes: totalMinutes,
        totalMentoringTime: timeString,
        hours: hours,
        minutes: mins,
        karmaPoints: karmaPoints,
        sessionDetails: sessionDetails
      }
    });

  } catch (error) {
    console.error('❌ [getMentorStats] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentor statistics',
      error: error.message
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
  updateMeetingStatus,
  getCompletedSessionsByDate,
  getMentorStats
};
