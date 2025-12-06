package com.app.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;

@Data
@Document(collection = "conversations")
public class Conversation {
    @Id
    private String id;
    private String conversationId;
    private List<Participant> participants;
    private Message lastMessage;
    private Date createdAt;
    private Date updatedAt;
    private int unreadCount;
    
    @Data
    public static class Participant {
        private String userId;
        private String name;
        private String email;
        private String role;
        private String profilePicture;
        private boolean isOnline;
    }
    
    @Data
    public static class Message {
        private String messageId;
        private String senderId;
        private String content;
        private String messageType;
        private Date timestamp;
        private boolean isRead;
    }
}
