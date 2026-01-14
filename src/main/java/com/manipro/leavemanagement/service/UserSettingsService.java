package com.manipro.leavemanagement.service;

import com.manipro.leavemanagement.dto.UserSettingsRequest;
import com.manipro.leavemanagement.entity.UserSettings;
import com.manipro.leavemanagement.repository.UserSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
public class UserSettingsService {

    @Autowired
    private UserSettingsRepository userSettingsRepository;

    public Map<String, Object> getUserSettings(UUID userId, UserSettings.UserRole role) {
        UserSettings settings = userSettingsRepository.findByUserIdAndUserRole(userId, role)
                .orElse(new UserSettings());
        return settings.getUiSettings() != null ? settings.getUiSettings() : getDefaultSettings();
    }

    public Map<String, Object> updateUserSettings(UUID userId, UserSettings.UserRole role, UserSettingsRequest request) {
        UserSettings settings = userSettingsRepository.findByUserIdAndUserRole(userId, role)
                .orElse(new UserSettings());

        if (settings.getSettingsId() == null) {
            settings.setUserId(userId);
            settings.setUserRole(role);
        }

        settings.setUiSettings(request.getUiSettings());
        userSettingsRepository.save(settings);

        return settings.getUiSettings();
    }

    private Map<String, Object> getDefaultSettings() {
        return Map.of(
                "theme", "light",
                "toastPosition", "top-right",
                "toastDuration", 3000
        );
    }
}
