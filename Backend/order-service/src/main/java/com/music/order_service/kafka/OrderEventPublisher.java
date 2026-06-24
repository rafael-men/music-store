package com.music.order_service.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class OrderEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(OrderEventPublisher.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public OrderEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }


    @EventListener
    public void onOrderCreated(OrderCreatedEvent event) {
        log.info("Publicando OrderCreatedEvent orderId={}", event.orderId());
        kafkaTemplate.send(KafkaTopics.ORDER_CREATED, event.orderId(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Falha ao publicar OrderCreatedEvent orderId={}", event.orderId(), ex);
                    }
                });
    }

    @EventListener
    public void onOrderStatusChanged(OrderStatusChangedEvent event) {
        log.info("Publicando OrderStatusChangedEvent orderId={} {}→{}",
                event.orderId(), event.oldStatus(), event.newStatus());
        kafkaTemplate.send(KafkaTopics.ORDER_STATUS_CHANGED, event.orderId(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Falha ao publicar OrderStatusChangedEvent orderId={}", event.orderId(), ex);
                    }
                });
    }
}
