package com.app.controllers;

import com.app.models.Task;
import com.app.services.TaskService;
import com.app.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TaskController {
    
    @Autowired
    private TaskService taskService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * Create a new task
     * POST /api/tasks
     */
    @PostMapping
    public ResponseEntity<?> createTask(
            @RequestBody Task task,
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Extract token from Authorization header
            String token = authHeader.replace("Bearer ", "");
            
            // Extract user ID from token
            String mentorId = jwtUtil.extractUserId(token);
            
            if (mentorId == null || mentorId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new HashMap<String, Object>() {{
                            put("success", false);
                            put("message", "Invalid or expired token");
                        }});
            }
            
            // Create task
            Task createdTask = taskService.createTask(task, mentorId);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new HashMap<String, Object>() {{
                        put("success", true);
                        put("message", "Task created successfully");
                        put("task", createdTask);
                    }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, Object>() {{
                        put("success", false);
                        put("message", "Error creating task: " + e.getMessage());
                    }});
        }
    }
    
    /**
     * Get all tasks for a mentor
     * GET /api/tasks
     */
    @GetMapping
    public ResponseEntity<?> getTasksByMentor(
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Extract token from Authorization header
            String token = authHeader.replace("Bearer ", "");
            
            // Extract user ID from token
            String mentorId = jwtUtil.extractUserId(token);
            
            if (mentorId == null || mentorId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new HashMap<String, Object>() {{
                            put("success", false);
                            put("message", "Invalid or expired token");
                        }});
            }
            
            // Get tasks
            List<Task> tasks = taskService.getTasksByMentor(mentorId);
            
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("tasks", tasks);
                put("total", tasks.size());
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, Object>() {{
                        put("success", false);
                        put("message", "Error fetching tasks: " + e.getMessage());
                    }});
        }
    }
    
    /**
     * Get tasks by mentee
     * GET /api/tasks/mentee/:menteeId
     */
    @GetMapping("/mentee/{menteeId}")
    public ResponseEntity<?> getTasksByMentee(@PathVariable String menteeId) {
        try {
            List<Task> tasks = taskService.getTasksByMentee(menteeId);
            
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("tasks", tasks);
                put("total", tasks.size());
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, Object>() {{
                        put("success", false);
                        put("message", "Error fetching tasks: " + e.getMessage());
                    }});
        }
    }
    
    /**
     * Get task by ID
     * GET /api/tasks/:id
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTaskById(@PathVariable String id) {
        try {
            Optional<Task> task = taskService.getTaskById(id);
            
            if (task.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new HashMap<String, Object>() {{
                            put("success", false);
                            put("message", "Task not found");
                        }});
            }
            
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("task", task.get());
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, Object>() {{
                        put("success", false);
                        put("message", "Error fetching task: " + e.getMessage());
                    }});
        }
    }
    
    /**
     * Update task
     * PUT /api/tasks/:id
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(
            @PathVariable String id,
            @RequestBody Task taskDetails,
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Extract token from Authorization header
            String token = authHeader.replace("Bearer ", "");
            
            // Extract user ID from token
            String userId = jwtUtil.extractUserId(token);
            
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new HashMap<String, Object>() {{
                            put("success", false);
                            put("message", "Invalid or expired token");
                        }});
            }
            
            // Update task
            Task updatedTask = taskService.updateTask(id, taskDetails);
            
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("message", "Task updated successfully");
                put("task", updatedTask);
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, Object>() {{
                        put("success", false);
                        put("message", "Error updating task: " + e.getMessage());
                    }});
        }
    }
    
    /**
     * Delete task
     * DELETE /api/tasks/:id
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Extract token from Authorization header
            String token = authHeader.replace("Bearer ", "");
            
            // Extract user ID from token
            String userId = jwtUtil.extractUserId(token);
            
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new HashMap<String, Object>() {{
                            put("success", false);
                            put("message", "Invalid or expired token");
                        }});
            }
            
            // Delete task
            taskService.deleteTask(id);
            
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("message", "Task deleted successfully");
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, Object>() {{
                        put("success", false);
                        put("message", "Error deleting task: " + e.getMessage());
                    }});
        }
    }
    
    /**
     * Get tasks by status
     * GET /api/tasks/status/:status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getTasksByStatus(@PathVariable String status) {
        try {
            List<Task> tasks = taskService.getTasksByStatus(status);
            
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("tasks", tasks);
                put("total", tasks.size());
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, Object>() {{
                        put("success", false);
                        put("message", "Error fetching tasks: " + e.getMessage());
                    }});
        }
    }
    
    /**
     * Submit task proof (files)
     * POST /api/tasks/submit-proof
     */
    @PostMapping("/submit-proof")
    public ResponseEntity<?> submitTaskProof(
            @RequestBody Map<String, Object> request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Extract token from Authorization header
            String token = authHeader.replace("Bearer ", "");
            
            // Extract user ID from token
            String userId = jwtUtil.extractUserId(token);
            
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new HashMap<String, Object>() {{
                            put("success", false);
                            put("message", "Invalid or expired token");
                        }});
            }
            
            String taskId = (String) request.get("taskId");
            List<Map<String, Object>> files = (List<Map<String, Object>>) request.get("files");
            
            if (taskId == null || taskId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, Object>() {{
                            put("success", false);
                            put("message", "Task ID is required");
                        }});
            }
            
            // Submit proof
            Task updatedTask = taskService.submitTaskProof(taskId, userId, files);
            
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("message", "Proof submitted successfully");
                put("task", updatedTask);
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, Object>() {{
                        put("success", false);
                        put("message", "Error submitting proof: " + e.getMessage());
                    }});
        }
    }
    
    /**
     * Mark task as reviewed (mentor only)
     * PUT /api/tasks/:id/mark-reviewed
     */
    @PutMapping("/{id}/mark-reviewed")
    public ResponseEntity<?> markTaskAsReviewed(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Extract token from Authorization header
            String token = authHeader.replace("Bearer ", "");
            
            // Extract user ID from token
            String mentorId = jwtUtil.extractUserId(token);
            
            if (mentorId == null || mentorId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new HashMap<String, Object>() {{
                            put("success", false);
                            put("message", "Invalid or expired token");
                        }});
            }
            
            // Mark as reviewed
            Task updatedTask = taskService.markTaskAsReviewed(id, mentorId);
            
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("message", "Task marked as completed");
                put("task", updatedTask);
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, Object>() {{
                        put("success", false);
                        put("message", "Error marking task as reviewed: " + e.getMessage());
                    }});
        }
    }
    
    /**
     * DEBUG: Delete all tasks (for testing only)
     * DELETE /api/tasks/debug/delete-all
     */
    @DeleteMapping("/debug/delete-all")
    public ResponseEntity<?> deleteAllTasks() {
        try {
            long deletedCount = taskService.deleteAllTasks();
            
            System.out.println("[TaskController] Deleted " + deletedCount + " tasks");
            
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("message", "Deleted " + deletedCount + " tasks");
                put("deletedCount", deletedCount);
            }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, Object>() {{
                        put("success", false);
                        put("message", "Error deleting tasks: " + e.getMessage());
                    }});
        }
    }
}
