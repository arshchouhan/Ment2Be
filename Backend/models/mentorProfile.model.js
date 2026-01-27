import mongoose from 'mongoose';

const mentorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    headline: {
      type: String,
      required: [true, 'Headline is required'],
      trim: true,
      maxlength: [120, 'Headline cannot be more than 120 characters']
    },
    bio: {
      type: String,
      required: [true, 'Bio is required'],
      trim: true,
      maxlength: [4000, 'Bio cannot be more than 4000 characters']
    },
    skills: [{
      type: String,
      trim: true,
      required: [true, 'At least one skill is required']
    }],
    experience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative'],
      max: [60, 'Experience seems too high']
    },
    hourlyRate: {
      type: Number,
      required: false,
      min: [0, 'Hourly rate cannot be negative']
    },
    company: {
      type: String,
      trim: true,
      maxlength: [200, 'Company name cannot be more than 200 characters']
    },
    linkedinProfile: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/.*$/, 'Please provide a valid LinkedIn URL']
    },
    githubProfile: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?github\.com\/.*$/, 'Please provide a valid GitHub URL']
    },
    isProfileComplete: {
      type: Boolean,
      default: false
    },
    availability: {
      type: [{
        day: {
          type: String,
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          required: true
        },
        slots: [{
          start: { type: String, required: true },
          end: { type: String, required: true }
        }]
      }],
      default: []
    },
    profilePicture: {
      type: String,
      trim: true,
      default: null
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot be more than 100 characters']
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for faster querying
mentorProfileSchema.index({ user: 1 });
mentorProfileSchema.index({ skills: 1 });

// Add a method to check if profile is complete
mentorProfileSchema.methods.isComplete = function() {
  return this.isProfileComplete && 
         this.headline && 
         this.bio && 
         this.skills.length > 0 && 
         this.experience !== undefined;
};

const MentorProfile = mongoose.model('MentorProfile', mentorProfileSchema);

export default MentorProfile;
