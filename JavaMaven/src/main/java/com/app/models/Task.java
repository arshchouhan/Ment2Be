package com.app.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "tasks")
public class Task {
    @Id
    private String id;
    
    private String title;
    private String description;
    private String instructions;
    private String category;
    private String priority;
    private LocalDateTime dueDate;
    private String estimatedTime;
    private String resources;
    private boolean notifyMentee;
    private boolean requireSubmission;
    private String status;
    
    private String mentorId;
    private String menteeId;
    private String menteeName; // Mentee's real name
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> attachments;
    
    // Constructors
    public Task() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = "not-started";
    }
    
    public Task(String title, String description, String mentorId, String menteeId) {
        this();
        this.title = title;
        this.description = description;
        this.mentorId = mentorId;
        this.menteeId = menteeId;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getInstructions() {
        return instructions;
    }
    
    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getPriority() {
        return priority;
    }
    
    public void setPriority(String priority) {
        this.priority = priority;
    }
    
    public LocalDateTime getDueDate() {
        return dueDate;
    }
    
    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }
    
    public String getEstimatedTime() {
        return estimatedTime;
    }
    
    public void setEstimatedTime(String estimatedTime) {
        this.estimatedTime = estimatedTime;
    }
    
    public String getResources() {
        return resources;
    }
    
    public void setResources(String resources) {
        this.resources = resources;
    }
    
    public boolean isNotifyMentee() {
        return notifyMentee;
    }
    
    public void setNotifyMentee(boolean notifyMentee) {
        this.notifyMentee = notifyMentee;
    }
    
    public boolean isRequireSubmission() {
        return requireSubmission;
    }
    
    public void setRequireSubmission(boolean requireSubmission) {
        this.requireSubmission = requireSubmission;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getMentorId() {
        return mentorId;
    }
    
    public void setMentorId(String mentorId) {
        this.mentorId = mentorId;
    }
    
    public String getMenteeId() {
        return menteeId;
    }
    
    public void setMenteeId(String menteeId) {
        this.menteeId = menteeId;
    }
    
    public String getMenteeName() {
        return menteeName;
    }
    
    public void setMenteeName(String menteeName) {
        this.menteeName = menteeName;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public List<String> getAttachments() {
        return attachments;
    }
    
    public void setAttachments(List<String> attachments) {
        this.attachments = attachments;
    }
}
