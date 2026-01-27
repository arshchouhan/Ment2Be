import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { initializeSocketIO, getSocketStats } from './config/socket.js';
import authRouter from './routes/auth.routes.js';
import phoneAuthRouter from './routes/phoneAuth.routes.js';
import userRouter from './routes/user.routes.js';
import skillsRouter from './routes/skills.routes.js';
import sessionsRouter from './routes/session.routes.js';
import paymentsRouter from './routes/payments.routes.js';
import reviewsRouter from './routes/reviews.routes.js';
import mentorRouter from './routes/mentor.routes.js';
import bookingRouter from './routes/booking.routes.js';
import messageRouter from './routes/message.routes.js';
import karmaPointsRouter from './routes/karmaPoints.routes.js';
import mentorKarmaRouter from './routes/mentorKarma.routes.js';
import karmaRouter from './routes/karma.routes.js';
import streamChatRouter from './routes/streamChat.routes.js';
import taskRouter from './routes/task.routes.js';
import twilioRouter from './routes/twilio.routes.js';
import forumRouter from './routes/forum.routes.js';
import availabilityRouter from './routes/availability.routes.js';
import freeTrialRouter from './routes/freeTrial.routes.js';
import categoryRouter from './routes/category.routes.js';
import uploadRouter from './routes/upload.routes.js';
import aiRouter from './routes/ai.routes.js';
import debugRouter from './routes/debug.routes.js';
import connectionRouter from './routes/connection.routes.js';
import journalRouter from './routes/journal.routes.js';
import contactRouter from './routes/contact.routes.js';
import achievementRouter from './routes/achievement.routes.js';

import dotenv from "dotenv"
import { validateEnv } from './config/env.js';
import errorMiddleware from './middleware/error.middleware.js';

dotenv.config()
validateEnv();

// Log CORS configuration
if (process.env.CORS_ORIGINS) {
  console.log('✅ CORS Origins from env:', process.env.CORS_ORIGINS.split(',').map(o => o.trim()));
} else {
  console.log('⚠️ CORS Origins: Using default development origins');
}

const app = express();
const server = createServer(app);
initializeSocketIO(server);

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Rate limiting configuration
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: {
    success: false,
    message: 'Upload limit exceeded, please try again later',
    retryAfter: '1 hour'
  }
});

// Apply rate limiting
app.use(generalLimiter);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

app.use(cors({
  origin: process.env.CORS_ORIGINS ? 
    process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) : 
    [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://k23-dx.vercel.app",
      "https://ment2be.arshchouhan.me"
    ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"]
}));


// Request size middleware with route-specific limits
const createSizeMiddleware = (limit) => {
  return [
    express.json({ limit }),
    express.urlencoded({ extended: true, limit })
  ];
};

// Default small size for most routes
app.use(createSizeMiddleware('1mb'));

// Large file upload routes (override default)
app.use('/api/upload', createSizeMiddleware('10mb'));
app.use('/api/mentors/upload-photo', createSizeMiddleware('5mb'));

if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Request size validation error handler
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request payload too large',
      maxSize: req.route?.path?.includes('upload') ? '10MB' : '1MB'
    });
  }
  next(err);
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is up and Running',
    version: '1.0.0',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO statistics endpoint (optional)
app.get('/api/socket/stats', (req, res) => {
  res.status(200).json({
    success: true,
    data: getSocketStats()
  });
});

// Apply specific rate limiters to routes
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/auth/phone', authLimiter, phoneAuthRouter);
app.use('/api/upload', uploadLimiter, uploadRouter);
app.use('/api/mentors/upload-photo', uploadLimiter);
app.use('/api/user', userRouter);
app.use('/api/mentors', mentorRouter);
app.use('/api/mentors/karma', mentorKarmaRouter);
app.use('/api/bookings', bookingRouter);

app.use('/api/skills', skillsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/messages', messageRouter);
app.use('/api/karma/points', karmaPointsRouter);
app.use('/api/karma', karmaRouter);
app.use('/api/stream', streamChatRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/twilio', twilioRouter);
app.use('/api/forum', forumRouter);
app.use('/api/mentor-availability', availabilityRouter);
app.use('/api/free-trial', freeTrialRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/ai', aiRouter);
app.use('/api/debug', debugRouter);
app.use('/api/connections', connectionRouter);
app.use('/api/journal', journalRouter);
app.use('/api/contact', contactRouter);

// Global error handling middleware (must be last)
app.use(errorMiddleware);

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, '0.0.0.0', () => {
      console.log('\n');
      console.log(`Server running in ${NODE_ENV} mode`);
      console.log(`Port: ${PORT}`);
      console.log(`Local: http://localhost:${PORT}`);
      console.log(`Socket.IO enabled for real-time meetings`);
      console.log('\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error(' Unhandled Rejection:', err);
  // Don't exit in development to prevent disconnections
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error(' Uncaught Exception:', err);
  // Don't exit in development to prevent disconnections
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

startServer();