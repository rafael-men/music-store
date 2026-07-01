package com.music.product_service.migration;

import io.mongock.api.annotations.ChangeUnit;
import io.mongock.api.annotations.Execution;
import io.mongock.api.annotations.RollbackExecution;
import org.bson.Document;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.CompoundIndexDefinition;
import org.springframework.data.mongodb.core.index.Index;

@ChangeUnit(id = "v004-product-stock-indexes", order = "004", author = "system")
public class V004_ProductStockIndexes {

    
    @SuppressWarnings("removal")
    @Execution
    public void execute(MongoTemplate mongoTemplate) {
        mongoTemplate.indexOps("products")
                .ensureIndex(new Index()
                        .on("stockQuantity", Sort.Direction.ASC)
                        .named("idx_product_stock"));
        mongoTemplate.indexOps("products")
                .ensureIndex(new CompoundIndexDefinition(
                        new Document("categories", 1).append("stockQuantity", 1))
                        .named("idx_product_categories_stock"));
    }

    @RollbackExecution
    public void rollback(MongoTemplate mongoTemplate) {
        try { mongoTemplate.indexOps("products").dropIndex("idx_product_stock"); } catch (Exception ignored) {}
        try { mongoTemplate.indexOps("products").dropIndex("idx_product_categories_stock"); } catch (Exception ignored) {}
    }
}
