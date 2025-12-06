/**
 * Integration module for calling the Java Mentor Karma Microservice
 * from the Node.js backend
 */

import axios from 'axios';

// Configuration
const KARMA_SERVICE_URL = process.env.KARMA_SERVICE_URL || 'http://localhost:8081/api/karma';

/**
 * Calculate karma points for a mentor
 * @param {Object} mentorData - Mentor profile data
 * @returns {Promise<Object>} Karma calculation result
 */
async function calculateMentorKarma(mentorData) {
    try {
        const requestPayload = {
            mentorProfile: {
                mentorId: mentorData.mentorId || mentorData._id?.toString(),
                name: mentorData.name || `${mentorData.firstName} ${mentorData.lastName}`,
                email: mentorData.email,

                // Profile Completion
                profileCompletionPercentage: calculateProfileCompletion(mentorData),

                // Session Metrics
                totalSessionsAttended: mentorData.sessionsAttended || 0,
                totalSessionsScheduled: mentorData.sessionsScheduled || 0,
                sessionsCompletedOnTime: mentorData.sessionsOnTime || 0,

                // Task Metrics
                tasksProvided: mentorData.tasksProvided || 0,
                tasksCompleted: mentorData.tasksCompleted || 0,
                averageTaskQuality: mentorData.averageTaskQuality || 0,

                // Mentee Metrics
                numberOfMentees: mentorData.totalMentees || 0,
                activeMentees: mentorData.activeMentees || 0,
                successfulMentees: mentorData.successfulMentees || 0,

                // Rating Metrics
                averageRating: mentorData.averageRating || 0,
                totalReviews: mentorData.totalReviews || 0,
                recentRatings: mentorData.recentRatings || [],

                // Response Time (in hours)
                averageResponseTime: mentorData.averageResponseTime || 24,

                // Consistency Metrics
                consecutiveWeeksActive: mentorData.consecutiveWeeksActive || 0,
                attendanceRate: mentorData.attendanceRate || 0,

                // Feedback Quality
                feedbackQualityScore: mentorData.feedbackQualityScore || 0,
                feedbacksProvided: mentorData.feedbacksProvided || 0,

                // Availability
                hoursAvailablePerWeek: mentorData.hoursAvailablePerWeek || 0,
                isCurrentlyAcceptingMentees: mentorData.isAcceptingMentees || false,

                // Expertise
                expertiseAreas: mentorData.expertiseAreas || [],
                yearsOfExperience: mentorData.yearsOfExperience || 0,

                // Additional Metrics
                helpfulResourcesShared: mentorData.resourcesShared || 0,
                communityContributions: mentorData.communityContributions || 0,
                hasCertifications: mentorData.hasCertifications || false
            },
            includeRanking: true,
            includeDetailedBreakdown: true,
            includeSuggestions: true
        };

        const response = await axios.post(
            `${KARMA_SERVICE_URL}/calculate/karma`,
            requestPayload,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            }
        );

        if (response.data.success) {
            return {
                success: true,
                data: response.data.karmaResult
            };
        } else {
            throw new Error(response.data.error || 'Karma calculation failed');
        }

    } catch (error) {
        console.error('Error calculating mentor karma:', error.message);

        // Return a default karma result if service is unavailable
        return {
            success: false,
            error: error.message,
            data: {
                totalKarmaPoints: 0,
                performanceLevel: 'UNAVAILABLE',
                message: 'Karma service temporarily unavailable'
            }
        };
    }
}

/**
 * Calculate profile completion percentage
 * @param {Object} mentorData - Mentor data
 * @returns {number} Completion percentage (0-100)
 */
function calculateProfileCompletion(mentorData) {
    const fields = [
        mentorData.name || mentorData.firstName,
        mentorData.email,
        mentorData.bio,
        mentorData.expertiseAreas?.length > 0,
        mentorData.profilePicture,
        mentorData.linkedIn,
        mentorData.yearsOfExperience,
        mentorData.education,
        mentorData.currentRole,
        mentorData.company
    ];

    const completedFields = fields.filter(field => field).length;
    return (completedFields / fields.length) * 100;
}

/**
 * Get karma calculation weights from the service
 * @returns {Promise<Object>} Karma weights configuration
 */
async function getKarmaWeights() {
    try {
        const response = await axios.get(`${KARMA_SERVICE_URL}/calculate/weights`);
        return response.data;
    } catch (error) {
        console.error('Error fetching karma weights:', error.message);
        return null;
    }
}

