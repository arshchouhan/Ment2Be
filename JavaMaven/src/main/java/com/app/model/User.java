package com.app.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    private String role; // mentor, student
    
    private String name;
    
    private String email;
    
    private String password;
    
    private String googleId;
    
    private String bio;
    
    private Double hourlyRate;
    
    private List<String> skills;
    
    private List<String> interests;
    
    private String goals;
    
    private SocialLinks socialLinks;
    
    private String profilePicture;
    
    private Boolean isProfileComplete;
    
    private Integer karmaPoints;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SocialLinks {
        private String linkedIn;
        private String github;
        private String portfolio;
    }
}
