package com.music.order_service.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record TrackingUpdateDTO(
        @NotBlank
        @Pattern(regexp = "^[A-Za-z0-9-]{6,40}$",
                message = "Código de rastreio inválido (6-40 caracteres alfanuméricos ou hífen)")
        String trackingCode,
        @NotBlank String carrier,
        String trackingUrl
) {}
