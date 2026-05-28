package com.microsservices.api_gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.function.HandlerFilterFunction;
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;

import javax.crypto.SecretKey;
import java.util.List;

@Component
public class JwtAuthGatewayFilter {

    private static final List<String> PUBLIC_PATHS = List.of(
            "/users/register",
            "/users/login",
            "/swagger-ui",
            "/v3/api-docs"
    );

    private static final List<String> PUBLIC_GET_PATHS = List.of(
            "/products"
    );

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.issuer}")
    private String issuer;

    @Value("${jwt.audience}")
    private String audience;

    @Value("${internal.secret}")
    private String internalSecret;

    public HandlerFilterFunction<ServerResponse, ServerResponse> filter() {
        return (request, next) -> {
            if (isPublicRoute(request)) {
                ServerRequest mutated = ServerRequest.from(request)
                        .header("X-Internal-Secret", internalSecret)
                        .build();
                return next.handle(mutated);
            }

            String authHeader = request.headers().firstHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ServerResponse.status(HttpStatus.UNAUTHORIZED)
                        .body("{\"error\":\"Token não fornecido\"}");
            }

            try {
                String token = authHeader.substring(7);
                Claims claims = extractClaims(token);
                String userId = claims.getSubject();
                String email = claims.get("email", String.class);
                String role = claims.get("role", String.class);

                ServerRequest mutatedRequest = ServerRequest.from(request)
                        .header("X-User-Id", userId != null ? userId : "")
                        .header("X-User-Email", email != null ? email : "")
                        .header("X-User-Role", role != null ? role : "USER")
                        .header("X-Internal-Secret", internalSecret)
                        .build();

                return next.handle(mutatedRequest);
            } catch (Exception e) {
                return ServerResponse.status(HttpStatus.UNAUTHORIZED)
                        .body("{\"error\":\"Token inválido ou expirado\"}");
            }
        };
    }

    private boolean isPublicRoute(ServerRequest request) {
        String path = request.uri().getPath();
        String method = request.method().name();

        for (String publicPath : PUBLIC_PATHS) {
            if (path.startsWith(publicPath)) return true;
        }

        if ("GET".equalsIgnoreCase(method)) {
            for (String publicGetPath : PUBLIC_GET_PATHS) {
                if (path.startsWith(publicGetPath)) return true;
            }
        }

        return false;
    }

    private Claims extractClaims(String token) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);
        return Jwts.parser()
                .verifyWith(key)
                .requireIssuer(issuer)
                .requireAudience(audience)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
