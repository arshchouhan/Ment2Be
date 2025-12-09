import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  // Conversation participants
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Message content
  content: {
    type: String,
    required: true,
    trim: true
  },
  
  // Message type for different kinds of communication
  messageType: {
    type: String,
    enum: ['normal', 'question', 'insight', 'advice', 'action'],
    default: 'normal'
  },
  
  // Message status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  
  // Optional: Reference to booking/session if message is related to a specific session
  relatedBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  
  // Message metadata
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, createdAt: -1 });
messageSchema.index({ isRead: 1 });

// Virtual for conversation ID (consistent regardless of sender/receiver order)
messageSchema.virtual('conversationId').get(function() {
  const participants = [this.sender.toString(), this.receiver.toString()].sort();
  return participants.join('_');
});

// Static method to get conversations for a user
messageSchema.statics.getConversations = async function(userId) {
  const conversations = await this.aggregate([
    // Match messages where user is either sender or receiver
    {
      $match: {
        $or: [
          { sender: new mongoose.Types.ObjectId(userId) },
          { receiver: new mongoose.Types.ObjectId(userId) }
        ]
      }
    },
    // Sort by creation date to get latest messages first
    {
      $sort: { createdAt: -1 }
    },
    // Group by conversation (unique pair of users)
    {
      $group: {
        _id: {
          $cond: {
            if: { $lt: ['$sender', '$receiver'] },
            then: { sender: '$sender', receiver: '$receiver' },
            else: { sender: '$receiver', receiver: '$sender' }
          }
        },
        lastMessage: { $first: '$content' },
        lastMessageTime: { $first: '$createdAt' },
        lastMessageType: { $first: '$messageType' },
        lastSender: { $first: '$sender' },
        unreadCount: {
          $sum: {
            $cond: {
              if: {
                $and: [
                  { $eq: ['$receiver', new mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$isRead', false] }
                ]
              },
              then: 1,
              else: 0
            }
          }
        }
      }
    },
    // Determine the other participant (not the current user)
    {
      $addFields: {
        otherParticipant: {
          $cond: {
            if: { $eq: ['$_id.sender', new mongoose.Types.ObjectId(userId)] },
            then: '$_id.receiver',
            else: '$_id.sender'
          }
        }
      }
    },
    // Lookup user details for the other participant
    {
      $lookup: {
        from: 'users',
        localField: 'otherParticipant',
        foreignField: '_id',
        as: 'participantDetails'
      }
    },
    // Lookup mentor profile if the other participant is a mentor
    {
      $lookup: {
        from: 'mentorprofiles',
        localField: 'otherParticipant',
        foreignField: 'user',
        as: 'mentorProfile'
      }
    },
    // Add user profile picture as fallback
    {
      $addFields: {
        userProfilePicture: { $arrayElemAt: ['$participantDetails.profilePicture', 0] }
      }
    },
    // Format the output
    {
      $project: {
        _id: 0,
        conversationId: {
          $concat: [
            { $toString: '$_id.sender' },
            '_',
            { $toString: '$_id.receiver' }
          ]
        },
        participantId: '$otherParticipant',
        participantName: { $arrayElemAt: ['$participantDetails.name', 0] },
        participantEmail: { $arrayElemAt: ['$participantDetails.email', 0] },
        participantRole: { $arrayElemAt: ['$participantDetails.role', 0] },
        participantBio: { $arrayElemAt: ['$participantDetails.bio', 0] },
        profilePicture: {
          $cond: {
            if: { $arrayElemAt: ['$mentorProfile.profilePicture', 0] },
            then: { $arrayElemAt: ['$mentorProfile.profilePicture', 0] },
            else: '$userProfilePicture'
          }
        },
        lastMessage: '$lastMessage',
        lastMessageTime: '$lastMessageTime',
        lastMessageType: '$lastMessageType',
        lastSender: '$lastSender',
        unreadCount: '$unreadCount',
        isOnline: { $literal: false } // This would need to be updated with real-time presence
      }
    },
    // Sort by last message time
    {
      $sort: { lastMessageTime: -1 }
    }
  ]);

  return conversations;
};

// Static method to get messages between two users
messageSchema.statics.getConversationMessages = function(userId1, userId2, limit = 50, skip = 0) {
  return this.find({
    $or: [
      { sender: userId1, receiver: userId2 },
      { sender: userId2, receiver: userId1 }
    ]
  })
  .populate('sender', 'name email role')
  .populate('receiver', 'name email role')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

// Static method to mark messages as read
messageSchema.statics.markAsRead = function(senderId, receiverId) {
  return this.updateMany(
    {
      sender: senderId,
      receiver: receiverId,
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );
};

// Instance method to mark single message as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

const Message = mongoose.model('Message', messageSchema);

export default Message;
