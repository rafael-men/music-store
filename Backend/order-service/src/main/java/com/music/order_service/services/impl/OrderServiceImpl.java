package com.music.order_service.services.impl;

import com.music.order_service.clients.ProductClient;
import com.music.order_service.clients.ProductSnapshot;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

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
    public OrderResponseDTO create(String authenticatedUserId, OrderRequestDTO dto) {
        if (dto.paymentMethod() != com.music.order_service.models.PaymentMethod.PIX) {
            throw new IllegalArgumentException("Apenas pagamento via PIX é aceito.");
        }
        if (authenticatedUserId == null || authenticatedUserId.isBlank()) {
            throw new IllegalArgumentException("Usuário autenticado é obrigatório.");
        }

        
        List<OrderItem> items = new ArrayList<>(dto.items().size());
        for (var i : dto.items()) {
            ProductSnapshot snap = productClient.getProduct(i.productId());
            items.add(new OrderItem(
                    snap.id(),
                    snap.title(),
                    snap.imageUrl() != null ? snap.imageUrl() : "/assets/652292.png",
                    snap.price(),
                    i.quantity()
            ));
        }


        List<OrderItem> reserved = new ArrayList<>(items.size());
        try {
            for (OrderItem item : items) {
                productClient.reserveStock(item.getProductId(), item.getQuantity());
                reserved.add(item);
            }

            double itemsTotal = items.stream().mapToDouble(i -> i.getPrice() * i.getQuantity()).sum();
            double shipping = Math.max(0.0, dto.shippingCost());
            double total = itemsTotal + shipping;

           
            Order order = new Order(null, authenticatedUserId, items, total, dto.paymentMethod(),
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
        } catch (RuntimeException ex) {
            for (OrderItem item : reserved) {
                log.warn("Compensando reserva de {} unidades do produto {} (motivo: {})",
                        item.getQuantity(), item.getProductId(), ex.getMessage());
                productClient.releaseStock(item.getProductId(), item.getQuantity());
            }
            throw ex;
        }
    }

    @Override
    public OrderResponseDTO findById(String id, String authenticatedUserId, boolean isAdmin) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        if (!isAdmin && !order.getUserId().equals(authenticatedUserId)) {
            throw new OrderNotFoundException(id);
        }
        return OrderResponseDTO.from(order);
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
