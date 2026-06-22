package com.music.order_service.clients;

import com.music.order_service.exceptions.OutOfStockException;
import com.music.order_service.exceptions.ProductReservationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
public class ProductClient {

    private final RestClient restClient;
    private final String internalSecret;

    public ProductClient(
            @Value("${product-service.base-url:http://product-service:8083}") String baseUrl,
            @Value("${internal.secret}") String internalSecret) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
        this.internalSecret = internalSecret;
    }

    public void reserveStock(String productId, int quantity) {
        try {
            restClient.post()
                    .uri("/products/{id}/reserve", productId)
                    .header("X-Internal-Secret", internalSecret)
                    .header("Content-Type", "application/json")
                    .body(Map.of("quantity", quantity))
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                        if (res.getStatusCode().value() == 409) {
                            throw new OutOfStockException("Estoque insuficiente para o produto " + productId);
                        }
                        if (res.getStatusCode().value() == 404) {
                            throw new ProductReservationException("Produto não encontrado: " + productId);
                        }
                        throw new ProductReservationException(
                                "Falha ao reservar estoque (" + res.getStatusCode() + ") para " + productId);
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                        throw new ProductReservationException(
                                "product-service indisponível ao reservar " + productId);
                    })
                    .toBodilessEntity();
        } catch (OutOfStockException | ProductReservationException e) {
            throw e;
        } catch (Exception e) {
            throw new ProductReservationException(
                    "Erro de comunicação com product-service ao reservar " + productId);
        }
    }
}
