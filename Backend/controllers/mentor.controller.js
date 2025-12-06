import cloudinary from '../config/cloudinary.js';
import User from "../models/user.model.js";
import MentorSkill from "../models/mentorSkills.model.js";
import Session from "../models/Session.model.js";
import Review from "../models/review.model.js";
import MentorProfile from "../models/mentorProfile.model.js";
import axios from 'axios';

export async function CreateOrUpdateMentorProfile(req, res) {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      headline,
      bio,
      experience,
      company,
      linkedinProfile,
      githubProfile,
      hourlyRate,
      skills,
      isProfileComplete = true
    } = req.body;
    const userId = req.user.id;

    let normalizedSkills;
    if (Array.isArray(skills)) {
      normalizedSkills = skills.map((skill) => skill.trim()).filter(Boolean);
    } else if (typeof skills === 'string') {
      normalizedSkills = skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    // Check if profile already exists
    let profile = await MentorProfile.findOne({ user: userId });

    const profileData = {
      user: userId,
      headline,
      bio,
      experience: experience !== undefined ? Number(experience) : undefined,
      company,
      linkedinProfile,
      githubProfile,
      hourlyRate: hourlyRate !== undefined ? Number(hourlyRate) : undefined,
      isProfileComplete
    };

    if (normalizedSkills !== undefined) {
      profileData.skills = normalizedSkills;
    }

    const isNewProfile = !profile;

    if (profile) {
      // Update existing profile
      profile = await MentorProfile.findByIdAndUpdate(
        profile._id,
        { $set: profileData },
        { new: true, runValidators: true }
      );
    } else {
      // Create new profile
      profile = new MentorProfile(profileData);
      await profile.save();
    }

    // If profile is marked as complete and this is a new profile, award karma points
    if (isNewProfile && isProfileComplete) {
      try {
        console.log('Calling Java microservice to award profile completion karma...');
        const JAVA_KARMA_API = process.env.JAVA_KARMA_API || 'http://localhost:8081/api/karma';
        
        const response = await axios.get(`${JAVA_KARMA_API}/profile-complete`, {
          timeout: 5000
        });
        
        if (response.data && response.data.karmaPoints) {
          // Update user's karma points
          const user = await User.findById(userId);
          if (user) {
            user.karmaPoints = (user.karmaPoints || 0) + response.data.karmaPoints;
            await user.save();
            console.log(`Profile completion karma awarded to mentor: ${response.data.karmaPoints} points. Total: ${user.karmaPoints}`);
          }
        }
      } catch (karmaError) {
        console.error('Error calling Java karma service:', karmaError.message);
        // Continue even if karma service fails - profile update is still successful
      }
    }

    res.status(200).json({
      success: true,
      data: profile,
      message: 'Mentor profile saved successfully'
    });

  } catch (error) {
    console.error('Error saving mentor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving mentor profile',
      error: error.message
    });
  }
}

export async function GetAllMentors(req, res) {
  try {
    const { skill, minRate, maxRate, sortBy } = req.query;

    const profileFilters = { isProfileComplete: true };

    if (skill && skill !== 'All Mentors') {
      profileFilters.skills = { $regex: new RegExp(`^${skill}$`, 'i') };
    }

    if (minRate || maxRate) {
      profileFilters.hourlyRate = {};
      if (minRate) profileFilters.hourlyRate.$gte = Number(minRate);
      if (maxRate) profileFilters.hourlyRate.$lte = Number(maxRate);
    }

    const profiles = await MentorProfile.find(profileFilters)
      .populate('user', 'name email role createdAt');

    const mentors = await Promise.all(
      profiles.map(async (profile) => {
        const mentorId = profile.user?._id;

        const sessions = await Session.find({ mentor: mentorId, status: 'completed' }).select('_id');
        const sessionIds = sessions.map((s) => s._id);

        let averageRating = 0;
        let totalReviews = 0;

        if (sessionIds.length) {
          const reviews = await Review.find({ session: { $in: sessionIds } }).select('rating');
          totalReviews = reviews.length;
          const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
          averageRating = totalReviews ? Number((totalRating / totalReviews).toFixed(2)) : 0;
        }

        return {
          _id: mentorId,
          name: profile.user?.name,
          email: profile.user?.email,
          role: profile.user?.role,
          headline: profile.headline,
          company: profile.company,
          experience: profile.experience,
          bio: profile.bio,
          hourlyRate: profile.hourlyRate,
          profilePicture: profile.profilePicture || null,
          isOnline: false,
          skills: profile.skills,
          averageRating,
          totalReviews,
          mentorProfile: profile,
        };
      })
    );

    if (sortBy === 'rating') {
      mentors.sort((a, b) => b.averageRating - a.averageRating);
    } else if (sortBy === 'price-low') {
      mentors.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
    } else if (sortBy === 'price-high') {
      mentors.sort((a, b) => (b.hourlyRate || 0) - (a.hourlyRate || 0));
    }

    res.status(200).json({
      success: true,
      count: mentors.length,
      mentors,
    });
  } catch (error) {
    console.error("Get all mentors error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch mentors"
    });
  }
}

