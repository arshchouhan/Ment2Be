import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  saveAvailability,
  getAvailability,
  deleteAvailability,
  getAvailableSlots,
  getLatestAvailability,
  getNextAvailableSlot,
  quickSetupAvailability
} from '../controllers/availability.controller.js';

const router = express.Router();

// PUBLIC ROUTES - No authentication required (for students browsing mentors)
// Get mentor availability for a specific date (students booking sessions)
router.get('/mentor/:mentorId', getAvailableSlots);

// Get latest availability for a mentor (public display)
router.get('/latest/:mentorId', getLatestAvailability);

// Get next (earliest upcoming) available slot for a mentor (public display)
router.get('/next/:mentorId', getNextAvailableSlot);

// PROTECTED ROUTES - Authentication required (for mentors managing their own availability)
// Save mentor availability
router.post('/', authenticateToken, saveAvailability);

// Quick setup - Set availability for multiple dates
router.post('/quick-setup', authenticateToken, quickSetupAvailability);

// Get all availability for authenticated mentor (their own dashboard)
router.get('/my-availability', authenticateToken, getAvailability);

// Delete availability
router.delete('/:availabilityId', authenticateToken, deleteAvailability);

export default router;
