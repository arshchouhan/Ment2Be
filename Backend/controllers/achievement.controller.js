import Achievement from '../models/achievement.model.js';
import Booking from '../models/booking.model.js';
import KarmaPoints from '../models/karmaPoints.model.js';
import { getIO } from '../config/socket.js';

export const getAchievements = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const achievements = await Achievement.find({ user: userId }).sort({ unlockedAt: -1 });

        res.status(200).json({
            success: true,
            data: achievements
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch achievements' });
    }
};

// Helper to check and award achievements
export const checkAchievements = async (userId) => {
    try {
        const io = getIO();
        const achievementsToAward = [];

        // 1. Check Session milestones
        const sessionCount = await Booking.countDocuments({
            $or: [{ mentor: userId }, { student: userId }],
            status: 'completed'
        });

        if (sessionCount >= 1) {
            achievementsToAward.push({
                type: 'FIRST_SESSION',
                title: 'Ice Breaker',
                description: 'Completed your first mentoring session!',
                icon: 'FiZap',
                badgeColor: 'blue'
            });
        }

        if (sessionCount >= 5) {
            achievementsToAward.push({
                type: 'SESSIONS_5',
                title: 'Steady Progress',
                description: 'Completed 5 mentoring sessions!',
                icon: 'FiTarget',
                badgeColor: 'green'
            });
        }

        // 2. Check Karma Levels
        const karma = await KarmaPoints.findOne({ user: userId });
        if (karma && karma.level >= 5) {
            achievementsToAward.push({
                type: 'KAR_LEVEL_5',
                title: 'Community Pillar',
                description: 'Reached Karma Level 5!',
                icon: 'FiAward',
                badgeColor: 'purple'
            });
        }

        for (const ach of achievementsToAward) {
            const existing = await Achievement.findOne({ user: userId, type: ach.type });
            if (!existing) {
                const newAchievement = await Achievement.create({
                    user: userId,
                    ...ach
                });

                // Notify user via Socket.io
                if (io) {
                    io.to(userId.toString()).emit('achievement-unlocked', newAchievement);
                    console.log(`Achievement Emitted to ${userId}: ${ach.title}`);
                }
            }
        }
    } catch (error) {
        console.error('Achievement Logic Error:', error);
    }
};
