import express from 'express';
import { getAchievements } from '../controllers/achievement.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getAchievements);

export default router;
