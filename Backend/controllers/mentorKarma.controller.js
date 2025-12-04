import KarmaPoints from '../models/karmaPoints.model.js';
import mongoose from 'mongoose';

export async function getMentorKarmaStats(req, res) {
  try {
    const mentorId = req.user.id;
    
    const karmaStats = await KarmaPoints.findOne({ 
      user: mentorId,
      userType: 'mentor' 
    })
    .populate('user', 'name email profilePicture')
    .lean();
    
    if (!karmaStats) {
      return res.status(404).json({
        success: false,
        message: 'Mentor karma stats not found'
      });
    }
    
    // Calculate rank among all mentors
    const rank = await KarmaPoints.countDocuments({
      userType: 'mentor',
      points: { $gt: karmaStats.points }
    }) + 1;
    
    // Calculate total mentors for percentile
    const totalMentors = await KarmaPoints.countDocuments({ userType: 'mentor' });
    const percentile = Math.round(((totalMentors - rank) / totalMentors) * 100) || 0;
    
    // Prepare response with mentor-specific stats
    const response = {
      ...karmaStats,
      rank,
      totalMentors,
      percentile,
      nextLevelPoints: 100 * Math.pow(1.5, karmaStats.level - 1),
      pointsToNextLevel: Math.max(0, (100 * Math.pow(1.5, karmaStats.level - 1)) - karmaStats.points)
    };
    
    res.status(200).json({
      success: true,
      data: response
    });
    
  } catch (error) {
    console.error('Error getting mentor karma stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving mentor karma stats',
      error: error.message
    });
  }
}

