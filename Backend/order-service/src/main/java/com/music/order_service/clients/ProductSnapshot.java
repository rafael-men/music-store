package com.music.order_service.clients;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


@JsonIgnoreProperties(ignoreUnknown = true)
public record ProductSnapshot(
        String id,
        String title,
        String imageUrl,
        double price,
        int stockQuantity
) {}
