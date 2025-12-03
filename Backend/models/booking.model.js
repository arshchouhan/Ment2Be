import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  // Basic booking information
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Session details
  sessionTitle: {
    type: String,
    required: true,
    trim: true
  },
  sessionDescription: {
    type: String,
    trim: true
  },
  sessionType: {
    type: String,
    enum: ['one-on-one', 'group', 'workshop'],
    default: 'one-on-one'
  },
  
  // Date and time
  sessionDate: {
    type: Date,
    required: true
  },
  sessionTime: {
    type: String,
    required: true // Format: "HH:MM AM/PM"
  },
  duration: {
    type: Number,
    required: true,
    default: 60 // Duration in minutes
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  
  // Booking status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },
  
  // Payment information
  price: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: String // Stripe/PayPal payment ID
  },
  
  // Session topics and skills
  topics: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  
  // Meeting details
  meetingLink: {
    type: String,
    trim: true
  },
  meetingId: {
    type: String,
    trim: true
  },
  meetingPassword: {
    type: String,
    trim: true
  },
  
  // Socket.IO Room details
  roomId: {
    type: String,
    unique: true,
    required: false // Made optional to handle existing bookings
  },
  
  // Meeting status tracking
  meetingStatus: {
    type: String,
    enum: ['not_started', 'waiting', 'active', 'ended'],
    default: 'not_started'
  },
  
  // Participants tracking
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date
    },
    leftAt: {
      type: Date
    },
    isOnline: {
      type: Boolean,
      default: false
    }
  }],
  
  // Additional information
  studentNotes: {
    type: String,
    trim: true
  },
  mentorNotes: {
    type: String,
    trim: true
  },
  
  // Session outcome
  sessionCompleted: {
    type: Boolean,
    default: false
  },
  sessionRating: {
    student: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: {
        type: String,
        trim: true
      }
    },
    mentor: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: {
        type: String,
        trim: true
      }
    }
  },
  
  // Recurring session information
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly'],
    },
    endDate: {
      type: Date
    },
    totalSessions: {
      type: Number
    }
  },
  parentBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  
  // Cancellation information
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationDate: {
    type: Date
  },
  
  // Reminders and notifications
  remindersSent: {
    student: {
      type: Boolean,
      default: false
    },
    mentor: {
      type: Boolean,
      default: false
    }
  },
  
  // Session analytics
  sessionStartTime: {
    type: Date
  },
  sessionEndTime: {
    type: Date
  },
  actualDuration: {
    type: Number // Actual duration in minutes
  },
  
  // Booking metadata
  bookingSource: {
    type: String,
    enum: ['web', 'mobile', 'api'],
    default: 'web'
  },
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
bookingSchema.index({ student: 1, sessionDate: 1 });
bookingSchema.index({ mentor: 1, sessionDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ sessionDate: 1 });
bookingSchema.index({ createdAt: -1 });

// Virtual for formatted session date and time
bookingSchema.virtual('formattedDateTime').get(function() {
  if (this.sessionDate && this.sessionTime) {
    const date = new Date(this.sessionDate);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: this.sessionTime,
      fullDateTime: `${date.toLocaleDateString()} at ${this.sessionTime}`
    };
  }
  return null;
});

// Virtual for session status display
bookingSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': 'Pending Confirmation',
    'confirmed': 'Confirmed',
    'cancelled': 'Cancelled',
    'completed': 'Completed',
    'no-show': 'No Show'
  };
  return statusMap[this.status] || this.status;
});

// Pre-save middleware
bookingSchema.pre('save', function(next) {
  // Ensure session date is in the future for new bookings
  if (this.isNew && this.sessionDate < new Date()) {
    const error = new Error('Session date must be in the future');
    return next(error);
  }
  
  // Auto-generate session title if not provided
  if (!this.sessionTitle && this.topics && this.topics.length > 0) {
    this.sessionTitle = `Mentoring Session - ${this.topics.slice(0, 2).join(', ')}`;
  }
  
  next();
});

// Static methods
bookingSchema.statics.getUpcomingSessions = function(userId, userType = 'student') {
  const query = {
    [userType]: userId,
    sessionDate: { $gte: new Date() },
    status: { $in: ['pending', 'confirmed'] }
  };
  
  return this.find(query)
    .populate('student', 'name email profilePicture')
    .populate('mentor', 'name email profilePicture')
    .sort({ sessionDate: 1 });
};

bookingSchema.statics.getSessionHistory = function(userId, userType = 'student') {
  const query = {
    [userType]: userId,
    status: { $in: ['completed', 'cancelled', 'no-show'] }
  };
  
  return this.find(query)
    .populate('student', 'name email profilePicture')
    .populate('mentor', 'name email profilePicture')
    .sort({ sessionDate: -1 });
};

// Instance methods
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const sessionDateTime = new Date(this.sessionDate);
  const hoursUntilSession = (sessionDateTime - now) / (1000 * 60 * 60);
  
  return this.status === 'confirmed' && hoursUntilSession >= 24;
};

bookingSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.sessionCompleted = true;
  this.sessionEndTime = new Date();
  
  if (this.sessionStartTime) {
    this.actualDuration = Math.round((this.sessionEndTime - this.sessionStartTime) / (1000 * 60));
  }
  
  return this.save();
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
