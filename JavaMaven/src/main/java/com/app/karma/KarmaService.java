package com.app.karma;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class KarmaService {
    private static final Logger logger = LoggerFactory.getLogger(KarmaService.class);

    // Karma points for different actions
    private static final int PROFILE_COMPLETE_POINTS = 50;
    private static final int SESSION_COMPLETED_POINTS = 30;
    private static final int MESSAGE_SENT_POINTS = 5;
    private static final int SKILL_ADDED_POINTS = 10;
    private static final int GOAL_SET_POINTS = 15;

    /**
     * Calculate karma points based on profile completion
     */
    public int calculateProfileCompleteKarma() {
        logger.debug("Calculating profile completion karma: {} points", PROFILE_COMPLETE_POINTS);
        return PROFILE_COMPLETE_POINTS;
    }

    /**
     * Calculate karma points for session completion
     */
    public int calculateSessionCompletedKarma() {
        logger.debug("Calculating session completion karma: {} points", SESSION_COMPLETED_POINTS);
        return SESSION_COMPLETED_POINTS;
    }

    /**
     * Calculate karma points for sending a message
     */
    public int calculateMessageSentKarma() {
        logger.debug("Calculating message sent karma: {} points", MESSAGE_SENT_POINTS);
        return MESSAGE_SENT_POINTS;
    }

    /**
     * Calculate karma points for adding a skill
     */
    public int calculateSkillAddedKarma() {
        logger.debug("Calculating skill added karma: {} points", SKILL_ADDED_POINTS);
        return SKILL_ADDED_POINTS;
    }

    /**
     * Calculate karma points for setting a goal
     */
    public int calculateGoalSetKarma() {
        logger.debug("Calculating goal set karma: {} points", GOAL_SET_POINTS);
        return GOAL_SET_POINTS;
    }

    /**
     * Calculate total karma based on user actions
     */
    public int calculateTotalKarma(KarmaCalculationRequest request) {
        logger.info("Starting total karma calculation for request: {}", request);
        int totalKarma = 0;

        if (request.isProfileCompleted()) {
            totalKarma += calculateProfileCompleteKarma();
        }

        if (request.getSessionsCompleted() > 0) {
            totalKarma += calculateSessionCompletedKarma() * request.getSessionsCompleted();
        }

        if (request.getMessagesSent() > 0) {
            totalKarma += calculateMessageSentKarma() * request.getMessagesSent();
        }

        if (request.getSkillsAdded() > 0) {
            totalKarma += calculateSkillAddedKarma() * request.getSkillsAdded();
        }

        if (request.getGoalsSet() > 0) {
            totalKarma += calculateGoalSetKarma() * request.getGoalsSet();
        }

        logger.info("Completed total karma calculation. Total points: {}", totalKarma);
        return totalKarma;
    }

    // Inner class for karma calculation request
    public static class KarmaCalculationRequest {
        @Override
        public String toString() {
            return String.format(
                "KarmaCalculationRequest{profileCompleted=%b, sessionsCompleted=%d, messagesSent=%d, skillsAdded=%d, goalsSet=%d}",
                profileCompleted, sessionsCompleted, messagesSent, skillsAdded, goalsSet
            );
        }
        private boolean profileCompleted;
        private int sessionsCompleted;
        private int messagesSent;
        private int skillsAdded;
        private int goalsSet;

        public KarmaCalculationRequest() {}

        public KarmaCalculationRequest(boolean profileCompleted, int sessionsCompleted, 
                                       int messagesSent, int skillsAdded, int goalsSet) {
            this.profileCompleted = profileCompleted;
            this.sessionsCompleted = sessionsCompleted;
            this.messagesSent = messagesSent;
            this.skillsAdded = skillsAdded;
            this.goalsSet = goalsSet;
        }

        public boolean isProfileCompleted() {
            return profileCompleted;
        }

        public void setProfileCompleted(boolean profileCompleted) {
            this.profileCompleted = profileCompleted;
        }

        public int getSessionsCompleted() {
            return sessionsCompleted;
        }

        public void setSessionsCompleted(int sessionsCompleted) {
            this.sessionsCompleted = sessionsCompleted;
        }

        public int getMessagesSent() {
            return messagesSent;
        }

        public void setMessagesSent(int messagesSent) {
            this.messagesSent = messagesSent;
        }

        public int getSkillsAdded() {
            return skillsAdded;
        }

        public void setSkillsAdded(int skillsAdded) {
            this.skillsAdded = skillsAdded;
        }

        public int getGoalsSet() {
            return goalsSet;
        }

        public void setGoalsSet(int goalsSet) {
            this.goalsSet = goalsSet;
        }
    }
}
