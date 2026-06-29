package com.music.auth_service.dtos;

import com.music.auth_service.models.UserAddress;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UserAddressDTO(
        UUID id,
        @NotBlank @Size(max = 60) String label,
        String street,
        String number,
        String complement,
        String neighborhood,
        String city,
        String state,
        String zipCode,
        boolean isDefault
) {
    public static UserAddressDTO from(UserAddress a) {
        return new UserAddressDTO(
                a.getId(), a.getLabel(),
                a.getStreet(), a.getNumber(), a.getComplement(), a.getNeighborhood(),
                a.getCity(), a.getState(), a.getZipCode(),
                a.isDefault()
        );
    }
}
