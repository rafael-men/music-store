package com.music.notification_service.services;

import com.music.notification_service.dtos.NotificationResponseDTO;

import java.util.List;

public interface NotificationService {

    NotificationResponseDTO findById(String id, String authenticatedUserId, boolean isAdmin);
    List<NotificationResponseDTO> findByUserId(String userId);
    List<NotificationResponseDTO> findUnreadByUserId(String userId);
    NotificationResponseDTO markAsRead(String id, String authenticatedUserId, boolean isAdmin);
}