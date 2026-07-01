package com.music.order_service.clients;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


@JsonIgnoreProperties(ignoreUnknown = true)
public record UserSnapshot(
        String id,
        String name,
        String email
) {}
