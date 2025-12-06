package com.app.repository;

import com.app.model.MentorProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MentorProfileRepository extends MongoRepository<MentorProfile, String> {
    Optional<MentorProfile> findByUserId(String userId);
}
