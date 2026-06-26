package com.music.order_service.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;

import java.util.Map;

@Component
public class OrderSecurityInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String method = request.getMethod();
        String path = request.getRequestURI();
        String role = request.getHeader("X-User-Role");
        String authenticatedUserId = request.getHeader("X-User-Id");

        if (authenticatedUserId == null || authenticatedUserId.isBlank()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Autenticação necessária\"}");
            return false;
        }

        boolean isAdmin = "ADMIN".equals(role);
        boolean isStatusUpdate = "PATCH".equalsIgnoreCase(method) && path.contains("/status");
        boolean isTrackingUpdate = "PATCH".equalsIgnoreCase(method) && path.contains("/tracking");
        boolean isListAll = "GET".equalsIgnoreCase(method) && ("/orders".equals(path) || "/orders/".equals(path));

        
        if (isStatusUpdate || isTrackingUpdate || isListAll) {
            if (!isAdmin) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Apenas administradores podem acessar este recurso\"}");
                return false;
            }
            return true;
        }

       

        @SuppressWarnings("unchecked")
        Map<String, String> pathVars = (Map<String, String>) request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);

        
        if (pathVars != null) {
            String pathUserId = pathVars.get("userId");
            if (pathUserId != null && !isAdmin && !pathUserId.equals(authenticatedUserId)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Acesso negado aos pedidos de outro usuário\"}");
                return false;
            }
        }

        return true;
    }
}
