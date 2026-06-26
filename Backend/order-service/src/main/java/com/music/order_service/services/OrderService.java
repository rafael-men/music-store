package com.music.order_service.services;

import com.music.order_service.dtos.OrderRequestDTO;
import com.music.order_service.dtos.OrderResponseDTO;
import com.music.order_service.dtos.TrackingUpdateDTO;
import com.music.order_service.models.OrderStatus;

import java.util.List;

public interface OrderService {
    OrderResponseDTO create(String authenticatedUserId, OrderRequestDTO dto);
    OrderResponseDTO findById(String id, String authenticatedUserId, boolean isAdmin);
    List<OrderResponseDTO> findAll();
    List<OrderResponseDTO> findByUserId(String userId);
    OrderResponseDTO updateStatus(String id, OrderStatus status);
    OrderResponseDTO updateTracking(String id, TrackingUpdateDTO dto);
}