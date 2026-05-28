package com.music.notification_service.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;
    private String userId;
    @Indexed(unique = true, sparse = true)
    private String dedupKey;
    private String message;
    private NotificationType type;
    private boolean read;
    private LocalDateTime createdAt;

    public Notification() {
        this.read = false;
        this.createdAt = LocalDateTime.now();
    }

    public Notification(String id, String userId, String message, NotificationType type) {
        this.id = id;
        this.userId = userId;
        this.message = message;
        this.type = type;
        this.read = false;
        this.createdAt = LocalDateTime.now();
    }

    public Notification(String id, String userId, String dedupKey, String message, NotificationType type) {
        this.id = id;
        this.userId = userId;
        this.dedupKey = dedupKey;
        this.message = message;
        this.type = type;
        this.read = false;
        this.createdAt = LocalDateTime.now();
    }

    public String getDedupKey() {
        return dedupKey;
    }

    public void setDedupKey(String dedupKey) {
        this.dedupKey = dedupKey;
    }

    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }
    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationType getType() {
        return type;
    }
    public void setType(NotificationType type) {
        this.type = type;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
