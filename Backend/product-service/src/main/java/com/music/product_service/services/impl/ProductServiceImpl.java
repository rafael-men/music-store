package com.music.product_service.services.impl;

import com.music.product_service.config.CacheConfig;
import com.music.product_service.dtos.ProductRequestDTO;
import com.music.product_service.dtos.ProductResponseDTO;
import com.music.product_service.exceptions.OutOfStockException;
import com.music.product_service.exceptions.ProductNotFoundException;
import com.music.product_service.models.Product;
import com.music.product_service.models.ProductCategory;
import com.music.product_service.repositories.ProductRepository;
import com.music.product_service.services.ProductService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private static final int RESERVE_MAX_RETRIES = 5;

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    @Caching(evict = { @CacheEvict(value = CacheConfig.PRODUCT_LISTS, allEntries = true) })
    public ProductResponseDTO create(ProductRequestDTO dto) {
        Product product = new Product(null, dto.title(), dto.description(), dto.price(),
                dto.imageUrl(), dto.categories(), dto.maxInstallments(), dto.stockQuantity(), Boolean.TRUE.equals(dto.available()));
        return ProductResponseDTO.from(productRepository.save(product));
    }

    @Override
    @Cacheable(value = CacheConfig.PRODUCT_BY_ID, key = "#id")
    public ProductResponseDTO findById(String id) {
        return ProductResponseDTO.from(productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id)));
    }

    @Override
    @Cacheable(
        value = CacheConfig.PRODUCT_LISTS,
        key = "'all:' + #includeOutOfStock + ':' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort"
    )
    public Page<ProductResponseDTO> findAll(boolean includeOutOfStock, Pageable pageable) {
        Page<Product> page = includeOutOfStock
                ? productRepository.findAll(pageable)
                : productRepository.findByStockQuantityGreaterThan(0, pageable);
        return page.map(ProductResponseDTO::from);
    }

    @Override
    @Cacheable(
        value = CacheConfig.PRODUCT_LISTS,
        key = "'cat:' + #category + ':' + #includeOutOfStock + ':' + #pageable.pageNumber + ':' + #pageable.pageSize"
    )
    public Page<ProductResponseDTO> findByCategory(ProductCategory category, boolean includeOutOfStock, Pageable pageable) {
        Page<Product> page = includeOutOfStock
                ? productRepository.findByCategoriesContaining(category, pageable)
                : productRepository.findByCategoriesContainingAndStockQuantityGreaterThan(category, 0, pageable);
        return page.map(ProductResponseDTO::from);
    }

    @Override
    @Cacheable(
        value = CacheConfig.PRODUCT_LISTS,
        key = "'search:' + #title.toLowerCase() + ':' + #includeOutOfStock + ':' + #pageable.pageNumber + ':' + #pageable.pageSize"
    )
    public Page<ProductResponseDTO> search(String title, boolean includeOutOfStock, Pageable pageable) {
        Page<Product> page = includeOutOfStock
                ? productRepository.findByTitleContainingIgnoreCase(title, pageable)
                : productRepository.findByTitleContainingIgnoreCaseAndStockQuantityGreaterThan(title, 0, pageable);
        return page.map(ProductResponseDTO::from);
    }

    @Override
    public List<ProductResponseDTO> findAll(boolean includeOutOfStock) {
        return productRepository.findAll().stream()
                .filter(p -> includeOutOfStock || p.getStockQuantity() > 0)
                .map(ProductResponseDTO::from)
                .toList();
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.PRODUCT_BY_ID, key = "#id"),
            @CacheEvict(value = CacheConfig.PRODUCT_LISTS, allEntries = true)
    })
    public ProductResponseDTO update(String id, ProductRequestDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        product.setTitle(dto.title());
        product.setDescription(dto.description());
        product.setPrice(dto.price());
        product.setImageUrl(dto.imageUrl());
        product.setCategories(dto.categories());
        product.setMaxInstallments(dto.maxInstallments());
        product.setStockQuantity(dto.stockQuantity());
        product.setAvailable(Boolean.TRUE.equals(dto.available()));
        return ProductResponseDTO.from(productRepository.save(product));
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.PRODUCT_BY_ID, key = "#id"),
            @CacheEvict(value = CacheConfig.PRODUCT_LISTS, allEntries = true)
    })
    public void delete(String id) {
        if (!productRepository.existsById(id)) throw new ProductNotFoundException(id);
        productRepository.deleteById(id);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.PRODUCT_BY_ID, key = "#id"),
            @CacheEvict(value = CacheConfig.PRODUCT_LISTS, allEntries = true)
    })
    public ProductResponseDTO reserveStock(String id, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantidade a reservar deve ser positiva");
        }
        OptimisticLockingFailureException lastEx = null;
        for (int attempt = 0; attempt < RESERVE_MAX_RETRIES; attempt++) {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new ProductNotFoundException(id));
            int current = product.getStockQuantity();
            if (current < quantity) {
                throw new OutOfStockException(id, quantity, current);
            }
            product.setStockQuantity(current - quantity);
            try {
                Product saved = productRepository.save(product);
                return ProductResponseDTO.from(saved);
            } catch (OptimisticLockingFailureException ex) {
                lastEx = ex;
            }
        }
        throw lastEx != null
                ? lastEx
                : new IllegalStateException("Falha ao reservar estoque após múltiplas tentativas");
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.PRODUCT_BY_ID, key = "#id"),
            @CacheEvict(value = CacheConfig.PRODUCT_LISTS, allEntries = true)
    })
    public ProductResponseDTO releaseStock(String id, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantidade a liberar deve ser positiva");
        }
        OptimisticLockingFailureException lastEx = null;
        for (int attempt = 0; attempt < RESERVE_MAX_RETRIES; attempt++) {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new ProductNotFoundException(id));
            product.setStockQuantity(product.getStockQuantity() + quantity);
            try {
                Product saved = productRepository.save(product);
                return ProductResponseDTO.from(saved);
            } catch (OptimisticLockingFailureException ex) {
                lastEx = ex;
            }
        }
        throw lastEx != null
                ? lastEx
                : new IllegalStateException("Falha ao liberar estoque após múltiplas tentativas");
    }
}
