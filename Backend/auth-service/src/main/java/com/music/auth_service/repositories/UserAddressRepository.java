package com.music.auth_service.repositories;

import com.music.auth_service.models.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, UUID> {

    List<UserAddress> findByUserIdOrderByIsDefaultDescCreatedAtAsc(UUID userId);

    Optional<UserAddress> findByIdAndUserId(UUID id, UUID userId);

    long countByUserId(UUID userId);

    @Modifying
    @Query("update UserAddress a set a.isDefault = false where a.userId = :userId and a.id <> :exceptId")
    void clearDefaultExcept(@Param("userId") UUID userId, @Param("exceptId") UUID exceptId);
}
