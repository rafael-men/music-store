package com.music.notification_service.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;

import java.util.Map;

@Component
public class OwnerInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String authenticatedUserId = request.getHeader("X-User-Id");

        if (authenticatedUserId == null || authenticatedUserId.isBlank()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Autenticação necessária\"}");
            return false;
        }

        boolean isAdmin = "ADMIN".equalsIgnoreCase(request.getHeader("X-User-Role"));

        @SuppressWarnings("unchecked")
        Map<String, String> pathVars = (Map<String, String>) request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);

        if (pathVars != null) {
            String pathUserId = pathVars.get("userId");
            if (pathUserId != null && !isAdmin && !pathUserId.equals(authenticatedUserId)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Acesso negado às notificações de outro usuário\"}");
                return false;
            }
        }

        return true;
    }
}
