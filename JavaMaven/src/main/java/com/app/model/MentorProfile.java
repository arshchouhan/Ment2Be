package com.app.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "mentorprofiles")
public class MentorProfile {
    @Id
    private String id;
    
    @DBRef
    private User user;
    
    private String headline;
    
    private String bio;
    
    private List<String> skills;
    
    private Integer experience;
    
    private Double hourlyRate;
    
    private String company;
    
    private String linkedinProfile;
    
    private String githubProfile;
    
    private Boolean isProfileComplete;
    
    private List<Availability> availability;
    
    private String profilePicture;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Availability {
        private String day;
        private List<TimeSlot> slots;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSlot {
        private String start;
        private String end;
    }
}
