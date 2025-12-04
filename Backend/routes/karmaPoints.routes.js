import { Router } from 'express';
import { 
  getKarmaPoints, 
  addKarmaPoints, 
  getLeaderboard, 
  getUserRank 
} from '../controllers/karmaPoints.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// All routes are protected and require authentication
router.use(authenticateToken);

// Get current user's karma points
router.get('/', getKarmaPoints);

// Add karma points (admin/moderator only)
router.post('/:userId', (req, res, next) => {
  // Check if user has permission to add karma points
  if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized: Only admins and moderators can add karma points'
    });
  }
  next();
}, addKarmaPoints);

// Get leaderboard
router.get('/leaderboard', getLeaderboard);

// Get user's rank and stats
router.get('/rank', getUserRank);

export default router;
