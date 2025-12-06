import express from 'express';
import { StreamChat } from 'stream-chat';
import { authenticateToken } from '../middleware/auth.middleware.js';
import User from '../models/user.model.js';

const router = express.Router();

const API_KEY = process.env.STREAM_API_KEY;
const API_SECRET = process.env.STREAM_API_SECRET;

if (!API_KEY || !API_SECRET) {
  console.warn('⚠️  STREAM_API_KEY or STREAM_API_SECRET not configured');
}

const serverClient = API_KEY && API_SECRET ? StreamChat.getInstance(API_KEY, API_SECRET) : null;

// 1) Get token for a user (frontend calls this to connect)
router.post('/auth/token', authenticateToken, async (req, res) => {
  try {
    if (!serverClient) {
      return res.status(500).json({
        success: false,
        error: 'Stream Chat not configured'
      });
    }

    const userId = req.user?.id || req.user?._id;
    const { name, image } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Create token for user
    const token = serverClient.createToken(userId);

    // Upsert user on Stream (store name/avatar)
    await serverClient.upsertUser({
      id: userId,
      name: name || 'User',
      image: image || ''
    });

    return res.json({
      success: true,
      apiKey: API_KEY,
      token,
      userId
    });
  } catch (err) {
    console.error('Token generation error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate token',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// 2) Create or get a conversation channel
router.post('/channels/upsert', authenticateToken, async (req, res) => {
  try {
    if (!serverClient) {
      return res.status(500).json({
        success: false,
        error: 'Stream Chat not configured'
      });
    }

    const { conversationId, studentId, mentorId } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!studentId || !mentorId) {
      return res.status(400).json({
        success: false,
        error: 'studentId and mentorId are required'
      });
    }

    // Verify user is part of this conversation
    if (userId !== studentId && userId !== mentorId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: user is not part of this conversation'
      });
    }

    // Ensure both users exist in Stream Chat before creating channel
    // This is required by Stream Chat API
    try {
      // Fetch actual user data from database
      const [studentUser, mentorUser] = await Promise.all([
        User.findById(studentId).select('name profilePicture'),
        User.findById(mentorId).select('name profilePicture')
      ]);

      const usersToUpsert = [
        {
          id: studentId,
          name: studentUser?.name || `Student ${studentId.substring(0, 8)}`,
          image: studentUser?.profilePicture || ''
        },
        {
          id: mentorId,
          name: mentorUser?.name || `Mentor ${mentorId.substring(0, 8)}`,
          image: mentorUser?.profilePicture || ''
        }
      ];

      await serverClient.upsertUsers(usersToUpsert);
      console.log('✓ Upserted users for channel:', { studentId, mentorId });
    } catch (upsertErr) {
      console.error('Error upserting users:', upsertErr);
      // Continue anyway, user might already exist
    }

    // Use deterministic channel ID
    const channelId = conversationId || `dm-${[studentId, mentorId].sort().join('-')}`;

    // Create (or fetch) messaging channel
    const channel = serverClient.channel('messaging', channelId, {
      name: `Mentorship: ${studentId}-${mentorId}`,
      members: [studentId, mentorId],
      created_by_id: userId
    });

    // Create channel (safe to call multiple times)
    await channel.create();

    return res.json({
      success: true,
      channelId: channel.id,
      cid: channel.cid
    });
  } catch (err) {
    console.error('Channel upsert error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to create/get channel',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

export default router;
