package com.app.repository;

import com.app.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    
    List<Message> findBySenderAndReceiver(String sender, String receiver);
    
    List<Message> findBySenderOrReceiver(String sender, String receiver);
}
