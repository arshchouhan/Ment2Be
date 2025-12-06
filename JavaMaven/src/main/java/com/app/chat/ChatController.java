package com.app.chat;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import com.app.service.ConversationService;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class ChatController {

    @Autowired
    private ConversationService conversationService;
    
    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping("/messages/{conversationId}")
    public ChatResponse getMessages(@PathVariable String conversationId) {
        // TODO: Implement get messages logic
        List<Message> messages = new ArrayList<>();
        return new ChatResponse(conversationId, messages, "Messages retrieved successfully");
    }

    @PostMapping("/send")
    public ChatResponse sendMessage(@RequestBody MessageRequest request) {
        // TODO: Implement send message logic
        Message message = new Message(
            request.getConversationId(),
            request.getSenderId(),
            request.getContent(),
            System.currentTimeMillis()
        );
        return new ChatResponse(request.getConversationId(), List.of(message), "Message sent successfully");
    }

    @GetMapping("/conversations/{userId}")
    public ConversationListResponse getConversations(@PathVariable String userId) {
        // TODO: Implement get conversations logic
        List<Conversation> conversations = new ArrayList<>();
        return new ConversationListResponse(userId, conversations, "Conversations retrieved successfully");
    }

    @GetMapping("/test-db")
    public Map<String, Object> testDatabase() {
        Map<String, Object> result = new HashMap<>();
        try {
            long messageCount = mongoTemplate.getCollection("messages").countDocuments();
            long userCount = mongoTemplate.getCollection("users").countDocuments();
            
            result.put("success", true);
            result.put("messageCount", messageCount);
            result.put("userCount", userCount);
            result.put("database", mongoTemplate.getDb().getName());
            
            System.out.println("[TEST-DB] Messages: " + messageCount + ", Users: " + userCount);
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            System.err.println("[TEST-DB] Error: " + e.getMessage());
            e.printStackTrace();
        }
        return result;
    }
    
    @GetMapping("/conversations")
    public ConversationsResponse getConversationsForUser(HttpServletRequest request) {
        try {
            System.out.println("[ChatController] getConversationsForUser called");
            // Extract user ID from JWT token in Authorization header
            String authHeader = request.getHeader("Authorization");
            String userId = extractUserIdFromToken(authHeader);
            
            if (userId == null || userId.isEmpty()) {
                System.err.println("No valid JWT token found in Authorization header");
                return new ConversationsResponse(new ArrayList<>(), "No valid authentication token provided");
            }
            
            System.out.println("[ChatController] Calling conversationService with userId: " + userId);
            System.out.println("[ChatController] conversationService is: " + (conversationService != null ? "NOT NULL" : "NULL"));
            System.out.flush();
            // Fetch conversations from MongoDB using the service
            List<ConversationData> conversations = conversationService.getConversationsForUser(userId);
            System.out.println("[ChatController] Service returned " + conversations.size() + " conversations");
            System.out.flush();
            
            // Log when conversations are fetched
            System.out.println("========================================");
            System.out.println("[CONVERSATIONS FETCHED FROM MONGODB]");
            System.out.println("User ID: " + userId);
            System.out.println("Timestamp: " + System.currentTimeMillis());
            System.out.println("Total Conversations: " + conversations.size());
            System.out.println("========================================");
            
            return new ConversationsResponse(conversations, "Conversations retrieved successfully");
        } catch (Exception e) {
            System.err.println("[ChatController] Error fetching conversations: " + e.getMessage());
            System.err.println("[ChatController] Exception type: " + e.getClass().getName());
            e.printStackTrace();
            return new ConversationsResponse(new ArrayList<>(), "Error fetching conversations: " + e.getMessage());
        }
    }
    
    private String extractUserIdFromToken(String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.err.println("Invalid auth header format");
                return null;
            }
            
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            
            // Decode JWT token (simple base64 decoding of payload)
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                System.err.println("Invalid JWT format - expected 3 parts, got " + parts.length);
                return null;
            }
            
            // Decode the payload (second part)
            String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
            System.out.println("JWT Payload: " + payload);
            
            // Extract userId from JSON payload
            // Try multiple field names: userId, _id, id, sub
            String[] fieldNames = {"userId", "_id", "id", "sub"};
            
            for (String fieldName : fieldNames) {
                String searchPattern = "\"" + fieldName + "\":\"";
                if (payload.contains(searchPattern)) {
                    int start = payload.indexOf(searchPattern) + searchPattern.length();
                    int end = payload.indexOf("\"", start);
                    if (end > start) {
                        String userId = payload.substring(start, end);
                        System.out.println("Extracted userId from field '" + fieldName + "': " + userId);
                        return userId;
                    }
                }
            }
            
            System.err.println("Could not find userId in JWT payload");
            return null;
        } catch (Exception e) {
            System.err.println("Error extracting user ID from token: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    @DeleteMapping("/messages/{messageId}")
    public ChatResponse deleteMessage(@PathVariable String messageId) {
        // TODO: Implement delete message logic
        return new ChatResponse("", new ArrayList<>(), "Message deleted successfully");
    }

    // Inner classes for request/response
    public static class MessageRequest {
        private String conversationId;
        private String senderId;
        private String content;

        public MessageRequest() {}

        public MessageRequest(String conversationId, String senderId, String content) {
            this.conversationId = conversationId;
            this.senderId = senderId;
            this.content = content;
        }

        public String getConversationId() {
            return conversationId;
        }

        public void setConversationId(String conversationId) {
            this.conversationId = conversationId;
        }

        public String getSenderId() {
            return senderId;
        }

        public void setSenderId(String senderId) {
            this.senderId = senderId;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }

    public static class Message {
        private String conversationId;
        private String senderId;
        private String content;
        private long timestamp;

        public Message() {}

        public Message(String conversationId, String senderId, String content, long timestamp) {
            this.conversationId = conversationId;
            this.senderId = senderId;
            this.content = content;
            this.timestamp = timestamp;
        }

        public String getConversationId() {
            return conversationId;
        }

        public void setConversationId(String conversationId) {
            this.conversationId = conversationId;
        }

        public String getSenderId() {
            return senderId;
        }

        public void setSenderId(String senderId) {
            this.senderId = senderId;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public long getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(long timestamp) {
            this.timestamp = timestamp;
        }
    }

    public static class Conversation {
        private String conversationId;
        private String participantId;
        private String lastMessage;
        private long lastMessageTime;

        public Conversation() {}

        public Conversation(String conversationId, String participantId, String lastMessage, long lastMessageTime) {
            this.conversationId = conversationId;
            this.participantId = participantId;
            this.lastMessage = lastMessage;
            this.lastMessageTime = lastMessageTime;
        }

        public String getConversationId() {
            return conversationId;
        }

        public void setConversationId(String conversationId) {
            this.conversationId = conversationId;
        }

        public String getParticipantId() {
            return participantId;
        }

        public void setParticipantId(String participantId) {
            this.participantId = participantId;
        }

        public String getLastMessage() {
            return lastMessage;
        }

        public void setLastMessage(String lastMessage) {
            this.lastMessage = lastMessage;
        }

        public long getLastMessageTime() {
            return lastMessageTime;
        }

        public void setLastMessageTime(long lastMessageTime) {
            this.lastMessageTime = lastMessageTime;
        }
    }

    public static class ChatResponse {
        private String conversationId;
        private List<Message> messages;
        private String message;

        public ChatResponse() {}

        public ChatResponse(String conversationId, List<Message> messages, String message) {
            this.conversationId = conversationId;
            this.messages = messages;
            this.message = message;
        }

        public String getConversationId() {
            return conversationId;
        }

        public void setConversationId(String conversationId) {
            this.conversationId = conversationId;
        }

        public List<Message> getMessages() {
            return messages;
        }

        public void setMessages(List<Message> messages) {
            this.messages = messages;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    public static class ConversationListResponse {
        private String userId;
        private List<Conversation> conversations;
        private String message;

        public ConversationListResponse() {}

        public ConversationListResponse(String userId, List<Conversation> conversations, String message) {
            this.userId = userId;
            this.conversations = conversations;
            this.message = message;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public List<Conversation> getConversations() {
            return conversations;
        }

        public void setConversations(List<Conversation> conversations) {
            this.conversations = conversations;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    // New response class for conversations endpoint (matches Node.js format)
    public static class ConversationsResponse {
        private boolean success;
        private List<ConversationData> data;
        private String message;

        public ConversationsResponse() {}

        public ConversationsResponse(List<ConversationData> data, String message) {
            this.success = true;
            this.data = data;
            this.message = message;
        }

        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public List<ConversationData> getData() {
            return data;
        }

        public void setData(List<ConversationData> data) {
            this.data = data;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    // Conversation data class (matches Node.js structure)
    public static class ConversationData {
        private String conversationId;
        private String participantId;
        private String participantName;
        private String participantEmail;
        private String participantRole;
        private String participantBio;
        private String profilePicture;
        private String lastMessage;
        private long lastMessageTime;
        private String lastMessageType;
        private String lastSender;
        private int unreadCount;
        private boolean isOnline;

        public ConversationData() {}

        public ConversationData(String conversationId, String participantId, String participantName, 
                              String lastMessage, long lastMessageTime) {
            this.conversationId = conversationId;
            this.participantId = participantId;
            this.participantName = participantName;
            this.lastMessage = lastMessage;
            this.lastMessageTime = lastMessageTime;
            this.unreadCount = 0;
            this.isOnline = false;
        }

        // Getters and Setters
        public String getConversationId() {
            return conversationId;
        }

        public void setConversationId(String conversationId) {
            this.conversationId = conversationId;
        }

        public String getParticipantId() {
            return participantId;
        }

        public void setParticipantId(String participantId) {
            this.participantId = participantId;
        }

        public String getParticipantName() {
            return participantName;
        }

        public void setParticipantName(String participantName) {
            this.participantName = participantName;
        }

        public String getParticipantEmail() {
            return participantEmail;
        }

        public void setParticipantEmail(String participantEmail) {
            this.participantEmail = participantEmail;
        }

        public String getParticipantRole() {
            return participantRole;
        }

        public void setParticipantRole(String participantRole) {
            this.participantRole = participantRole;
        }

        public String getParticipantBio() {
            return participantBio;
        }

        public void setParticipantBio(String participantBio) {
            this.participantBio = participantBio;
        }

        public String getProfilePicture() {
            return profilePicture;
        }

        public void setProfilePicture(String profilePicture) {
            this.profilePicture = profilePicture;
        }

        public String getLastMessage() {
            return lastMessage;
        }

        public void setLastMessage(String lastMessage) {
            this.lastMessage = lastMessage;
        }

        public long getLastMessageTime() {
            return lastMessageTime;
        }

        public void setLastMessageTime(long lastMessageTime) {
            this.lastMessageTime = lastMessageTime;
        }

        public String getLastMessageType() {
            return lastMessageType;
        }

        public void setLastMessageType(String lastMessageType) {
            this.lastMessageType = lastMessageType;
        }

        public String getLastSender() {
            return lastSender;
        }

        public void setLastSender(String lastSender) {
            this.lastSender = lastSender;
        }

        public int getUnreadCount() {
            return unreadCount;
        }

        public void setUnreadCount(int unreadCount) {
            this.unreadCount = unreadCount;
        }

        public boolean isOnline() {
            return isOnline;
        }

        public void setOnline(boolean online) {
            isOnline = online;
        }
    }
}
