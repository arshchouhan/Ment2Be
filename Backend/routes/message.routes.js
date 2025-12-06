import express from 'express';
import {
  getConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadCount,
  getMessageableUsers,
  getDatabaseStats
} from '../controllers/message.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All message routes require authentication
router.use(authenticateToken);

// Get all conversations for the authenticated user
router.get('/conversations', getConversations);

// Get messages for a specific conversation
router.get('/conversations/:participantId/messages', getConversationMessages);

// Send a new message
router.post('/send', sendMessage);

// Mark messages as read
router.put('/conversations/:senderId/read', markMessagesAsRead);

// Get unread message count
router.get('/unread-count', getUnreadCount);

// Get users that can be messaged
router.get('/messageable-users', getMessageableUsers);

// Test endpoint for database stats (no auth required)
router.get('/test-db', getDatabaseStats);

export default router;
