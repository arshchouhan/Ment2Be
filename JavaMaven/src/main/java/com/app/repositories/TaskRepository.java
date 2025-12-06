package com.app.repositories;

import com.app.models.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    
    // Find all tasks for a mentor
    List<Task> findByMentorId(String mentorId);
    
    // Find all tasks for a mentee
    List<Task> findByMenteeId(String menteeId);
    
    // Find tasks by mentor and mentee
    List<Task> findByMentorIdAndMenteeId(String mentorId, String menteeId);
    
    // Find tasks by status
    List<Task> findByStatus(String status);
    
    // Find tasks by mentor and status
    List<Task> findByMentorIdAndStatus(String mentorId, String status);
    
    // Find tasks by priority
    List<Task> findByPriority(String priority);
    
    // Find tasks by category
    List<Task> findByCategory(String category);
    
    // Find tasks by mentor and category
    List<Task> findByMentorIdAndCategory(String mentorId, String category);
    
    // Count tasks by mentor
    long countByMentorId(String mentorId);
    
    // Count tasks by mentee
    long countByMenteeId(String menteeId);
    
    // Count tasks by mentor and status
    long countByMentorIdAndStatus(String mentorId, String status);
}
