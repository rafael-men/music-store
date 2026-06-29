package com.music.auth_service.services;

import com.music.auth_service.dtos.UserAddressDTO;

import java.util.List;
import java.util.UUID;

public interface UserAddressService {
    List<UserAddressDTO> listByUser(UUID userId);
    UserAddressDTO create(UUID userId, UserAddressDTO dto);
    UserAddressDTO update(UUID userId, UUID addressId, UserAddressDTO dto);
    void delete(UUID userId, UUID addressId);
    UserAddressDTO setDefault(UUID userId, UUID addressId);
}
