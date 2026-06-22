package com.music.product_service.dtos;

import jakarta.validation.constraints.Positive;

public record StockReservationDTO(
        @Positive(message = "quantity deve ser positivo")
        int quantity
) {}
