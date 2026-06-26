package com.music.auth_service.security;

import com.music.auth_service.repositories.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        String normalized = email == null ? null : email.trim().toLowerCase();
        return userRepository.findByEmail(normalized)
                .map(CustomUserDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com email: " + email));
    }

    public UserDetails loadUserById(String id) throws UsernameNotFoundException {
        try {
            UUID userId = UUID.fromString(id);
            return userRepository.findById(userId)
                    .map(CustomUserDetails::new)
                    .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com id: " + id));
        } catch (IllegalArgumentException ex) {
            throw new UsernameNotFoundException("ID de usuário inválido: " + id);
        }
    }
}
