package com.app.services;

import com.app.models.Task;
import com.app.model.User;
import com.app.repositories.TaskRepository;
import com.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Create a new task
     */
    public Task createTask(Task task, String mentorId) {
        try {
            // Set mentor ID
            task.setMentorId(mentorId);
            task.setCreatedAt(LocalDateTime.now());
            task.setUpdatedAt(LocalDateTime.now());
            task.setStatus("not-started");
            
            // Fetch and set mentee name
            if (task.getMenteeId() != null && !task.getMenteeId().isEmpty()) {
                Optional<User> mentee = userRepository.findById(task.getMenteeId());
                if (mentee.isPresent()) {
                    task.setMenteeName(mentee.get().getName());
                }
            }
            
            return taskRepository.save(task);
        } catch (Exception e) {
            throw new RuntimeException("Error creating task: " + e.getMessage());
        }
    }
    
    /**
     * Get all tasks for a mentor
     */
    public List<Task> getTasksByMentor(String mentorId) {
        try {
            List<Task> tasks = taskRepository.findByMentorId(mentorId);
            // Fetch mentee names for all tasks
            for (Task task : tasks) {
                if (task.getMenteeId() != null && !task.getMenteeId().isEmpty()) {
                    Optional<User> mentee = userRepository.findById(task.getMenteeId());
                    if (mentee.isPresent()) {
                        task.setMenteeName(mentee.get().getName());
                    }
                }
            }
            return tasks;
        } catch (Exception e) {
            throw new RuntimeException("Error fetching tasks: " + e.getMessage());
        }
    }
    
    /**
     * Get all tasks for a mentee
     */
    public List<Task> getTasksByMentee(String menteeId) {
        try {
            return taskRepository.findByMenteeId(menteeId);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching tasks: " + e.getMessage());
        }
    }
    
    /**
     * Get tasks by mentor and mentee
     */
    public List<Task> getTasksByMentorAndMentee(String mentorId, String menteeId) {
        try {
            return taskRepository.findByMentorIdAndMenteeId(mentorId, menteeId);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching tasks: " + e.getMessage());
        }
    }
    
    /**
     * Get tasks by status
     */
    public List<Task> getTasksByStatus(String status) {
        try {
            return taskRepository.findByStatus(status);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching tasks: " + e.getMessage());
        }
    }
    
    /**
     * Get tasks by mentor and status
     */
    public List<Task> getTasksByMentorAndStatus(String mentorId, String status) {
        try {
            return taskRepository.findByMentorIdAndStatus(mentorId, status);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching tasks: " + e.getMessage());
        }
    }
    
    /**
     * Get task by ID
     */
    public Optional<Task> getTaskById(String taskId) {
        try {
            return taskRepository.findById(taskId);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching task: " + e.getMessage());
        }
    }
    
    /**
     * Update task
     */
    public Task updateTask(String taskId, Task taskDetails) {
        try {
            Optional<Task> task = taskRepository.findById(taskId);
            if (task.isEmpty()) {
                throw new RuntimeException("Task not found");
            }
            
            Task existingTask = task.get();
            
            if (taskDetails.getTitle() != null) {
                existingTask.setTitle(taskDetails.getTitle());
            }
            if (taskDetails.getDescription() != null) {
                existingTask.setDescription(taskDetails.getDescription());
            }
            if (taskDetails.getInstructions() != null) {
                existingTask.setInstructions(taskDetails.getInstructions());
            }
            if (taskDetails.getCategory() != null) {
                existingTask.setCategory(taskDetails.getCategory());
            }
            if (taskDetails.getPriority() != null) {
                existingTask.setPriority(taskDetails.getPriority());
            }
            if (taskDetails.getDueDate() != null) {
                existingTask.setDueDate(taskDetails.getDueDate());
            }
            if (taskDetails.getEstimatedTime() != null) {
                existingTask.setEstimatedTime(taskDetails.getEstimatedTime());
            }
            if (taskDetails.getResources() != null) {
                existingTask.setResources(taskDetails.getResources());
            }
            if (taskDetails.getStatus() != null) {
                existingTask.setStatus(taskDetails.getStatus());
            }
            
            existingTask.setUpdatedAt(LocalDateTime.now());
            
            return taskRepository.save(existingTask);
        } catch (Exception e) {
            throw new RuntimeException("Error updating task: " + e.getMessage());
        }
    }
    
    /**
     * Delete task
     */
    public void deleteTask(String taskId) {
        try {
            taskRepository.deleteById(taskId);
        } catch (Exception e) {
            throw new RuntimeException("Error deleting task: " + e.getMessage());
        }
    }
    
    /**
     * Count tasks by mentor
     */
    public long countTasksByMentor(String mentorId) {
        try {
            return taskRepository.countByMentorId(mentorId);
        } catch (Exception e) {
            throw new RuntimeException("Error counting tasks: " + e.getMessage());
        }
    }
    
    /**
     * Count tasks by mentee
     */
    public long countTasksByMentee(String menteeId) {
        try {
            return taskRepository.countByMenteeId(menteeId);
        } catch (Exception e) {
            throw new RuntimeException("Error counting tasks: " + e.getMessage());
        }
    }
    
    /**
     * Delete all tasks (for testing/debugging only)
     */
    public long deleteAllTasks() {
        try {
            long count = taskRepository.count();
            taskRepository.deleteAll();
            System.out.println("[TaskService] Deleted all " + count + " tasks");
            return count;
        } catch (Exception e) {
            throw new RuntimeException("Error deleting all tasks: " + e.getMessage());
        }
    }
}
