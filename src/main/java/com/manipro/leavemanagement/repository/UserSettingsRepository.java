package com.manipro.leavemanagement.repository;

import com.manipro.leavemanagement.entity.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSettingsRepository extends JpaRepository<UserSettings, UUID> {
    Optional<UserSettings> findByUserIdAndUserRole(UUID userId, UserSettings.UserRole userRole);
}
