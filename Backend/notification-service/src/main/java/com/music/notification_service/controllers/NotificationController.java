package com.music.notification_service.controllers;

import com.music.notification_service.dtos.NotificationResponseDTO;
import com.music.notification_service.services.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponseDTO> findById(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        return ResponseEntity.ok(notificationService.findById(id, userId, "ADMIN".equalsIgnoreCase(role)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponseDTO>> findByUser(@PathVariable String userId) {
        return ResponseEntity.ok(notificationService.findByUserId(userId));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationResponseDTO>> findUnread(@PathVariable String userId) {
        return ResponseEntity.ok(notificationService.findUnreadByUserId(userId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponseDTO> markAsRead(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        return ResponseEntity.ok(notificationService.markAsRead(id, userId, "ADMIN".equalsIgnoreCase(role)));
    }
}
