package com.music.order_service.services.impl;

import com.music.order_service.clients.ProductClient;
import com.music.order_service.dtos.OrderRequestDTO;
import com.music.order_service.dtos.OrderResponseDTO;
import com.music.order_service.dtos.TrackingUpdateDTO;
import com.music.order_service.exceptions.OrderNotFoundException;
import com.music.order_service.kafka.OrderCreatedEvent;
import com.music.order_service.kafka.OrderStatusChangedEvent;
import com.music.order_service.models.Order;
import com.music.order_service.models.OrderItem;
import com.music.order_service.models.OrderStatus;
import com.music.order_service.repositories.OrderRepository;
import com.music.order_service.services.OrderService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final ProductClient productClient;

    public OrderServiceImpl(OrderRepository orderRepository,
                            ApplicationEventPublisher eventPublisher,
                            ProductClient productClient) {
        this.orderRepository = orderRepository;
        this.eventPublisher = eventPublisher;
        this.productClient = productClient;
    }

    @Override
    @Transactional
    public OrderResponseDTO create(OrderRequestDTO dto) {
        if (dto.paymentMethod() != com.music.order_service.models.PaymentMethod.PIX) {
            throw new IllegalArgumentException("Apenas pagamento via PIX é aceito.");
        }
        List<OrderItem> items = dto.items().stream()
                .map(i -> new OrderItem(i.productId(), i.name(), i.image(), i.price(), i.quantity()))
                .toList();

        // Reserva estoque ANTES de salvar o pedido. Se falhar, transação é abortada
        // (RuntimeException -> rollback). Item já reservado fica como "perdido" caso outro
        // item falhe depois — aceitável para escopo dev; em prod, compensar via saga/outbox.
        for (OrderItem item : items) {
            productClient.reserveStock(item.getProductId(), item.getQuantity());
        }

        double itemsTotal = items.stream().mapToDouble(i -> i.getPrice() * i.getQuantity()).sum();
        double shipping = Math.max(0.0, dto.shippingCost());
        double total = itemsTotal + shipping;
        Order order = new Order(null, dto.userId(), items, total, dto.paymentMethod(),
                shipping, dto.shippingService());
        if (dto.shippingCarrier() != null && !dto.shippingCarrier().isBlank()) {
            order.setCarrier(dto.shippingCarrier());
        }
        Order saved = orderRepository.save(order);

        eventPublisher.publishEvent(new OrderCreatedEvent(
                saved.getId(),
                saved.getUserId(),
                saved.getTotal(),
                saved.getPaymentMethod().name()
        ));

        return OrderResponseDTO.from(saved);
    }

    @Override
    public OrderResponseDTO findById(String id) {
        return OrderResponseDTO.from(orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id)));
    }

    @Override
    public List<OrderResponseDTO> findAll() {
        return orderRepository.findAll().stream().map(OrderResponseDTO::from).toList();
    }

    @Override
    public List<OrderResponseDTO> findByUserId(String userId) {
        return orderRepository.findByUserId(userId).stream().map(OrderResponseDTO::from).toList();
    }

    @Override
    @Transactional
    public OrderResponseDTO updateStatus(String id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        OrderStatus oldStatus = order.getStatus();
        if (oldStatus == status) {
            return OrderResponseDTO.from(order);
        }
        order.setStatus(status);
        if (status == OrderStatus.SHIPPED && order.getShippedAt() == null) {
            order.setShippedAt(LocalDateTime.now());
        }
        Order saved = orderRepository.save(order);
        publishStatusChanged(saved, oldStatus);
        return OrderResponseDTO.from(saved);
    }

    @Override
    @Transactional
    public OrderResponseDTO updateTracking(String id, TrackingUpdateDTO dto) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Não é possível adicionar rastreio a um pedido cancelado.");
        }
        OrderStatus oldStatus = order.getStatus();
        order.setTrackingCode(dto.trackingCode());
        order.setCarrier(dto.carrier());
        order.setTrackingUrl(dto.trackingUrl());


        if (oldStatus == OrderStatus.PENDING || oldStatus == OrderStatus.CONFIRMED) {
            order.setStatus(OrderStatus.SHIPPED);
            if (order.getShippedAt() == null) {
                order.setShippedAt(LocalDateTime.now());
            }
        }

        Order saved = orderRepository.save(order);
        if (oldStatus != saved.getStatus()) {
            publishStatusChanged(saved, oldStatus);
        }
        return OrderResponseDTO.from(saved);
    }

    private void publishStatusChanged(Order order, OrderStatus oldStatus) {
        eventPublisher.publishEvent(new OrderStatusChangedEvent(
                order.getId(),
                order.getUserId(),
                oldStatus.name(),
                order.getStatus().name(),
                order.getTrackingCode(),
                order.getCarrier()
        ));
    }
}
