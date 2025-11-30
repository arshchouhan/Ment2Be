import User from "../models/user.model.js";
import MentorSkill from "../models/mentorSkills.model.js";
import Session from "../models/Session.model.js";
import Review from "../models/review.model.js";
import MentorProfile from "../models/mentorProfile.model.js";

export async function CreateOrUpdateMentorProfile(req, res) {
  try {
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
    const userId = req.user.id; // Assuming you have authentication middleware that adds user to req

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

// Keep other functions as they are
export async function GetMentorById(req, res) {
  // ... existing code
}

export async function GetMentorsBySkill(req, res) {
  // ... existing code
}

export async function GetCarouselMentors(req, res) {
  // ... existing code
}