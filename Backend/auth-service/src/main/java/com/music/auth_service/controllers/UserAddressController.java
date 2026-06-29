package com.music.auth_service.controllers;

import com.music.auth_service.dtos.UserAddressDTO;
import com.music.auth_service.services.UserAddressService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users/{userId}/addresses")
public class UserAddressController {

    private final UserAddressService service;

    public UserAddressController(UserAddressService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("#userId.toString() == authentication.principal.id.toString() or hasRole('ADMIN')")
    public ResponseEntity<List<UserAddressDTO>> list(@PathVariable UUID userId) {
        return ResponseEntity.ok(service.listByUser(userId));
    }

    @PostMapping
    @PreAuthorize("#userId.toString() == authentication.principal.id.toString()")
    public ResponseEntity<UserAddressDTO> create(@PathVariable UUID userId, @RequestBody @Valid UserAddressDTO dto) {
        UserAddressDTO created = service.create(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{addressId}")
    @PreAuthorize("#userId.toString() == authentication.principal.id.toString()")
    public ResponseEntity<UserAddressDTO> update(@PathVariable UUID userId,
                                                 @PathVariable UUID addressId,
                                                 @RequestBody @Valid UserAddressDTO dto) {
        return ResponseEntity.ok(service.update(userId, addressId, dto));
    }

    @DeleteMapping("/{addressId}")
    @PreAuthorize("#userId.toString() == authentication.principal.id.toString()")
    public ResponseEntity<Void> delete(@PathVariable UUID userId, @PathVariable UUID addressId) {
        service.delete(userId, addressId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{addressId}/default")
    @PreAuthorize("#userId.toString() == authentication.principal.id.toString()")
    public ResponseEntity<UserAddressDTO> setDefault(@PathVariable UUID userId, @PathVariable UUID addressId) {
        return ResponseEntity.ok(service.setDefault(userId, addressId));
    }
}
