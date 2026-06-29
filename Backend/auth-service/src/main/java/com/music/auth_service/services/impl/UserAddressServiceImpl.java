package com.music.auth_service.services.impl;

import com.music.auth_service.dtos.UserAddressDTO;
import com.music.auth_service.exceptions.UserNotFoundException;
import com.music.auth_service.models.UserAddress;
import com.music.auth_service.repositories.UserAddressRepository;
import com.music.auth_service.repositories.UserRepository;
import com.music.auth_service.services.UserAddressService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UserAddressServiceImpl implements UserAddressService {

    private final UserAddressRepository addressRepository;
    private final UserRepository userRepository;

    public UserAddressServiceImpl(UserAddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<UserAddressDTO> listByUser(UUID userId) {
        ensureUserExists(userId);
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtAsc(userId)
                .stream().map(UserAddressDTO::from).toList();
    }

    @Override
    @Transactional
    public UserAddressDTO create(UUID userId, UserAddressDTO dto) {
        ensureUserExists(userId);
        boolean firstAddress = addressRepository.countByUserId(userId) == 0;
        boolean makeDefault = firstAddress || dto.isDefault();

        UserAddress addr = new UserAddress(
                userId, dto.label(),
                dto.street(), dto.number(), dto.complement(), dto.neighborhood(),
                dto.city(), dto.state(), dto.zipCode(),
                makeDefault
        );
        UserAddress saved = addressRepository.save(addr);
        if (makeDefault) {
            addressRepository.clearDefaultExcept(userId, saved.getId());
        }
        return UserAddressDTO.from(saved);
    }

    @Override
    @Transactional
    public UserAddressDTO update(UUID userId, UUID addressId, UserAddressDTO dto) {
        UserAddress addr = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new UserNotFoundException("Endereço não encontrado: " + addressId));
        addr.setLabel(dto.label());
        addr.setStreet(dto.street());
        addr.setNumber(dto.number());
        addr.setComplement(dto.complement());
        addr.setNeighborhood(dto.neighborhood());
        addr.setCity(dto.city());
        addr.setState(dto.state());
        addr.setZipCode(dto.zipCode());

        if (dto.isDefault() && !addr.isDefault()) {
            addr.setDefault(true);
            addressRepository.save(addr);
            addressRepository.clearDefaultExcept(userId, addr.getId());
        } else {
            addressRepository.save(addr);
        }
        return UserAddressDTO.from(addr);
    }

    @Override
    @Transactional
    public void delete(UUID userId, UUID addressId) {
        UserAddress addr = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new UserNotFoundException("Endereço não encontrado: " + addressId));
        boolean wasDefault = addr.isDefault();
        addressRepository.delete(addr);

        // Se o default foi deletado, promove o mais antigo restante (se houver).
        if (wasDefault) {
            addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtAsc(userId)
                    .stream().findFirst()
                    .ifPresent(next -> {
                        next.setDefault(true);
                        addressRepository.save(next);
                    });
        }
    }

    @Override
    @Transactional
    public UserAddressDTO setDefault(UUID userId, UUID addressId) {
        UserAddress addr = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new UserNotFoundException("Endereço não encontrado: " + addressId));
        addr.setDefault(true);
        addressRepository.save(addr);
        addressRepository.clearDefaultExcept(userId, addr.getId());
        return UserAddressDTO.from(addr);
    }

    private void ensureUserExists(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException(userId);
        }
    }
}
