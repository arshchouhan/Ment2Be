import User from "../models/user.model.js";
import MentorSkill from "../models/mentorSkills.model.js";
import MentorProfile from "../models/mentorProfile.model.js";
import cloudinary from "../config/cloudinary.js";
import karmaService from "../services/karmaService.js";

export async function GetCurrentUser(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const userResponse = user.toObject();

    if (user.role === 'mentor') {
      const mentorSkills = await MentorSkill.find({ mentor: user._id })
        .populate('skill', 'name');
      userResponse.skills = mentorSkills.map(ms => ms.skill);

      const mentorProfile = await MentorProfile.findOne({ user: user._id }).lean();
      userResponse.mentorProfile = mentorProfile || null;
      userResponse.isProfileComplete = mentorProfile?.isProfileComplete ?? false;
    }

    res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user"
    });
  }
}

export async function UpdateCurrentUser(req, res) {
  try {
    const userId = req.user.id;
    const { name, bio, hourlyRate } = req.validatedData;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (hourlyRate !== undefined && user.role === 'mentor') {
      if (hourlyRate < 0) {
        return res.status(400).json({
          success: false,
          message: "Hourly rate cannot be negative"
        });
      }
      user.hourlyRate = hourlyRate;
    }

    await user.save();

    const updatedUser = await User.findById(userId).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found after update"
      });
    }

    const userResponse = updatedUser.toObject();

    if (updatedUser.role === 'mentor') {
      const mentorSkills = await MentorSkill.find({ mentor: userId })
        .populate('skill', 'name');
      userResponse.skills = mentorSkills.map(ms => ms.skill);

      const mentorProfile = await MentorProfile.findOne({ user: userId }).lean();
      userResponse.mentorProfile = mentorProfile || null;
      userResponse.isProfileComplete = mentorProfile?.isProfileComplete ?? false;
    }

    res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error("Update current user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user"
    });
  }
}

export async function UpdateStudentProfile(req, res) {
  try {
    const userId = req.user.id;
    const { bio, skills, interests, goals, linkedIn, github, portfolio } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Handle file upload if exists
    if (req.file) {
      try {
        // Use Cloudinary's upload_stream for buffer uploads
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "mentorlink/profile-pictures",
              width: 500,
              height: 500,
              crop: "fill",
              resource_type: "auto"
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });
        user.profilePicture = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload profile picture",
          error: uploadError.message
        });
      }
    }

    // Update user fields
    if (bio) user.bio = bio;
    if (skills) {
      user.skills = typeof skills === 'string' 
        ? skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : Array.isArray(skills) ? skills : [];
    }
    if (interests) {
      user.interests = typeof interests === 'string'
        ? interests.split(',').map(i => i.trim()).filter(i => i.length > 0)
        : Array.isArray(interests) ? interests : [];
    }
    if (goals) user.goals = goals;
    if (linkedIn) user.socialLinks.linkedIn = linkedIn;
    if (github) user.socialLinks.github = github;
    if (portfolio) user.socialLinks.portfolio = portfolio;

    // Mark profile as complete
    user.isProfileComplete = true;

    await user.save();

    // Call Java microservice to calculate karma points for profile completion
    try {
      console.log('Calling Java microservice to award profile completion karma...');
      const axios = (await import('axios')).default;
      const JAVA_KARMA_API = process.env.JAVA_KARMA_API || 'http://localhost:8081/api/karma';
      
      const response = await axios.get(`${JAVA_KARMA_API}/profile-complete`, {
        timeout: 5000
      });
      
      if (response.data && response.data.karmaPoints) {
        // Award karma points from Java calculation
        user.karmaPoints = (user.karmaPoints || 0) + response.data.karmaPoints;
        await user.save();
        console.log(`Profile completion karma awarded: ${response.data.karmaPoints} points. Total: ${user.karmaPoints}`);
      }
    } catch (karmaError) {
      console.error('Error calling Java karma service:', karmaError.message);
      // Continue even if karma service fails - profile update is still successful
    }

    const updatedUser = await User.findById(userId).select('-password');
    const userResponse = updatedUser.toObject();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userResponse,
      karmaPoints: userResponse.karmaPoints
    });
  } catch (error) {
    console.error("Update student profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message
    });
  }
}
