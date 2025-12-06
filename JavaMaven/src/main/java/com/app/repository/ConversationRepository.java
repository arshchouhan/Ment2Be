package com.app.repository;

import com.app.model.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ConversationRepository extends MongoRepository<Conversation, String> {
    List<Conversation> findByParticipantsUserId(String userId);
    
    // Find conversation between two users
    Conversation findByParticipantsUserIdAndParticipantsUserId(String user1Id, String user2Id);
}
