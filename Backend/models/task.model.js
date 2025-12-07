import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  // Task basic info
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  instructions: {
    type: String,
    trim: true
  },
  
  // Task assignment
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  menteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  menteeName: {
    type: String,
    default: 'Student'
  },
  mentorName: {
    type: String,
    default: 'Mentor'
  },
  
  // Task categorization
  category: {
    type: String,
    enum: ['Technical Skills', 'Soft Skills', 'Career Development', 'Content Creation', 'coding', ''],
    default: 'Technical Skills'
  },
  priority: {
    type: String,
    enum: ['urgent', 'high', 'medium', 'low'],
    default: 'medium'
  },
  
  // Task status
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'pending-review', 'completed'],
    default: 'not-started'
  },
  
  // Task timeline
  dueDate: {
    type: Date
  },
  estimatedTime: {
    type: String,
    default: ''
  },
  
  // Task resources and requirements
  resources: {
    type: String,
    default: ''
  },
  attachments: [{
    type: String
  }],
  
  // Task settings
  notifyMentee: {
    type: Boolean,
    default: true
  },
  requireSubmission: {
    type: Boolean,
    default: false
  },
  
  // Progress tracking
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
taskSchema.index({ mentorId: 1 });
taskSchema.index({ menteeId: 1 });
taskSchema.index({ mentorId: 1, menteeId: 1 });
taskSchema.index({ status: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
