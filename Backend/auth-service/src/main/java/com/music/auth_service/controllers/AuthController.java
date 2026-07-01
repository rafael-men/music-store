package com.music.auth_service.controllers;

import com.music.auth_service.dtos.AuthResponse;
import com.music.auth_service.dtos.LoginRequest;
import com.music.auth_service.dtos.RegisterRequest;
import com.music.auth_service.dtos.UserResponse;
import com.music.auth_service.exceptions.EmailAlreadyExistsException;
import com.music.auth_service.models.User;
import com.music.auth_service.security.CustomUserDetails;
import com.music.auth_service.security.JwtService;
import com.music.auth_service.security.TokenRevocationService;
import com.music.auth_service.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/users")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final TokenRevocationService revocationService;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          UserService userService,
                          TokenRevocationService revocationService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userService = userService;
        this.revocationService = revocationService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse userResponse;
        try {
            userResponse = userService.register(request);
        } catch (EmailAlreadyExistsException ex) {
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(new AuthResponse(
                    null, null, null, null, null
            ));
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Map<String, Object> claims = Map.of(
                "userId", userDetails.getId().toString(),
                "email", userDetails.getUsername(),
                "role", userResponse.role().name()
        );
        String token = jwtService.generateToken(userDetails.getId().toString(), claims);

        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(
                token,
                userResponse.id(),
                userResponse.email(),
                userResponse.name(),
                userResponse.role()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();
        Map<String, Object> claims = Map.of(
                "userId", user.getId().toString(),
                "email", user.getEmail(),
                "role", user.getRole().name()
        );
        String token = jwtService.generateToken(user.getId().toString(), claims);

        return ResponseEntity.ok(new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole()
        ));
    }


    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Authorization Bearer ausente"));
        }
        String token = authHeader.substring(7);
        try {
            String jti = jwtService.extractJti(token);
            java.util.Date exp = jwtService.extractExpiration(token);
            revocationService.revoke(jti, exp != null ? exp.toInstant() : null);
        } catch (Exception ignored) {
        }
        return ResponseEntity.ok(Map.of("message", "Sessão encerrada"));
    }
}