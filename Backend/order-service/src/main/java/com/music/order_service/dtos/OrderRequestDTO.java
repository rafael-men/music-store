package com.music.order_service.dtos;

import com.music.order_service.models.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.util.List;

public record OrderRequestDTO(
        @NotBlank String userId,
        @NotEmpty List<OrderItemDTO> items,
        @NotNull PaymentMethod paymentMethod,
        @PositiveOrZero double shippingCost,
        String shippingService,
        String shippingCarrier
) {}
