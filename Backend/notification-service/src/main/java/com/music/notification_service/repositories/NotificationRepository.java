package com.music.notification_service.repositories;

import com.music.notification_service.models.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByUserId(String userId);
    List<Notification> findByUserIdAndReadFalse(String userId);
    boolean existsByDedupKey(String dedupKey);
}
