package com.music.order_service.clients;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Component
public class AuthClient {

    private static final Logger log = LoggerFactory.getLogger(AuthClient.class);
    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(2);
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(3);

    private final RestClient restClient;
    private final String internalSecret;

    public AuthClient(
            @Value("${auth-service.base-url:http://auth-service:8081}") String baseUrl,
            @Value("${internal.secret}") String internalSecret) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) CONNECT_TIMEOUT.toMillis());
        factory.setReadTimeout((int) READ_TIMEOUT.toMillis());
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
        this.internalSecret = internalSecret;
    }


    public UserSnapshot getUser(String userId, String role) {
        try {
            return restClient.get()
                    .uri("/users/{id}", userId)
                    .header("X-Internal-Secret", internalSecret)
                    .header("X-User-Id", userId)
                    .header("X-User-Role", role != null ? role : "USER")
                    .retrieve()
                    .body(UserSnapshot.class);
        } catch (Exception e) {
            log.warn("Falha ao buscar snapshot do usuário {} ({})", userId, e.getMessage());
            return null;
        }
    }
}
