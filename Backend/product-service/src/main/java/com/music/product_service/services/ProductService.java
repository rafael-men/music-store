package com.music.product_service.services;

import com.music.product_service.dtos.ProductRequestDTO;
import com.music.product_service.dtos.ProductResponseDTO;
import com.music.product_service.models.ProductCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {

    ProductResponseDTO create(ProductRequestDTO dto);
    ProductResponseDTO findById(String id);
    Page<ProductResponseDTO> findAll(boolean includeOutOfStock, Pageable pageable);
    Page<ProductResponseDTO> findByCategory(ProductCategory category, boolean includeOutOfStock, Pageable pageable);
    Page<ProductResponseDTO> search(String title, boolean includeOutOfStock, Pageable pageable);
    List<ProductResponseDTO> findAll(boolean includeOutOfStock);
    ProductResponseDTO update(String id, ProductRequestDTO dto);
    void delete(String id);
    ProductResponseDTO reserveStock(String id, int quantity);
    ProductResponseDTO releaseStock(String id, int quantity);
}
