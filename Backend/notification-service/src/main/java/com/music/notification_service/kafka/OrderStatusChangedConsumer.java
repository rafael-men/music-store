package com.music.notification_service.kafka;

import com.music.notification_service.models.Notification;
import com.music.notification_service.models.NotificationType;
import com.music.notification_service.repositories.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
public class OrderStatusChangedConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderStatusChangedConsumer.class);
    private final NotificationRepository notificationRepository;

    public OrderStatusChangedConsumer(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @KafkaListener(topics = "order.status-changed", groupId = "notification-service-status",
            containerFactory = "statusChangedListenerContainerFactory")
    public void consume(OrderStatusChangedEvent event, Acknowledgment ack) {
        if (event == null || event.orderId() == null || event.newStatus() == null) {
            throw new IllegalArgumentException("Evento OrderStatusChanged inválido");
        }
        String dedupKey = "order-status:" + event.orderId() + ":" + event.newStatus();
        if (notificationRepository.existsByDedupKey(dedupKey)) {
            log.debug("Status {} do pedido {} já notificado, ignorando", event.newStatus(), event.orderId());
            ack.acknowledge();
            return;
        }

        NotificationType type = resolveType(event.newStatus());
        String message = buildMessage(event);

        Notification notification = new Notification(null, event.userId(), dedupKey, message, type);
        try {
            notificationRepository.save(notification);
        } catch (DuplicateKeyException e) {
            log.debug("Notificação duplicada para {} (race), ignorando", dedupKey);
        }
        ack.acknowledge();
    }

    private NotificationType resolveType(String newStatus) {
        return switch (newStatus) {
            case "SHIPPED" -> NotificationType.ORDER_SHIPPED;
            case "DELIVERED" -> NotificationType.ORDER_DELIVERED;
            case "CANCELLED" -> NotificationType.ORDER_CANCELLED;
            case "CONFIRMED" -> NotificationType.ORDER_CONFIRMED;
            default -> NotificationType.GENERAL;
        };
    }

    private String buildMessage(OrderStatusChangedEvent event) {
        String shortId = event.orderId().length() > 8 ? event.orderId().substring(0, 8) : event.orderId();
        return switch (event.newStatus()) {
            case "CONFIRMED" -> "Pedido #" + shortId + " confirmado.";
            case "SHIPPED" -> event.trackingCode() != null
                    ? "Pedido #" + shortId + " enviado. Rastreio " + event.carrier() + ": " + event.trackingCode()
                    : "Pedido #" + shortId + " enviado.";
            case "DELIVERED" -> "Pedido #" + shortId + " entregue.";
            case "CANCELLED" -> "Pedido #" + shortId + " cancelado.";
            default -> "Pedido #" + shortId + " atualizado para " + event.newStatus() + ".";
        };
    }
}