export async function getMentorLeaderboard(req, res) {
  try {
    const { timeRange = 'all', limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Calculate date filter based on timeRange
    let dateFilter = {};
    const now = new Date();
    
    switch (timeRange) {
      case 'week':
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        dateFilter = { lastUpdated: { $gte: lastWeek } };
        break;
      case 'month':
        const lastMonth = new Date(now);
        lastMonth.setMonth(now.getMonth() - 1);
        dateFilter = { lastUpdated: { $gte: lastMonth } };
        break;
      case 'year':
        const lastYear = new Date(now);
        lastYear.setFullYear(now.getFullYear() - 1);
        dateFilter = { lastUpdated: { $gte: lastYear } };
        break;
      // 'all' or any other value will return all-time leaderboard
    }
    
    // Get top mentors with pagination
    const leaderboard = await KarmaPoints.aggregate([
      {
        $match: {
          userType: 'mentor',
          ...dateFilter
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          _id: 1,
          points: 1,
          level: 1,
          badges: 1,
          lastUpdated: 1,
          'mentorStats.totalSessions': 1,
          'mentorStats.averageRating': 1,
          'userDetails._id': 1,
          'userDetails.name': 1,
          'userDetails.profilePicture': 1,
          'userDetails.headline': 1
        }
      },
      { $sort: { points: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);
    
    // Get total count for pagination
    const total = await KarmaPoints.countDocuments({
      userType: 'mentor',
      ...dateFilter
    });
    
    res.status(200).json({
      success: true,
      data: {
        leaderboard,
        pagination: {
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        },
        timeRange
      }
    });
    
  } catch (error) {
    console.error('Error getting mentor leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving mentor leaderboard',
      error: error.message
    });
  }
}

export async function getMentorAchievements(req, res) {
  try {
    const mentorId = req.user.id;
    
    const karmaData = await KarmaPoints.findOne({
      user: mentorId,
      userType: 'mentor'
    });
    
    if (!karmaData) {
      return res.status(404).json({
        success: false,
        message: 'Mentor karma data not found'
      });
    }
    
    // Get all possible badges for reference
    const allBadges = [
      // General badges
      { id: 'mentor', name: 'Mentor', description: 'Become a mentor', unlocked: karmaData.badges.includes('mentor') },
      { id: 'top_mentor', name: 'Top Mentor', description: 'Rank in top 10% of mentors', unlocked: karmaData.badges.includes('top_mentor') },
      
      // Session-based badges
      { id: 'mentor_100_sessions', name: 'Centurion', description: 'Complete 100 mentoring sessions', unlocked: karmaData.badges.includes('mentor_100_sessions') },
      { id: 'mentor_500_sessions', name: 'Master Mentor', description: 'Complete 500 mentoring sessions', unlocked: karmaData.badges.includes('mentor_500_sessions') },
      { id: 'mentor_1000_sessions', name: 'Legendary Mentor', description: 'Complete 1000 mentoring sessions', unlocked: karmaData.badges.includes('mentor_1000_sessions') },
      
      // Rating-based badges
      { id: 'mentor_5_star', name: '5-Star Mentor', description: 'Maintain a 4.8+ average rating', unlocked: karmaData.badges.includes('mentor_5_star') },
      
      // Response time badges
      { id: 'mentor_quick_responder', name: 'Quick Responder', description: 'Average response time under 1 hour', unlocked: karmaData.badges.includes('mentor_quick_responder') },
      
      // Community badges
      { id: 'mentor_community_builder', name: 'Community Builder', description: 'Make significant community contributions', unlocked: karmaData.badges.includes('mentor_community_builder') },
      { id: 'mentor_elite', name: 'Elite Mentor', description: 'Earn 10,000+ karma points', unlocked: karmaData.badges.includes('mentor_elite') },
      { id: 'mentor_legend', name: 'Legendary Status', description: 'Earn 50,000+ karma points', unlocked: karmaData.badges.includes('mentor_legend') },
      { id: 'mentor_champion', name: 'Champion Mentor', description: 'Earn 100,000+ karma points', unlocked: karmaData.badges.includes('mentor_champion') }
    ];
    
    // Calculate progress for each badge category
    const categories = [
      {
        name: 'Sessions',
        badges: allBadges.filter(b => ['mentor_100_sessions', 'mentor_500_sessions', 'mentor_1000_sessions'].includes(b.id)),
        progress: Math.min(100, Math.round((karmaData.mentorStats.totalSessions / 100) * 100))
      },
      {
        name: 'Quality',
        badges: allBadges.filter(b => ['mentor_5_star', 'mentor_quick_responder'].includes(b.id)),
        progress: Math.min(100, Math.round((karmaData.mentorStats.averageRating / 5) * 100))
      },
      {
        name: 'Community',
        badges: allBadges.filter(b => ['mentor_community_builder', 'mentor_elite', 'mentor_legend', 'mentor_champion'].includes(b.id)),
        progress: Math.min(100, Math.round((karmaData.points / 100000) * 100))
      }
    ];
    
    res.status(200).json({
      success: true,
      data: {
        totalBadges: karmaData.badges.length,
        totalPossibleBadges: allBadges.length,
        categories,
        allBadges,
        stats: {
          totalSessions: karmaData.mentorStats.totalSessions,
          averageRating: karmaData.mentorStats.averageRating,
          responseTime: karmaData.mentorStats.responseTime,
          points: karmaData.points
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting mentor achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving mentor achievements',
      error: error.message
    });
  }
}

// Middleware to award mentor karma points for specific actions
export async function awardMentorKarma(mentorId, action, metadata = {}) {
  try {
    if (!mentorId || !mongoose.Types.ObjectId.isValid(mentorId)) {
      console.error('Invalid mentor ID for awarding karma points');
      return false;
    }
    
    const karmaPoints = await KarmaPoints.getOrCreate(mentorId, 'mentor');
    
    // Define point values for different actions
    const pointValues = {
      SESSION_COMPLETED: { points: 50, category: 'mentor_sessions_completed' },
      SESSION_RATED_5: { points: 20, category: 'mentor_quality_content' },
      STUDENT_ACHIEVEMENT: { points: 30, category: 'mentor_helpful_mentorship' },
      COMMUNITY_CONTRIBUTION: { points: 10, category: 'mentor_community_contribution' },
      QUICK_RESPONSE: { points: 15, category: 'mentor_response_time', value: metadata.responseTime },
      MENTOR_REVIEW: { points: 25, category: 'mentor_quality_content' },
      SESSION_ATTENDANCE: { points: 20, category: 'mentor_sessions_completed' }
    };
    
    const actionConfig = pointValues[action];
    if (!actionConfig) {
      console.warn(`No point value defined for action: ${action}`);
      return false;
    }
    
    // Add points with the specified category and reason
    await karmaPoints.addPoints(
      actionConfig.points,
      actionConfig.category,
      `Awarded for ${action.toLowerCase().replace(/_/g, ' ')}`
    );
    
    // Special handling for response time (lower is better)
    if (action === 'QUICK_RESPONSE' && metadata.responseTime !== undefined) {
      // Only update if this is the fastest response time or first time
      if (karmaPoints.mentorStats.responseTime === 0 || 
          metadata.responseTime < karmaPoints.mentorStats.responseTime) {
        karmaPoints.mentorStats.responseTime = metadata.responseTime;
        await karmaPoints.save();
      }
    }
    
    // Update average rating if provided
    if (action === 'SESSION_RATED_5' && metadata.rating !== undefined) {
      const totalRating = karmaPoints.mentorStats.averageRating * karmaPoints.mentorStats.totalSessions;
      karmaPoints.mentorStats.totalSessions += 1;
      karmaPoints.mentorStats.averageRating = (totalRating + metadata.rating) / karmaPoints.mentorStats.totalSessions;
      await karmaPoints.save();
    }
    
    console.log(`Awarded ${actionConfig.points} karma points to mentor ${mentorId} for ${action}`);
    return true;
    
  } catch (error) {
    console.error('Error awarding mentor karma points:', error);
    return false;
  }
}
