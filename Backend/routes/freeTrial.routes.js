import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requestFreeTrial } from '../controllers/freeTrial.controller.js';

const router = express.Router();

router.get('/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'free-trial routes alive'
  });
});

router.post('/request', authenticateToken, requestFreeTrial);

export default router;
