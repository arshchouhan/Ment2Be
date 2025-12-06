package com.app.service;

import com.app.chat.ChatController.ConversationData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import org.bson.Document;
import org.bson.types.ObjectId;
import com.mongodb.client.AggregateIterable;
import java.util.*;
import java.util.Date;

@Service
public class ConversationService {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    public List<ConversationData> getConversationsForUser(String userId) {
        System.out.println("[ConversationService] getConversationsForUser called with userId: " + userId);
        try {
            ObjectId userObjectId = new ObjectId(userId);
            System.out.println("[ConversationService] Converted to ObjectId: " + userObjectId);
            
            // Execute raw MongoDB aggregation pipeline
            List<Document> pipeline = buildAggregationPipeline(userObjectId);
            
            System.out.println("[ConversationService] Executing aggregation with " + pipeline.size() + " stages");
            AggregateIterable<Document> results = mongoTemplate.getDb()
                .getCollection("messages")
                .aggregate(pipeline);
            
            List<ConversationData> conversations = new ArrayList<>();
            for (Document doc : results) {
                ConversationData conv = mapDocumentToConversationData(doc);
                conversations.add(conv);
            }
            
            System.out.println("[ConversationService] Found " + conversations.size() + " conversations");
            return conversations;
            
        } catch (Exception e) {
            System.err.println("[ConversationService] ERROR: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    private List<Document> buildAggregationPipeline(ObjectId userObjectId) {
        List<Document> pipeline = new ArrayList<>();
        
        // $match: Find messages where user is sender or receiver
        pipeline.add(new Document("$match", new Document("$or", Arrays.asList(
            new Document("sender", userObjectId),
            new Document("receiver", userObjectId)
        ))));
        
        // $sort: Latest messages first
        pipeline.add(new Document("$sort", new Document("createdAt", -1)));
        
        // $group: Group by conversation pair
        pipeline.add(new Document("$group", new Document()
            .append("_id", new Document("$cond", new Document()
                .append("if", new Document("$lt", Arrays.asList("$sender", "$receiver")))
                .append("then", new Document("sender", "$sender").append("receiver", "$receiver"))
                .append("else", new Document("sender", "$receiver").append("receiver", "$sender"))
            ))
            .append("lastMessage", new Document("$first", "$content"))
            .append("lastMessageTime", new Document("$first", "$createdAt"))
            .append("lastMessageType", new Document("$first", "$messageType"))
            .append("lastSender", new Document("$first", "$sender"))
            .append("unreadCount", new Document("$sum", new Document("$cond", new Document()
                .append("if", new Document("$and", Arrays.asList(
                    new Document("$eq", Arrays.asList("$receiver", userObjectId)),
                    new Document("$eq", Arrays.asList("$isRead", false))
                )))
                .append("then", 1)
                .append("else", 0)
            )))
        ));
        
        // $addFields: Determine other participant
        pipeline.add(new Document("$addFields", new Document("otherParticipant", new Document("$cond", new Document()
            .append("if", new Document("$eq", Arrays.asList("$_id.sender", userObjectId)))
            .append("then", "$_id.receiver")
            .append("else", "$_id.sender")
        ))));
        
        // $lookup: Get user details
        pipeline.add(new Document("$lookup", new Document()
            .append("from", "users")
            .append("localField", "otherParticipant")
            .append("foreignField", "_id")
            .append("as", "participantDetails")
        ));
        
        // $lookup: Get mentor profile
        pipeline.add(new Document("$lookup", new Document()
            .append("from", "mentorprofiles")
            .append("localField", "otherParticipant")
            .append("foreignField", "user")
            .append("as", "mentorProfile")
        ));
        
        // $project: Format output
        pipeline.add(new Document("$project", new Document()
            .append("_id", 0)
            .append("conversationId", new Document("$concat", Arrays.asList(
                new Document("$toString", "$_id.sender"),
                "_",
                new Document("$toString", "$_id.receiver")
            )))
            .append("participantId", "$otherParticipant")
            .append("participantName", new Document("$arrayElemAt", Arrays.asList("$participantDetails.name", 0)))
            .append("participantEmail", new Document("$arrayElemAt", Arrays.asList("$participantDetails.email", 0)))
            .append("participantRole", new Document("$arrayElemAt", Arrays.asList("$participantDetails.role", 0)))
            .append("participantBio", new Document("$arrayElemAt", Arrays.asList("$participantDetails.bio", 0)))
            .append("profilePicture", new Document("$arrayElemAt", Arrays.asList("$mentorProfile.profilePicture", 0)))
            .append("lastMessage", "$lastMessage")
            .append("lastMessageTime", "$lastMessageTime")
            .append("lastMessageType", "$lastMessageType")
            .append("lastSender", "$lastSender")
            .append("unreadCount", "$unreadCount")
            .append("isOnline", false)
        ));
        
        // $sort: By last message time
        pipeline.add(new Document("$sort", new Document("lastMessageTime", -1)));
        
        return pipeline;
    }
    
    private ConversationData mapDocumentToConversationData(Document doc) {
        ConversationData conv = new ConversationData();
        conv.setConversationId(doc.getString("conversationId"));
        conv.setParticipantId(doc.get("participantId") != null ? doc.get("participantId").toString() : "");
        conv.setParticipantName(doc.getString("participantName"));
        conv.setParticipantEmail(doc.getString("participantEmail"));
        conv.setParticipantRole(doc.getString("participantRole"));
        conv.setParticipantBio(doc.getString("participantBio"));
        conv.setProfilePicture(doc.getString("profilePicture"));
        conv.setLastMessage(doc.getString("lastMessage"));
        
        Object lastMessageTimeObj = doc.get("lastMessageTime");
        if (lastMessageTimeObj instanceof Date) {
            conv.setLastMessageTime(((Date) lastMessageTimeObj).getTime());
        } else if (lastMessageTimeObj instanceof Long) {
            conv.setLastMessageTime((Long) lastMessageTimeObj);
        }
        
        conv.setLastMessageType(doc.getString("lastMessageType"));
        conv.setLastSender(doc.get("lastSender") != null ? doc.get("lastSender").toString() : "");
        
        Object unreadCountObj = doc.get("unreadCount");
        if (unreadCountObj instanceof Integer) {
            conv.setUnreadCount((Integer) unreadCountObj);
        } else if (unreadCountObj instanceof Long) {
            conv.setUnreadCount(((Long) unreadCountObj).intValue());
        }
        
        conv.setOnline(false);
        return conv;
    }
}
