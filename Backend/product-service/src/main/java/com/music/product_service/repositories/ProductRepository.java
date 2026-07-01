package com.music.product_service.repositories;

import com.music.product_service.models.Product;
import com.music.product_service.models.ProductCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    List<Product> findByCategoriesContaining(ProductCategory category);
    List<Product> findByAvailableTrue();
    List<Product> findByTitleContainingIgnoreCase(String title);
    Page<Product> findByStockQuantityGreaterThan(int min, Pageable pageable);
    Page<Product> findByCategoriesContainingAndStockQuantityGreaterThan(
            ProductCategory category, int min, Pageable pageable);
    Page<Product> findByTitleContainingIgnoreCaseAndStockQuantityGreaterThan(
            String title, int min, Pageable pageable);
    Page<Product> findByCategoriesContaining(ProductCategory category, Pageable pageable);
    Page<Product> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}
