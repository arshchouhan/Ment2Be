import mongoose from 'mongoose';

const karmaPointsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  userType: {
    type: String,
    enum: ['mentor', 'student'],
    required: true
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  // Optional: Track points by category
  pointsBreakdown: {
    // General categories
    sessions: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 },
    
    // Mentor-specific categories
    mentor_sessions_completed: { type: Number, default: 0 },
    mentor_helpful_mentorship: { type: Number, default: 0 },
    mentor_quality_content: { type: Number, default: 0 },
    mentor_response_time: { type: Number, default: 0 },
    mentor_community_contribution: { type: Number, default: 0 },
    
    // Student-specific categories
    student_attendance: { type: Number, default: 0 },
    student_engagement: { type: Number, default: 0 },
    student_achievements: { type: Number, default: 0 },
    
    // Add more categories as needed
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  badges: [{
    type: String,
    enum: [
      // General badges
      'newcomer', 'active', 'helper', 'expert', 'community_leader',
      
      // Mentor-specific badges
      'mentor', 'top_mentor', 'mentor_elite', 'mentor_legend', 'mentor_champion',
      'mentor_100_sessions', 'mentor_500_sessions', 'mentor_1000_sessions',
      'mentor_5_star', 'mentor_quick_responder', 'mentor_community_builder',
      
      // Student-specific badges
      'student', 'top_student', 'active_learner', 'quick_learner', 'achiever',
      'perfect_attendance', 'consistency_champion', 'skill_master'
    ]
  }],
  
  // Mentor-specific metrics
  mentorStats: {
    totalSessions: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 }, // in hours
    studentCount: { type: Number, default: 0 },
    sessionCompletionRate: { type: Number, default: 0 },
    lastSessionDate: { type: Date }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
karmaPointsSchema.index({ user: 1, userType: 1 });

// Virtual for points needed for next level
karmaPointsSchema.virtual('nextLevelPoints').get(function() {
  return Math.floor(100 * Math.pow(1.5, this.level - 1));
});

// Method to add points
karmaPointsSchema.methods.addPoints = async function(amount, category = 'engagement', reason) {
  this.points += amount;
  
  // Update points breakdown if category exists
  if (this.pointsBreakdown[category] !== undefined) {
    this.pointsBreakdown[category] += amount;
  }
  
  // Special handling for mentor-specific categories
  if (this.userType === 'mentor') {
    await this.updateMentorStats(category, amount, reason);
  }
  
  // Check for level up
  const pointsForNextLevel = this.calculatePointsForNextLevel();
  if (this.points >= pointsForNextLevel) {
    await this.levelUp();
  }
  
  this.lastUpdated = new Date();
  await this.save();
  return this;
};

// Calculate points needed for next level
karmaPointsSchema.methods.calculatePointsForNextLevel = function() {
  return 100 * Math.pow(1.5, this.level - 1);
};

// Handle level up
karmaPointsSchema.methods.levelUp = async function() {
  this.level += 1;
  
  // Add level up badge if not exists
  const levelBadge = `level_${this.level}`;
  if (!this.badges.includes(levelBadge)) {
    this.badges.push(levelBadge);
  }
  
  // Check for special mentor badges on level up
  if (this.userType === 'mentor') {
    await this.checkMentorBadges();
  }
  
  return this;
};

// Update mentor-specific statistics
karmaPointsSchema.methods.updateMentorStats = async function(category, amount, reason) {
  // Update session-related stats
  if (category === 'mentor_sessions_completed') {
    this.mentorStats.totalSessions += 1;
    this.mentorStats.lastSessionDate = new Date();
    
    // Check for session count badges
    if (this.mentorStats.totalSessions >= 1000) {
      this.addBadge('mentor_1000_sessions');
    } else if (this.mentorStats.totalSessions >= 500) {
      this.addBadge('mentor_500_sessions');
    } else if (this.mentorStats.totalSessions >= 100) {
      this.addBadge('mentor_100_sessions');
    }
  }
  
  // Update response time (lower is better)
  if (category === 'mentor_response_time' && amount < this.mentorStats.responseTime) {
    this.mentorStats.responseTime = amount;
    if (amount <= 1) { // Responded within 1 hour
      this.addBadge('mentor_quick_responder');
    }
  }
  
  // Check for mentor elite status
  if (this.points >= 10000 && !this.badges.includes('mentor_elite')) {
    this.addBadge('mentor_elite');
  }
  
  // Check for mentor legend status
  if (this.points >= 50000 && !this.badges.includes('mentor_legend')) {
    this.addBadge('mentor_legend');
  }
  
  // Check for mentor champion status
  if (this.points >= 100000 && !this.badges.includes('mentor_champion')) {
    this.addBadge('mentor_champion');
  }
};

// Check and award mentor-specific badges
karmaPointsSchema.methods.checkMentorBadges = async function() {
  // Check for top mentor status (top 10% of mentors)
  const MentorKarma = mongoose.model('KarmaPoints');
  const totalMentors = await MentorKarma.countDocuments({ userType: 'mentor' });
  const topMentors = await MentorKarma.countDocuments({
    userType: 'mentor',
    points: { $gt: this.points }
  });
  
  const topPercentage = (topMentors / totalMentors) * 100;
  
  if (topPercentage <= 10 && !this.badges.includes('top_mentor')) {
    this.addBadge('top_mentor');
  }
  
  // Check for 5-star mentor status (based on average rating)
  if (this.mentorStats.averageRating >= 4.8 && !this.badges.includes('mentor_5_star')) {
    this.addBadge('mentor_5_star');
  }
  
  // Check for community builder status
  if (this.pointsBreakdown.mentor_community_contribution >= 1000 && 
      !this.badges.includes('mentor_community_builder')) {
    this.addBadge('mentor_community_builder');
  }
};

// Helper method to add a badge if not already present
karmaPointsSchema.methods.addBadge = function(badgeName) {
  if (!this.badges.includes(badgeName)) {
    this.badges.push(badgeName);
    return true;
  }
  return false;
};

// Static method to get or create karma points for a user
karmaPointsSchema.statics.getOrCreate = async function(userId, userType) {
  let karmaPoints = await this.findOne({ user: userId });
  
  if (!karmaPoints) {
    karmaPoints = await this.create({
      user: userId,
      userType: userType || 'student', // Default to student if not specified
      points: 0,
      pointsBreakdown: {}
    });
  }
  
  return karmaPoints;
};

const KarmaPoints = mongoose.model('KarmaPoints', karmaPointsSchema);

export default KarmaPoints;
