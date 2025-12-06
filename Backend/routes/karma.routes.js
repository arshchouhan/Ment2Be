/**
 * API routes for integrating karma calculation with Java microservice
 */

import express from 'express';
import karmaService from '../services/karmaService.js';
import User from '../models/user.model.js';

const router = express.Router();

/**
 * GET /api/mentor/:mentorId/karma
 * Calculate and return karma for a specific mentor
 */
router.get('/mentor/:mentorId/karma', async (req, res) => {
    try {
        const { mentorId } = req.params;

        // Fetch mentor data from database
        const mentor = await User.findById(mentorId);

        if (!mentor || mentor.role !== 'mentor') {
            return res.status(404).json({
                success: false,
                message: 'Mentor not found'
            });
        }

        // Calculate karma using Java microservice
        const karmaResult = await karmaService.calculateMentorKarma(mentor);

        if (karmaResult.success) {
            // Optionally save karma to database
            mentor.karmaPoints = karmaResult.data.totalKarmaPoints;
            mentor.performanceLevel = karmaResult.data.performanceLevel;
            mentor.lastKarmaUpdate = new Date();
            await mentor.save();

            return res.json({
                success: true,
                data: karmaResult.data
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Failed to calculate karma',
                error: karmaResult.error
            });
        }

    } catch (error) {
        console.error('Error in karma calculation route:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

/**
 * GET /api/mentors/karma/leaderboard
 * Get karma leaderboard for all mentors
 */
router.get('/mentors/karma/leaderboard', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        // Fetch all mentors
        const mentors = await User.find({ role: 'mentor' }).limit(100);

        // Calculate karma for all mentors
        const karmaResults = await karmaService.batchCalculateKarma(mentors);

        // Sort by karma points
        const leaderboard = karmaResults
            .filter(result => result.success)
            .sort((a, b) => b.data.totalKarmaPoints - a.data.totalKarmaPoints)
            .slice(0, limit)
            .map((result, index) => ({
                rank: index + 1,
                mentorId: result.mentorId,
                mentorName: result.data.mentorName,
                karmaPoints: result.data.totalKarmaPoints,
                performanceLevel: result.data.performanceLevel,
                strengths: result.data.strengths
            }));

        res.json({
            success: true,
            data: leaderboard
        });

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leaderboard',
            error: error.message
        });
    }
});

/**
 * GET /api/karma/config
 * Get karma calculation configuration
 */
router.get('/config', async (req, res) => {
    try {
        const [weights, levels] = await Promise.all([
            karmaService.getKarmaWeights(),
            karmaService.getPerformanceLevels()
        ]);

        res.json({
            success: true,
            data: {
                weights,
                levels
            }
        });

    } catch (error) {
        console.error('Error fetching karma config:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch configuration',
            error: error.message
        });
    }
});

/**
 * GET /api/karma/health
 * Check health of karma calculation service
 */
router.get('/health', async (req, res) => {
    try {
        const isHealthy = await karmaService.checkKarmaServiceHealth();

        res.json({
            success: true,
            healthy: isHealthy,
            service: 'mentor-karma-service',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            healthy: false,
            error: error.message
        });
    }
});

/**
 * POST /api/mentor/karma/refresh
 * Manually refresh karma for the authenticated mentor
 */
router.post('/mentor/karma/refresh', async (req, res) => {
    try {
        // Assuming you have authentication middleware
        const mentorId = req.user.id;

        const mentor = await User.findById(mentorId);

        if (!mentor || mentor.role !== 'mentor') {
            return res.status(403).json({
                success: false,
                message: 'Only mentors can refresh karma'
            });
        }

        const karmaResult = await karmaService.calculateMentorKarma(mentor);

        if (karmaResult.success) {
            mentor.karmaPoints = karmaResult.data.totalKarmaPoints;
            mentor.performanceLevel = karmaResult.data.performanceLevel;
            mentor.lastKarmaUpdate = new Date();
            await mentor.save();

            return res.json({
                success: true,
                message: 'Karma refreshed successfully',
                data: karmaResult.data
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Failed to refresh karma',
                error: karmaResult.error
            });
        }

    } catch (error) {
        console.error('Error refreshing karma:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

export default router;
