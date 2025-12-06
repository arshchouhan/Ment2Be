import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import MentorProfile from '../models/mentorProfile.model.js';
import mongoose from 'mongoose';

// Test endpoint to get database stats
export const getDatabaseStats = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const messageCount = await db.collection('messages').countDocuments();
    const userCount = await db.collection('users').countDocuments();
    
    res.status(200).json({
      database: 'Uploom',
      messageCount,
      userCount,
      success: true
    });
  } catch (error) {
    console.error('Error getting database stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get database stats',
      error: error.message
    });
  }
};

// Get all conversations for the authenticated user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("[MESSAGE CONTROLLER] getConversations called");
    console.log("[MESSAGE CONTROLLER] User ID from token: " + userId);
    console.log("[MESSAGE CONTROLLER] User object: " + JSON.stringify(req.user));
    
    const conversations = await Message.getConversations(userId);
    console.log("[MESSAGE CONTROLLER] Found " + conversations.length + " conversations");
    
    res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
};

// Get messages for a specific conversation
export const getConversationMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { participantId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Verify that the participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    const messages = await Message.getConversationMessages(
      userId, 
      participantId, 
      parseInt(limit), 
      parseInt(skip)
    );

    // Mark messages as read
    await Message.markAsRead(participantId, userId);

    res.status(200).json({
      success: true,
      data: messages.reverse() // Reverse to show oldest first
    });
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content, messageType = 'normal', relatedBooking } = req.body;

    // Validate required fields
    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and content are required'
      });
    }

    // Verify that the receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Create the message
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
      messageType,
      relatedBooking: relatedBooking || undefined
    });

    await message.save();

    // Populate sender and receiver details
    await message.populate('sender', 'name email role');
    await message.populate('receiver', 'name email role');

    res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { senderId } = req.params;

    // Verify that the sender exists
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({
        success: false,
        message: 'Sender not found'
      });
    }

    const result = await Message.markAsRead(senderId, userId);

    res.status(200).json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      },
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Message.countDocuments({
      receiver: userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: {
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
};

// Get users that can be messaged (mentors for students, students for mentors)
export const getMessageableUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let users;
    
    if (userRole === 'student') {
      // Students can message mentors
      users = await User.find({ 
        role: 'mentor',
        _id: { $ne: userId }
      })
      .select('name email bio')
      .populate({
        path: 'mentorprofiles',
        select: 'profilePicture skills hourlyRate'
      });
    } else if (userRole === 'mentor') {
      // Mentors can message students (typically their mentees)
      users = await User.find({ 
        role: 'student',
        _id: { $ne: userId }
      })
      .select('name email bio');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user role'
      });
    }

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching messageable users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};
