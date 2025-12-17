import mongoose from 'mongoose';
import JournalNotes from '../models/journalNotes.model.js';
import JournalEntry from '../models/journalEntry.model.js';
import Booking from '../models/booking.model.js';

const { ObjectId } = mongoose.Types;

// Get completed sessions for student
const getCompletedSessions = async (req, res) => {
  try {
    // Debug the user object
    console.log('Request user object:', req.user);
    console.log('User id:', req.user?.id);
    console.log('User _id:', req.user?._id);

    const userId = req.user.id || req.user._id;
    const userRole = req.user?.role;
    
    if (!userId) {
      console.log('No userId found in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated properly'
      });
    }

    const isMentor = userRole === 'mentor';
    console.log('Fetching completed sessions for user:', { userId, userRole });

    // Get all bookings for this user based on role
    const allBookings = isMentor
      ? await Booking.find({ mentor: userId })
          .populate('student', 'name email')
          .sort({ sessionDate: -1, sessionTime: -1 })
      : await Booking.find({ student: userId })
          .populate('mentor', 'name email')
          .sort({ sessionDate: -1, sessionTime: -1 });

    console.log('All bookings found:', allBookings.length);
    
    if (allBookings.length === 0) {
      console.log('No bookings found at all for user:', userId);
      
      // As a fallback, get all bookings and filter for completed ones
      const fallbackBookings = await Booking.find({
        status: { $in: ['confirmed', 'completed', 'ended', 'finished'] }
      })
       .populate(isMentor ? 'student' : 'mentor', 'name email')
       .sort({ sessionDate: -1, sessionTime: -1 })
       .limit(10);
      
      console.log('Fallback bookings count:', fallbackBookings.length);
      
       const sessions = fallbackBookings.map(booking => ({
         _id: booking._id,
         sessionId: booking._id,
         mentorName: booking.mentor?.name || 'Mentor',
         studentName: booking.student?.name || 'Student',
         sessionDate: booking.sessionDate,
         sessionTime: booking.sessionTime,
         duration: booking.duration || 60,
         topic: booking.sessionTitle || 'General Mentoring',
         status: booking.status,
         hasNotes: false,
         hasAIAnalysis: true
       }));

      return res.json({
        success: true,
        data: sessions
      });
    }
    
     console.log('Booking statuses:', allBookings.map(b => ({ 
       id: b._id, 
       status: b.status, 
       date: b.sessionDate,
       mentor: b.mentor?.name,
       student: b.student?.name
     })));

    // Filter for completed sessions
    const completedBookings = allBookings.filter(booking => 
      booking.status === 'completed' || 
      booking.status === 'confirmed' || 
      booking.status === 'finished' ||
      booking.status === 'ended'
    );

    console.log('Completed bookings found:', completedBookings.length);

    // Transform data for frontend
     const sessions = completedBookings.map(booking => ({
       _id: booking._id,
       sessionId: booking._id,
       mentorName: booking.mentor?.name || 'Mentor',
       studentName: booking.student?.name || 'Student',
       sessionDate: booking.sessionDate,
       sessionTime: booking.sessionTime,
       duration: booking.duration || 60,
       topic: booking.sessionTitle || 'General Mentoring',
       status: booking.status,
       hasNotes: false,
       hasAIAnalysis: true
     }));

    console.log('Returning sessions:', sessions.length);

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching completed sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch completed sessions',
      error: error.message
    });
  }
};

