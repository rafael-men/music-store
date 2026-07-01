package com.music.auth_service.controllers;

import com.music.auth_service.security.TokenRevocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;


@RestController
@RequestMapping("/internal/jti")
public class TokenStatusController {

    private final TokenRevocationService revocationService;

    public TokenStatusController(TokenRevocationService revocationService) {
        this.revocationService = revocationService;
    }

    @GetMapping("/{jti}/revoked")
    public ResponseEntity<Map<String, Boolean>> isRevoked(@PathVariable String jti) {
        return ResponseEntity.ok(Map.of("revoked", revocationService.isRevoked(jti)));
    }
}
