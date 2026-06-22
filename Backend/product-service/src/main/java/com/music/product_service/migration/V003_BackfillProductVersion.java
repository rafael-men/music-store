package com.music.product_service.migration;

import io.mongock.api.annotations.ChangeUnit;
import io.mongock.api.annotations.Execution;
import io.mongock.api.annotations.RollbackExecution;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

@ChangeUnit(id = "v003-backfill-product-version", order = "003", author = "system")
public class V003_BackfillProductVersion {

    @Execution
    public void execute(MongoTemplate mongoTemplate) {

        Query missingVersion = new Query(Criteria.where("version").exists(false));
        Update setZero = new Update().set("version", 0L);
        mongoTemplate.updateMulti(missingVersion, setZero, "products");
    }

    @RollbackExecution
    public void rollback(MongoTemplate mongoTemplate) {
    }
}