/**
 * Get performance level thresholds
 * @returns {Promise<Object>} Performance level definitions
 */
async function getPerformanceLevels() {
    try {
        const response = await axios.get(`${KARMA_SERVICE_URL}/calculate/levels`);
        return response.data;
    } catch (error) {
        console.error('Error fetching performance levels:', error.message);
        return null;
    }
}

/**
 * Health check for the karma service
 * @returns {Promise<boolean>} Service health status
 */
async function checkKarmaServiceHealth() {
    try {
        const response = await axios.get(`${KARMA_SERVICE_URL}/calculate/health`, {
            timeout: 5000
        });
        return response.status === 200;
    } catch (error) {
        console.error('Karma service health check failed:', error.message);
        return false;
    }
}

/**
 * Batch calculate karma for multiple mentors
 * @param {Array<Object>} mentors - Array of mentor data objects
 * @returns {Promise<Array<Object>>} Array of karma results
 */
async function batchCalculateKarma(mentors) {
    const results = await Promise.allSettled(
        mentors.map(mentor => calculateMentorKarma(mentor))
    );

    return results.map((result, index) => ({
        mentorId: mentors[index].mentorId || mentors[index]._id?.toString(),
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value.data : null,
        error: result.status === 'rejected' ? result.reason.message : null
    }));
}

/**
 * Calculate karma points for a student
 * @param {Object} studentData - Student profile data
 * @returns {Promise<Object>} Karma calculation result
 */
async function calculateStudentKarma(studentData) {
    try {
        const requestPayload = {
            studentProfile: {
                studentId: studentData.studentId || studentData._id?.toString(),
                name: studentData.name,
                email: studentData.email,

                // Profile Completion
                profileCompletionPercentage: calculateStudentProfileCompletion(studentData),

                // Learning Metrics
                sessionsAttended: studentData.sessionsAttended || 0,
                sessionsCompleted: studentData.sessionsCompleted || 0,
                averageSessionRating: studentData.averageSessionRating || 0,

                // Engagement Metrics
                tasksCompleted: studentData.tasksCompleted || 0,
                projectsSubmitted: studentData.projectsSubmitted || 0,
                averageProjectQuality: studentData.averageProjectQuality || 0,

                // Learning Progress
                skillsLearned: studentData.skills?.length || 0,
                certificationsEarned: studentData.certificationsEarned || 0,

                // Participation
                questionsAsked: studentData.questionsAsked || 0,
                resourcesShared: studentData.resourcesShared || 0,
                communityContributions: studentData.communityContributions || 0,

                // Consistency
                consecutiveWeeksActive: studentData.consecutiveWeeksActive || 0,
                attendanceRate: studentData.attendanceRate || 0,

                // Goals
                goalsSet: studentData.goalsSet || 0,
                goalsCompleted: studentData.goalsCompleted || 0,

                // Feedback
                feedbackReceived: studentData.feedbackReceived || 0,
                averageFeedbackRating: studentData.averageFeedbackRating || 0
            },
            includeRanking: true,
            includeDetailedBreakdown: true,
            includeSuggestions: true
        };

        const response = await axios.post(
            `${KARMA_SERVICE_URL}/calculate/student-karma`,
            requestPayload,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            }
        );

        if (response.data.success) {
            return {
                success: true,
                data: response.data.karmaResult
            };
        } else {
            throw new Error(response.data.error || 'Student karma calculation failed');
        }

    } catch (error) {
        console.error('Error calculating student karma:', error.message);

        // Return a default karma result if service is unavailable
        return {
            success: false,
            error: error.message,
            data: {
                totalKarmaPoints: 0,
                performanceLevel: 'UNAVAILABLE',
                message: 'Karma service temporarily unavailable'
            }
        };
    }
}

/**
 * Calculate student profile completion percentage
 * @param {Object} studentData - Student data
 * @returns {number} Completion percentage (0-100)
 */
function calculateStudentProfileCompletion(studentData) {
    const fields = [
        studentData.name,
        studentData.email,
        studentData.bio,
        studentData.skills?.length > 0,
        studentData.profilePicture,
        studentData.interests?.length > 0,
        studentData.goals,
        studentData.socialLinks?.linkedIn,
        studentData.socialLinks?.github
    ];

    const completedFields = fields.filter(field => field).length;
    return (completedFields / fields.length) * 100;
}

export default {
    calculateMentorKarma,
    calculateStudentKarma,
    getKarmaWeights,
    getPerformanceLevels,
    checkKarmaServiceHealth,
    batchCalculateKarma
};
