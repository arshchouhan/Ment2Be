package com.app.controllers;

import com.app.utils.JwtUtil;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/journal")
@CrossOrigin(origins = "*")
public class JournalController {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/sessions/completed")
    public ResponseEntity<?> getCompletedSessions(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String token = extractBearerToken(authHeader);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Missing or invalid Authorization token"
                ));
            }

            String userId = jwtUtil.extractUserId(token);
            String role = jwtUtil.extractUserRole(token);

            if (userId == null || userId.isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Invalid or expired token"
                ));
            }

            boolean isMentor = "mentor".equalsIgnoreCase(role);
            ObjectId userObjectId = new ObjectId(userId);

            List<String> completedStatuses = Arrays.asList("confirmed", "completed", "finished", "ended");

            List<Document> pipeline = new ArrayList<>();
            pipeline.add(new Document("$match", new Document()
                .append(isMentor ? "mentor" : "student", userObjectId)
                .append("status", new Document("$in", completedStatuses))
            ));

            pipeline.add(new Document("$sort", new Document("sessionDate", -1)));

            // Lookup mentor & student names
            pipeline.add(new Document("$lookup", new Document()
                .append("from", "users")
                .append("localField", "mentor")
                .append("foreignField", "_id")
                .append("as", "mentorUser")
            ));
            pipeline.add(new Document("$lookup", new Document()
                .append("from", "users")
                .append("localField", "student")
                .append("foreignField", "_id")
                .append("as", "studentUser")
            ));

            pipeline.add(new Document("$project", new Document()
                .append("_id", 1)
                .append("sessionId", "$_id")
                .append("mentorName", new Document("$ifNull", Arrays.asList(new Document("$arrayElemAt", Arrays.asList("$mentorUser.name", 0)), "Mentor")))
                .append("studentName", new Document("$ifNull", Arrays.asList(new Document("$arrayElemAt", Arrays.asList("$studentUser.name", 0)), "Student")))
                .append("sessionDate", 1)
                .append("sessionTime", 1)
                .append("duration", new Document("$ifNull", Arrays.asList("$duration", 60)))
                .append("topic", new Document("$ifNull", Arrays.asList("$sessionTitle", "General Mentoring")))
                .append("status", 1)
                .append("hasNotes", false)
                .append("hasAIAnalysis", true)
            ));

            List<Map<String, Object>> sessions = new ArrayList<>();
            for (Document doc : mongoTemplate.getDb().getCollection("bookings").aggregate(pipeline)) {
                Map<String, Object> session = new HashMap<>();
                ObjectId id = doc.getObjectId("_id");
                session.put("_id", id != null ? id.toHexString() : null);
                session.put("sessionId", id != null ? id.toHexString() : null);
                session.put("mentorName", doc.get("mentorName"));
                session.put("studentName", doc.get("studentName"));
                session.put("sessionDate", doc.get("sessionDate"));
                session.put("sessionTime", doc.get("sessionTime"));
                session.put("duration", doc.get("duration"));
                session.put("topic", doc.get("topic"));
                session.put("status", doc.get("status"));
                session.put("hasNotes", false);
                session.put("hasAIAnalysis", true);
                sessions.add(session);
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", sessions
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to fetch completed sessions",
                "error", e.getMessage()
            ));
        }
    }

    @PostMapping("/notes")
    public ResponseEntity<?> saveSessionNotes(
        @RequestBody Map<String, Object> body,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            String token = extractBearerToken(authHeader);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Missing or invalid Authorization token"
                ));
            }

            String userId = jwtUtil.extractUserId(token);
            if (userId == null || userId.isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Invalid or expired token"
                ));
            }

            String sessionIdStr = body.get("sessionId") != null ? body.get("sessionId").toString() : null;
            String notes = body.get("notes") != null ? body.get("notes").toString() : "";

            if (sessionIdStr == null || sessionIdStr.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", "sessionId is required"
                ));
            }

            ObjectId sessionObjectId = new ObjectId(sessionIdStr);
            ObjectId userObjectId = new ObjectId(userId);

            Document booking = mongoTemplate.getDb().getCollection("bookings")
                .find(new Document("_id", sessionObjectId))
                .first();

            if (booking == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Session not found"
                ));
            }

            ObjectId mentorId = booking.getObjectId("mentor");
            ObjectId studentId = booking.getObjectId("student");

            boolean isMentor = mentorId != null && mentorId.equals(userObjectId);
            boolean isStudent = studentId != null && studentId.equals(userObjectId);

            if (!isMentor && !isStudent) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "message", "User is not authorized to add notes for this session"
                ));
            }

            Query query = new Query(Criteria.where("sessionId").is(sessionObjectId));
            Update update = new Update();
            update.set("sessionId", sessionObjectId);
            update.set("studentId", studentId);
            update.set("mentorId", mentorId);
            update.set(isStudent ? "studentNotes" : "mentorNotes", notes);
            update.set("updatedAt", new Date());
            update.setOnInsert("createdAt", new Date());
            update.setOnInsert("savedAt", new Date());

            mongoTemplate.upsert(query, update, "journalnotes");

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Notes saved successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to save notes",
                "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/notes/{sessionId}")
    public ResponseEntity<?> getSessionNotes(
        @PathVariable String sessionId,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        try {
            String token = extractBearerToken(authHeader);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Missing or invalid Authorization token"
                ));
            }

            String userId = jwtUtil.extractUserId(token);
            if (userId == null || userId.isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Invalid or expired token"
                ));
            }

            ObjectId sessionObjectId = new ObjectId(sessionId);
            ObjectId userObjectId = new ObjectId(userId);

            Document booking = mongoTemplate.getDb().getCollection("bookings")
                .find(new Document("_id", sessionObjectId))
                .first();

            if (booking == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Session not found"
                ));
            }

            ObjectId mentorId = booking.getObjectId("mentor");
            ObjectId studentId = booking.getObjectId("student");

            boolean isMentor = mentorId != null && mentorId.equals(userObjectId);
            boolean isStudent = studentId != null && studentId.equals(userObjectId);

            if (!isMentor && !isStudent) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "message", "User is not authorized to view notes for this session"
                ));
            }

            Document journalNotes = mongoTemplate.getDb().getCollection("journalnotes")
                .find(new Document("sessionId", sessionObjectId))
                .first();

            String notes = "";
            Date createdAt = new Date();
            Date updatedAt = new Date();

            if (journalNotes != null) {
                Object createdAtObj = journalNotes.get("createdAt");
                Object updatedAtObj = journalNotes.get("updatedAt");

                if (createdAtObj instanceof Date) createdAt = (Date) createdAtObj;
                if (updatedAtObj instanceof Date) updatedAt = (Date) updatedAtObj;

                Object field = journalNotes.get(isStudent ? "studentNotes" : "mentorNotes");
                notes = field != null ? field.toString() : "";
            }

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("sessionId", sessionId);
            responseData.put("notes", notes);
            responseData.put("createdAt", createdAt);
            responseData.put("updatedAt", updatedAt);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", responseData
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Failed to fetch notes",
                "error", e.getMessage()
            ));
        }
    }

    private String extractBearerToken(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) return null;
        if (!authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring("Bearer ".length()).trim();
        if (token.isBlank() || token.equalsIgnoreCase("null")) return null;
        return token;
    }
}
