package com.music.order_service.kafka;

public record OrderStatusChangedEvent(
        String orderId,
        String userId,
        String oldStatus,
        String newStatus,
        String trackingCode,
        String carrier
) {}
