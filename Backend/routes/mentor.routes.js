import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { 
  GetAllMentors, 
  GetMentorById, 
  GetMentorsBySkill,
  GetCarouselMentors,
  GetTopExperts,
  CreateOrUpdateMentorProfile,
  UploadMentorPhoto,
  RemoveMentorPhoto
} from '../controllers/mentor.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const mentorRouter = Router();

// Middleware to validate MongoDB ObjectId
const validateMongoId = (req, res, next) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format. ID must be a valid MongoDB ObjectId.'
    });
  }
  next();
};

// IMPORTANT: Specific routes MUST come before generic :id route
mentorRouter.get('/carousel', GetCarouselMentors);
mentorRouter.get('/top-experts', GetTopExperts);
mentorRouter.get('/skill/:skillId', GetMentorsBySkill);

// Generic routes LAST (after specific ones)
mentorRouter.get('/:id', validateMongoId, GetMentorById);
mentorRouter.get('/', GetAllMentors);

// Create or update mentor profile
mentorRouter.post('/profile', authenticateToken, CreateOrUpdateMentorProfile);

// Upload mentor profile photo
mentorRouter.post(
  '/upload-photo', 
  authenticateToken, 
  upload.single('profilePhoto'), 
  UploadMentorPhoto
);

// Remove mentor profile photo
mentorRouter.delete(
  '/upload-photo', 
  authenticateToken, 
  RemoveMentorPhoto
);

export default mentorRouter;
