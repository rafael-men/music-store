package com.music.product_service.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AdminInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String method = request.getMethod();

        if ("GET".equalsIgnoreCase(method)) {
            return true;
        }

        String uri = request.getRequestURI();
        if ("POST".equalsIgnoreCase(method) && uri != null && uri.matches("^/products/[^/]+/reserve$")) {
            return true;
        }

        String userId = request.getHeader("X-User-Id");
        if (userId == null || userId.isBlank()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Autenticação necessária\"}");
            return false;
        }

        String role = request.getHeader("X-User-Role");
        if (!"ADMIN".equals(role)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Acesso restrito a administradores\"}");
            return false;
        }

        return true;
    }
}
