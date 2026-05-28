package com.music.auth_service.controllers;

import com.music.auth_service.dtos.AuthResponse;
import com.music.auth_service.dtos.LoginRequest;
import com.music.auth_service.dtos.RegisterRequest;
import com.music.auth_service.dtos.UserResponse;
import com.music.auth_service.models.User;
import com.music.auth_service.security.CustomUserDetails;
import com.music.auth_service.security.JwtService;
import com.music.auth_service.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/users")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse userResponse = userService.register(request);
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
}