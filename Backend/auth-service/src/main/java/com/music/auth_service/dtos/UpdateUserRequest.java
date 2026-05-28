package com.music.auth_service.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        String name,
        @Email(message = "Email Inválido")
        String email,
        @Size(min = 8, message = "A senha deve ter pelo menos 8 caracteres")
        @Pattern(
                regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!*]).+$",
                message = "A senha deve conter pelo menos uma letra maiúscula, um número e um caractere especial"
        )
        String password,
        String currentPassword,
        String cpf,
        String profilePhotoUrl,
        AddressDTO address
) {}