export async function GetMentorById(req, res) {
  try {
    const { id } = req.params;

    // Find mentor profile with user details
    const profile = await MentorProfile.findOne({ user: id })
      .populate('user', 'name email role createdAt');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found'
      });
    }

    // Get completed sessions for this mentor
    const sessions = await Session.find({ 
      mentor: id, 
      status: 'completed' 
    }).select('_id');
    
    const sessionIds = sessions.map(s => s._id);

    // Calculate average rating
    let averageRating = 0;
    let totalReviews = 0;

    if (sessionIds.length > 0) {
      const reviews = await Review.find({ session: { $in: sessionIds } });
      totalReviews = reviews.length;
      const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      averageRating = totalReviews ? Number((totalRating / totalReviews).toFixed(2)) : 0;
    }

    // Prepare response
    const mentorData = {
      _id: profile.user._id,
      name: profile.user.name,
      email: profile.user.email,
      role: profile.user.role,
      headline: profile.headline,
      company: profile.company,
      experience: profile.experience,
      bio: profile.bio,
      hourlyRate: profile.hourlyRate,
      profilePicture: profile.profilePicture || null,
      skills: profile.skills,
      linkedinProfile: profile.linkedinProfile,
      githubProfile: profile.githubProfile,
      averageRating,
      totalReviews,
      isOnline: false,
      createdAt: profile.user.createdAt
    };

    res.status(200).json({
      success: true,
      mentor: mentorData
    });
  } catch (error) {
    console.error('Get mentor by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentor details',
      error: error.message
    });
  }
}

export async function GetMentorsBySkill(req, res) {
  try {
    const { skillId } = req.params;
    
    // Find all mentor profiles that have the specified skill
    const profiles = await MentorProfile.find({
      skills: { $in: [skillId] },
      isProfileComplete: true
    }).populate('user', 'name email role');

    if (!profiles || profiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No mentors found with the specified skill'
      });
    }

    // Get mentor details with ratings
    const mentors = await Promise.all(
      profiles.map(async (profile) => {
        const mentorId = profile.user?._id;
        
        // Get completed sessions for rating calculation
        const sessions = await Session.find({ 
          mentor: mentorId, 
          status: 'completed' 
        }).select('_id');
        
        const sessionIds = sessions.map(s => s._id);
        let averageRating = 0;
        let totalReviews = 0;

        if (sessionIds.length > 0) {
          const reviews = await Review.find({ session: { $in: sessionIds } });
          totalReviews = reviews.length;
          const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
          averageRating = totalReviews ? Number((totalRating / totalReviews).toFixed(2)) : 0;
        }

        return {
          _id: mentorId,
          name: profile.user?.name,
          email: profile.user?.email,
          role: profile.user?.role,
          headline: profile.headline,
          company: profile.company,
          experience: profile.experience,
          hourlyRate: profile.hourlyRate,
          profilePicture: profile.profilePicture || null,
          skills: profile.skills,
          averageRating,
          totalReviews,
          isOnline: false
        };
      })
    );

    res.status(200).json({
      success: true,
      count: mentors.length,
      mentors
    });
  } catch (error) {
    console.error('Get mentors by skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentors by skill',
      error: error.message
    });
  }
}

export async function UploadMentorPhoto(req, res) {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Use the authenticated user's ID for the profile lookup
    const userId = req.user.id;

    // Find the mentor profile for the authenticated user
    const mentorProfile = await MentorProfile.findOne({ user: userId })
      .populate('user', 'id role');
      
    if (!mentorProfile) {
      console.log('Mentor profile not found for user ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found. Please complete your mentor profile first.'
      });
    }

    // Since we're using the authenticated user's ID, they are always the owner
    // No additional authorization check needed

    // Convert buffer to base64 for Cloudinary
    const base64String = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder: 'mentor-profiles',
      width: 500,
      height: 500,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    });

    // Update mentor's profile with the new photo URL
    const updatedProfile = await MentorProfile.findOneAndUpdate(
      { user: userId },
      { profilePicture: result.secure_url },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      photoUrl: result.secure_url,
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Upload mentor photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile photo',
      error: error.message
    });
  }
}

export async function RemoveMentorPhoto(req, res) {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Use the authenticated user's ID for the profile lookup
    const userId = req.user.id;

    // Find and update the mentor profile to remove the photo
    const updatedProfile = await MentorProfile.findOneAndUpdate(
      { user: userId },
      { profilePicture: null },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile photo removed successfully',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Remove mentor photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing profile photo',
      error: error.message
    });
  }
}

export async function GetCarouselMentors(req, res) {
  try {
    // Get top 6 mentors with highest ratings
    const profiles = await MentorProfile.find({ isProfileComplete: true })
      .populate('user', 'name email role')
      .limit(6);

    // Get mentor details with ratings
    const mentors = await Promise.all(
      profiles.map(async (profile) => {
        const mentorId = profile.user?._id;
        
        // Get completed sessions for rating calculation
        const sessions = await Session.find({ 
          mentor: mentorId, 
          status: 'completed' 
        }).select('_id');
        
        const sessionIds = sessions.map(s => s._id);
        let averageRating = 0;
        let totalReviews = 0;

        if (sessionIds.length > 0) {
          const reviews = await Review.find({ session: { $in: sessionIds } });
          totalReviews = reviews.length;
          const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
          averageRating = totalReviews ? Number((totalRating / totalReviews).toFixed(2)) : 0;
        }

        return {
          _id: mentorId,
          name: profile.user?.name,
          headline: profile.headline,
          company: profile.company,
          profilePicture: profile.profilePicture || null,
          skills: profile.skills.slice(0, 3), // Only show top 3 skills in carousel
          averageRating,
          totalReviews
        };
      })
    );

    // Sort by average rating in descending order
    mentors.sort((a, b) => b.averageRating - a.averageRating);

    res.status(200).json({
      success: true,
      mentors
    });
  } catch (error) {
    console.error('Get carousel mentors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured mentors',
      error: error.message
    });
  }
}