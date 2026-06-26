package com.music.product_service.services;

import com.music.product_service.dtos.ProductRequestDTO;
import com.music.product_service.dtos.ProductResponseDTO;
import com.music.product_service.models.ProductCategory;

import java.util.List;

public interface ProductService {

    ProductResponseDTO create(ProductRequestDTO dto);
    ProductResponseDTO findById(String id);
    List<ProductResponseDTO> findAll(boolean includeOutOfStock);
    List<ProductResponseDTO> findByCategory(ProductCategory category, boolean includeOutOfStock);
    List<ProductResponseDTO> search(String title, boolean includeOutOfStock);
    ProductResponseDTO update(String id, ProductRequestDTO dto);
    void delete(String id);
    ProductResponseDTO reserveStock(String id, int quantity);
    ProductResponseDTO releaseStock(String id, int quantity);
}
