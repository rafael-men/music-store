package com.music.notification_service.kafka;

import com.music.notification_service.models.Notification;
import com.music.notification_service.models.NotificationType;
import com.music.notification_service.repositories.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class OrderCreatedConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderCreatedConsumer.class);
    private final NotificationRepository notificationRepository;

    public OrderCreatedConsumer(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @KafkaListener(topics = "order.created", groupId = "notification-service-group",
            containerFactory = "kafkaListenerContainerFactory")
    public void consume(OrderCreatedEvent event) {
        if (event == null || event.orderId() == null) {
            throw new IllegalArgumentException("Evento OrderCreated inválido (orderId nulo)");
        }
        String dedupKey = "order-created:" + event.orderId();
        if (notificationRepository.existsByDedupKey(dedupKey)) {
            log.debug("Evento orderId={} já processado, ignorando", event.orderId());
            return;
        }
        Notification notification = new Notification(
                null,
                event.userId(),
                dedupKey,
                "Pedido #" + event.orderId() + " criado com sucesso! Total: R$ " +
                        String.format("%.2f", event.total()),
                NotificationType.ORDER_CONFIRMED
        );
        try {
            notificationRepository.save(notification);
        } catch (DuplicateKeyException e) {
            log.debug("Notificação duplicada para orderId={} (race), ignorando", event.orderId());
        }
    }
}
