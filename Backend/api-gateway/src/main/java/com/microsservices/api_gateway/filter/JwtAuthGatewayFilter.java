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
import java.util.regex.Pattern;

@Component
public class JwtAuthGatewayFilter {

    private static final List<Pattern> PUBLIC_PATHS = List.of(
            Pattern.compile("^/users/register$"),
            Pattern.compile("^/users/login$"),
            Pattern.compile("^/swagger-ui(/.*)?$"),
            Pattern.compile("^/swagger-ui\\.html$"),
            Pattern.compile("^/v3/api-docs(/.*)?$")
    );

    private static final List<Pattern> PUBLIC_GET_PATHS = List.of(
            Pattern.compile("^/products$"),
            Pattern.compile("^/products/[^/]+$")
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
            // CORS preflight: deixa o handler de CORS responder. Sem isso, o navegador bloqueia
            // todas as requisições POST/PUT/DELETE/PATCH que exigem Authorization.
            if ("OPTIONS".equalsIgnoreCase(request.method().name())) {
                return next.handle(request);
            }

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

                String method = request.method().name();
                boolean isMutation = !"GET".equalsIgnoreCase(method) && !"OPTIONS".equalsIgnoreCase(method);
                if (isMutation && (userId == null || userId.isBlank())) {
                    return ServerResponse.status(HttpStatus.UNAUTHORIZED)
                            .body("{\"error\":\"Token sem identificação de usuário\"}");
                }

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

        for (Pattern p : PUBLIC_PATHS) {
            if (p.matcher(path).matches()) return true;
        }

        if ("GET".equalsIgnoreCase(method)) {
            for (Pattern p : PUBLIC_GET_PATHS) {
                if (p.matcher(path).matches()) return true;
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
