package com.music.auth_service.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;


@Service
public class TokenRevocationService {

    private static final Boolean SENTINEL = Boolean.TRUE;

    private final Cache<String, Boolean> revoked = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofHours(24))
            .maximumSize(50_000)
            .build();

    public void revoke(String jti, Instant expiresAt) {
        if (jti == null || jti.isBlank()) return;
        revoked.put(jti, SENTINEL);
    }

    public boolean isRevoked(String jti) {
        if (jti == null || jti.isBlank()) return false;
        return revoked.getIfPresent(jti) != null;
    }
}
