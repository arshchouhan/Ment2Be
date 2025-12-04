import { Router } from 'express';
import { 
  getMentorKarmaStats,
  getMentorLeaderboard,
  getMentorAchievements
} from '../controllers/mentorKarma.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get current mentor's karma stats and rank
router.get('/stats', getMentorKarmaStats);

// Get mentor leaderboard with filters
router.get('/leaderboard', getMentorLeaderboard);

// Get mentor achievements and badges
router.get('/achievements', getMentorAchievements);

export default router;
