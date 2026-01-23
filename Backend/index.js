import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
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

import dotenv from "dotenv"
import { validateEnv } from './config/env.js';

dotenv.config()
validateEnv();

const app = express();
const server = createServer(app);
initializeSocketIO(server);

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://k23-dx.vercel.app",
    "https://ment2be.arshchouhan.me",
    process.env.FRONTEND_URL,
    process.env.HOSTED_FRONTEND_DOMAIN
  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

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

app.use('/api/auth', authRouter);
app.use('/api/auth/phone', phoneAuthRouter);
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
app.use('/api/karma', karmaRouter); // Java microservice integration
app.use('/api/stream', streamChatRouter); // Stream Chat endpoints
app.use('/api/tasks', taskRouter); // Task management endpoints
app.use('/api/twilio', twilioRouter); // Twilio Video endpoints
app.use('/api/forum', forumRouter); // Forum Q&A endpoints
app.use('/api/mentor-availability', availabilityRouter); // Mentor availability endpoints
app.use('/api/free-trial', freeTrialRouter); // Free trial request email endpoints
app.use('/api/categories', categoryRouter); // Category endpoints
app.use('/api/upload', uploadRouter); // File upload endpoints
app.use('/api/ai', aiRouter); // AI session insights endpoints
app.use('/api/debug', debugRouter); // Debug endpoints
app.use('/api/connections', connectionRouter); // Mentor connections endpoints
app.use('/api/journal', journalRouter); // Journal entries and notes endpoints
app.use('/api/contact', contactRouter); // Contact form email endpoint

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value',
      field: Object.keys(err.keyPattern)[0]
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

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