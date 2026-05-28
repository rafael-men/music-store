package com.music.order_service.kafka;

public final class KafkaTopics {
    public static final String ORDER_CREATED = "order.created";
    public static final String ORDER_STATUS_CHANGED = "order.status-changed";

    private KafkaTopics() {}
}
