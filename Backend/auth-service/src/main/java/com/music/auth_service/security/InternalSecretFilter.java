package com.music.auth_service.security;

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


@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class InternalSecretFilter extends OncePerRequestFilter {

    @Value("${internal.secret}")
    private String expectedSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String path = request.getRequestURI();
        if (!path.startsWith("/internal/")) {
            chain.doFilter(request, response);
            return;
        }

        String received = request.getHeader("X-Internal-Secret");
        if (!secretMatches(received)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Acesso interno não autorizado.\"}");
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