// Save session notes
const saveSessionNotes = async (req, res) => {
  try {
    console.log('=== saveSessionNotes called ===');
    const { sessionId, notes } = req.body;
    const userId = req.user.id || req.user._id;
    
    console.log('Request data:', { sessionId, notes, userId });
    
    // Check if user is the mentor for this session
    const booking = await Booking.findOne({
      _id: sessionId
    });

    console.log('Booking found:', booking);

    if (!booking) {
      console.log('Session not found');
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is the mentor or student
    const isMentor = booking.mentor.toString() === userId;
    const isStudent = booking.student.toString() === userId;
    
    console.log('User type check:', { isMentor, isStudent, bookingMentor: booking.mentor, bookingStudent: booking.student });
    console.log('Booking details:', JSON.stringify(booking, null, 2));
    
    if (!isMentor && !isStudent) {
      console.log('User not authorized');
      return res.status(403).json({
        success: false,
        message: 'User is not authorized to add notes for this session'
      });
    }

    // Find or create the journal entry for this session
    let journalNotes = await JournalNotes.findOne({
      sessionId: sessionId
    });

    console.log('Existing journal notes:', journalNotes);

    // If old schema record exists, delete it and start fresh
    if (journalNotes && (journalNotes.userId || journalNotes.userType)) {
      console.log('Deleting old schema record and starting fresh');
      await JournalNotes.deleteOne({ sessionId: sessionId });
      journalNotes = null;
    }

    if (!journalNotes) {
      // Create new entry
      console.log('Creating new journal entry');
      journalNotes = new JournalNotes({
        sessionId: sessionId,
        studentId: booking.student,  // Required field
        mentorId: booking.mentor,   // Optional field
        studentNotes: isStudent ? notes : '',
        mentorNotes: isMentor ? notes : ''
      });
    } else {
      // Update existing entry
      console.log('Updating existing journal entry');
      if (isStudent) {
        journalNotes.studentNotes = notes;
      } else if (isMentor) {
        journalNotes.mentorNotes = notes;
      }
    }

    journalNotes.updatedAt = new Date();
    console.log('About to save journal notes:', JSON.stringify(journalNotes, null, 2));
    console.log('Saving journal notes...');
    await journalNotes.save();
    console.log('Journal notes saved successfully:', JSON.stringify(journalNotes, null, 2));

    res.json({
      success: true,
      message: 'Notes saved successfully',
      data: journalNotes
    });
  } catch (error) {
    console.error('Error saving session notes:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    console.error('Request user:', req.user);
    res.status(500).json({
      success: false,
      message: 'Failed to save notes',
      error: error.message
    });
  }
};

// Get session notes
const getSessionNotes = async (req, res) => {
  try {
    console.log('=== getSessionNotes called ===');
    const { sessionId } = req.params;
    const userId = req.user.id || req.user._id;
    
    console.log('Request data:', { sessionId, userId });
    
    // Check if user is authorized for this session
    const booking = await Booking.findOne({
      _id: sessionId
    });

    console.log('Booking found:', booking);

    if (!booking) {
      console.log('Session not found');
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is the mentor or student
    const isMentor = booking.mentor.toString() === userId;
    const isStudent = booking.student.toString() === userId;
    
    console.log('User type check:', { isMentor, isStudent, bookingMentor: booking.mentor, bookingStudent: booking.student });
    
    if (!isMentor && !isStudent) {
      console.log('User not authorized');
      return res.status(403).json({
        success: false,
        message: 'User is not authorized to view notes for this session'
      });
    }

    // Get notes for this session
    const journalNotes = await JournalNotes.findOne({
      sessionId: sessionId
    });

    console.log('Journal notes found:', journalNotes);

    // If old schema record exists, delete it and return empty
    if (journalNotes && (journalNotes.userId || journalNotes.userType)) {
      console.log('Deleting old schema record during fetch');
      await JournalNotes.deleteOne({ sessionId: sessionId });
      journalNotes = null;
    }

    // Return appropriate notes based on user type
    let responseData;
    if (!journalNotes) {
      // No notes exist yet
      console.log('No existing notes found');
      responseData = {
        sessionId,
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } else {
      // Return only the notes for this user type
      const notesField = isStudent ? journalNotes.studentNotes : journalNotes.mentorNotes;
      console.log('Notes field being returned:', { isStudent, notesField, studentNotes: journalNotes.studentNotes, mentorNotes: journalNotes.mentorNotes });
      
      responseData = {
        sessionId,
        notes: notesField,
        createdAt: journalNotes.createdAt,
        updatedAt: journalNotes.updatedAt
      };
    }

    console.log('Final response data:', responseData);

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching session notes:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes',
      error: error.message
    });
  }
};

// Save complete journal entry
const saveJournalEntry = async (req, res) => {
  try {
    const { sessionId, insights, notes } = req.body;
    const studentId = req.user.id || req.user._id;

    if (!sessionId || !notes) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and notes are required'
      });
    }

    // Verify the booking belongs to this student
    const booking = await Booking.findOne({
      _id: sessionId,
      student: studentId
    }).populate('mentor', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Create journal entry
    const journalEntry = await JournalEntry.findOneAndUpdate(
      { sessionId: sessionId, studentId: studentId },
      {
        insights: insights || {},
        notes: notes,
        mentorName: booking.mentorId?.name || 'Mentor',
        sessionDate: booking.sessionDate,
        sessionTime: booking.sessionTime,
        duration: booking.duration || 60,
        topic: booking.topic || 'General Mentoring',
        savedAt: new Date()
      },
      {
        upsert: true,
        new: true
      }
    );

    res.json({
      success: true,
      message: 'Journal entry saved successfully',
      data: journalEntry
    });
  } catch (error) {
    console.error('Error saving journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save journal entry'
    });
  }
};

// Get all journal entries for student
const getJournalEntries = async (req, res) => {
  try {
    const studentId = req.user.id || req.user._id;

    const journalEntries = await JournalEntry.find({ studentId: studentId })
      .sort({ savedAt: -1 });

    res.json({
      success: true,
      data: journalEntries
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journal entries'
    });
  }
};

export {
  getCompletedSessions,
  saveSessionNotes,
  getSessionNotes,
  saveJournalEntry,
  getJournalEntries
};
