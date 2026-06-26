package com.music.order_service.controllers;

import com.music.order_service.dtos.OrderRequestDTO;
import com.music.order_service.dtos.OrderResponseDTO;
import com.music.order_service.dtos.TrackingUpdateDTO;
import com.music.order_service.models.OrderStatus;
import com.music.order_service.services.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponseDTO> create(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody @Valid OrderRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.create(userId, dto));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> findAll() {
        // OrderSecurityInterceptor já garante que só ADMIN passa.
        return ResponseEntity.ok(orderService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> findById(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role);
        return ResponseEntity.ok(orderService.findById(id, userId, isAdmin));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponseDTO>> findByUser(@PathVariable String userId) {
        // OrderSecurityInterceptor valida ownership/admin via pathVar userId.
        return ResponseEntity.ok(orderService.findByUserId(userId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponseDTO> updateStatus(@PathVariable String id, @RequestParam OrderStatus status) {
        // OrderSecurityInterceptor já restringe PATCH a ADMIN.
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }

    @PatchMapping("/{id}/tracking")
    public ResponseEntity<OrderResponseDTO> updateTracking(@PathVariable String id, @RequestBody @Valid TrackingUpdateDTO dto) {
        // OrderSecurityInterceptor já restringe PATCH a ADMIN.
        return ResponseEntity.ok(orderService.updateTracking(id, dto));
    }
}
