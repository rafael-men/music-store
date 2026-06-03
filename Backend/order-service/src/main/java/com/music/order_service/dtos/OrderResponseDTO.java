package com.music.order_service.dtos;

import com.music.order_service.models.Order;
import com.music.order_service.models.OrderItem;
import com.music.order_service.models.OrderStatus;
import com.music.order_service.models.PaymentMethod;

import java.time.LocalDateTime;
import java.util.List;

public record OrderResponseDTO(
        String id,
        String userId,
        List<OrderItem> items,
        double total,
        double shippingCost,
        String shippingService,
        PaymentMethod paymentMethod,
        OrderStatus status,
        LocalDateTime createdAt,
        String trackingCode,
        String carrier,
        String trackingUrl,
        LocalDateTime shippedAt
) {
    public static OrderResponseDTO from(Order order) {
        return new OrderResponseDTO(
                order.getId(),
                order.getUserId(),
                order.getItems(),
                order.getTotal(),
                order.getShippingCost(),
                order.getShippingService(),
                order.getPaymentMethod(),
                order.getStatus(),
                order.getCreatedAt(),
                order.getTrackingCode(),
                order.getCarrier(),
                order.getTrackingUrl(),
                order.getShippedAt()
        );
    }
}
