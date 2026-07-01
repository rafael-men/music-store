package com.microsservices.api_gateway.client;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.Map;

/**
 * Consulta o auth-service para checar se um jti foi revogado.
 *
 * Cacheamos só resultados POSITIVOS (revoked=true) com TTL longo (24h, casa com a vida do JWT).
 * Resultados negativos (revoked=false) NÃO são cacheados: se cachássemos false, uma mutação
 * anterior ao logout deixaria o cache stale e a mutação pós-logout passaria pelo gateway.
 *
 * Custo: cada mutação com token válido consulta o auth-service. Para cargas altas, um cache
 * negativo de TTL muito curto (~3s) seria aceitável; ficamos sem cache negativo por enquanto
 * porque a corretude é mais importante que a latência neste ponto.
 *
 * Usa DNS direto do Docker (sem @LoadBalanced) porque registrar um @LoadBalanced
 * RestClient.Builder no contexto contamina o builder usado pelo Eureka client e
 * gera deadlock circular.
 *
 * Em caso de falha (auth-service fora, timeout), retorna false (fail-open). Isso é deliberado:
 * preferimos disponibilidade da API sobre rejeitar tokens válidos quando o auth-service trava.
 */
@Component
public class AuthRevocationClient {

    private static final Logger log = LoggerFactory.getLogger(AuthRevocationClient.class);

    private final RestClient restClient;
    private final String internalSecret;

    // Só cacheamos jtis confirmadamente revogados (Boolean.TRUE). TTL de 24h casa com a vida do JWT.
    private final Cache<String, Boolean> revokedCache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofHours(24))
            .maximumSize(50_000)
            .build();

    public AuthRevocationClient(@Value("${internal.secret}") String internalSecret,
                                @Value("${auth-service.base-url:http://auth-service:8081}") String authServiceBaseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(authServiceBaseUrl)
                .build();
        this.internalSecret = internalSecret;
    }

    public boolean isRevoked(String jti) {
        if (jti == null || jti.isBlank()) return false;

        Boolean cached = revokedCache.getIfPresent(jti);
        if (Boolean.TRUE.equals(cached)) return true;

        try {
            @SuppressWarnings("unchecked")
            Map<String, Boolean> body = restClient.get()
                    .uri("/internal/jti/{jti}/revoked", jti)
                    .header("X-Internal-Secret", internalSecret)
                    .retrieve()
                    .body(Map.class);

            boolean revoked = body != null && Boolean.TRUE.equals(body.get("revoked"));
            if (revoked) {
                revokedCache.put(jti, Boolean.TRUE);
            }
            return revoked;
        } catch (Exception e) {
            log.warn("Falha ao consultar revogação de jti={} no auth-service: {}", jti, e.getMessage());
            return false;
        }
    }
}
