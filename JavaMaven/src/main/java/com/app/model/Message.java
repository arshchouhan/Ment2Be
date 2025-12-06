package com.app.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.bson.types.ObjectId;
import java.time.LocalDateTime;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "messages")
public class Message {
    @Id
    private String id;
    
    private ObjectId sender;
    
    private ObjectId receiver;
    
    private String content;
    
    private String messageType;
    
    private Boolean isRead;
    
    private Date readAt;
    
    private String relatedBooking;
    
    private Boolean isEdited;
    
    private Date editedAt;
    
    private Date createdAt;
    
    private Date updatedAt;
}
