package com.music.product_service.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "products")
public class Product {

    @Id
    private String id;
    private String title;
    private String description;
    private double price;
    private String imageUrl;
    private List<ProductCategory> categories;
    private int maxInstallments;
    private int stockQuantity;
    private boolean available;

    @Version
    private Long version;

    public Product() {}

    public Product(String id, String title, String description, double price,
                   String imageUrl, List<ProductCategory> categories, int maxInstallments, int stockQuantity, boolean available) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.categories = categories;
        this.maxInstallments = maxInstallments;
        this.stockQuantity = stockQuantity;
        this.available = available;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public List<ProductCategory> getCategories() { return categories; }
    public void setCategories(List<ProductCategory> categories) { this.categories = categories; }

    public int getMaxInstallments() { return maxInstallments; }
    public void setMaxInstallments(int maxInstallments) { this.maxInstallments = maxInstallments; }

    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
