package com.music.product_service.controllers;

import com.music.product_service.dtos.ProductRequestDTO;
import com.music.product_service.dtos.ProductResponseDTO;
import com.music.product_service.dtos.StockReservationDTO;
import com.music.product_service.models.ProductCategory;
import com.music.product_service.services.ProductService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    private static final Logger audit = LoggerFactory.getLogger("AUDIT");

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping("/new")
    public ResponseEntity<ProductResponseDTO> create(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestBody @Valid ProductRequestDTO dto) {
        ProductResponseDTO created = productService.create(dto);
        audit.info("action=CREATE_PRODUCT userId={} productId={} title={}", userId, created.id(), created.title());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> findById(@PathVariable String id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> findAll(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestParam(required = false) ProductCategory category,
            @RequestParam(required = false) String search) {
        boolean includeOutOfStock = "ADMIN".equalsIgnoreCase(role);
        if (category != null) return ResponseEntity.ok(productService.findByCategory(category, includeOutOfStock));
        if (search != null) return ResponseEntity.ok(productService.search(search, includeOutOfStock));
        return ResponseEntity.ok(productService.findAll(includeOutOfStock));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> update(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @PathVariable String id,
            @RequestBody @Valid ProductRequestDTO dto) {
        ProductResponseDTO updated = productService.update(id, dto);
        audit.info("action=UPDATE_PRODUCT userId={} productId={}", userId, id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @PathVariable String id) {
        productService.delete(id);
        audit.info("action=DELETE_PRODUCT userId={} productId={}", userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reserve")
    public ResponseEntity<ProductResponseDTO> reserveStock(
            @PathVariable String id,
            @RequestBody @Valid StockReservationDTO dto) {
        ProductResponseDTO updated = productService.reserveStock(id, dto.quantity());
        audit.info("action=RESERVE_STOCK productId={} quantity={} remaining={}",
                id, dto.quantity(), updated.stockQuantity());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/release")
    public ResponseEntity<ProductResponseDTO> releaseStock(
            @PathVariable String id,
            @RequestBody @Valid StockReservationDTO dto) {
        ProductResponseDTO updated = productService.releaseStock(id, dto.quantity());
        audit.info("action=RELEASE_STOCK productId={} quantity={} remaining={}",
                id, dto.quantity(), updated.stockQuantity());
        return ResponseEntity.ok(updated);
    }
}
