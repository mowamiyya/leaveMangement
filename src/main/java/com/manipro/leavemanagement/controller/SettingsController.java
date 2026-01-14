package com.manipro.leavemanagement.controller;

import com.manipro.leavemanagement.dto.UserSettingsRequest;
import com.manipro.leavemanagement.entity.UserSettings;
import com.manipro.leavemanagement.service.UserSettingsService;
import com.manipro.leavemanagement.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class SettingsController {

    @Autowired
    private UserSettingsService userSettingsService;

    @Autowired
    private JwtUtil jwtUtil;

    private UUID getUserIdFromToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }

    private String getRoleFromToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractRole(token);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserSettings(HttpServletRequest request) {
        UUID userId = getUserIdFromToken(request);
        String role = getRoleFromToken(request);
        UserSettings.UserRole userRole = UserSettings.UserRole.valueOf(role);
        Map<String, Object> settings = userSettingsService.getUserSettings(userId, userRole);
        return ResponseEntity.ok(settings);
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> updateUserSettings(
            @RequestBody UserSettingsRequest request, HttpServletRequest httpRequest) {
        UUID userId = getUserIdFromToken(httpRequest);
        String role = getRoleFromToken(httpRequest);
        UserSettings.UserRole userRole = UserSettings.UserRole.valueOf(role);
        Map<String, Object> settings = userSettingsService.updateUserSettings(userId, userRole, request);
        return ResponseEntity.ok(settings);
    }
}
