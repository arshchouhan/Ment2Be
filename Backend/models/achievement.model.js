import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'FIRST_SESSION',
            'SESSIONS_5',
            'SESSIONS_10',
            'FORUM_EXPERT',
            'TOP_RATED',
            'KARMA_LEVEL_5',
            'PROFILE_COMPLETE'
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String, // String identifier for frontend icon (Lucide/Fi)
        required: true
    },
    badgeColor: {
        type: String,
        default: 'indigo'
    },
    pointsAwarded: {
        type: Number,
        default: 0
    },
    unlockedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure a user can only earn a specific achievement type once
achievementSchema.index({ user: 1, type: 1 }, { unique: true });

const Achievement = mongoose.model('Achievement', achievementSchema);

export default Achievement;
