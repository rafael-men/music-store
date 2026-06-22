package com.music.notification_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class InternalSecretFilter extends OncePerRequestFilter {

    private static final List<String> WHITELIST = List.of(
            "/actuator/health",
            "/actuator/info",
            "/swagger-ui",
            "/v3/api-docs"
    );

    @Value("${internal.secret}")
    private String expectedSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String path = request.getRequestURI();
        for (String allowed : WHITELIST) {
            if (path.startsWith(allowed)) {
                chain.doFilter(request, response);
                return;
            }
        }

        String received = request.getHeader("X-Internal-Secret");
        if (!secretMatches(received)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Acesso direto não permitido. Use o gateway.\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    private boolean secretMatches(String received) {
        if (received == null || expectedSecret == null) return false;
        return MessageDigest.isEqual(
                received.getBytes(StandardCharsets.UTF_8),
                expectedSecret.getBytes(StandardCharsets.UTF_8)
        );
    }
}
