import KarmaPoints from '../models/karmaPoints.model.js';
import mongoose from 'mongoose';

export async function getKarmaPoints(req, res) {
  try {
    const userId = req.user.id;
    const karmaPoints = await KarmaPoints.findOne({ user: userId });
    
    if (!karmaPoints) {
      return res.status(404).json({
        success: false,
        message: 'Karma points not found for this user'
      });
    }
    
    res.status(200).json({
      success: true,
      data: karmaPoints
    });
  } catch (error) {
    console.error('Error getting karma points:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving karma points',
      error: error.message
    });
  }
}

export async function addKarmaPoints(req, res) {
  try {
    const { userId } = req.params;
    const { points, category = 'engagement', reason } = req.body;
    
    // Validate points is a positive number
    if (typeof points !== 'number' || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Points must be a positive number'
      });
    }
    
    // Get or create karma points for user
    const userKarma = await KarmaPoints.getOrCreate(userId, req.user.role);
    
    // Add points
    await userKarma.addPoints(points, category);
    
    // Get updated karma points
    const updatedKarma = await KarmaPoints.findById(userKarma._id);
    
    res.status(200).json({
      success: true,
      message: `Added ${points} karma points`,
      data: updatedKarma,
      reason: reason || 'Points added'
    });
    
  } catch (error) {
    console.error('Error adding karma points:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding karma points',
      error: error.message
    });
  }
}

export async function getLeaderboard(req, res) {
  try {
    const { type = 'all', limit = 10 } = req.query;
    
    let matchStage = {};
    if (type !== 'all') {
      matchStage = { userType: type }; // 'mentor' or 'student'
    }
    
    const leaderboard = await KarmaPoints.aggregate([
      { $match: matchStage },
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
          'userDetails.name': 1,
          'userDetails.profilePicture': 1,
          'userDetails.role': 1
        }
      },
      { $sort: { points: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.status(200).json({
      success: true,
      data: leaderboard
    });
    
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving leaderboard',
      error: error.message
    });
  }
}

export async function getUserRank(req, res) {
  try {
    const userId = req.user.id;
    
    // Get user's karma points
    const userKarma = await KarmaPoints.findOne({ user: userId });
    if (!userKarma) {
      return res.status(404).json({
        success: false,
        message: 'Karma points not found for this user'
      });
    }
    
    // Get rank by counting users with more points
    const rank = await KarmaPoints.countDocuments({
      points: { $gt: userKarma.points },
      userType: userKarma.userType
    }) + 1;
    
    // Get total users of the same type
    const totalUsers = await KarmaPoints.countDocuments({
      userType: userKarma.userType
    });
    
    res.status(200).json({
      success: true,
      data: {
        rank,
        totalUsers,
        percentile: Math.round(((totalUsers - rank) / totalUsers) * 100) || 0,
        ...userKarma.toObject()
      }
    });
    
  } catch (error) {
    console.error('Error getting user rank:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user rank',
      error: error.message
    });
  }
}

// Middleware to award karma points for various actions
export async function awardKarmaPoints(userId, points, category = 'engagement', reason) {
  try {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid user ID for awarding karma points');
      return false;
    }
    
    const userKarma = await KarmaPoints.getOrCreate(userId, 'student'); // Default to student
    await userKarma.addPoints(points, category);
    
    console.log(`Awarded ${points} karma points to user ${userId} for ${reason || category}`);
    return true;
    
  } catch (error) {
    console.error('Error awarding karma points:', error);
    return false;
  }
}
