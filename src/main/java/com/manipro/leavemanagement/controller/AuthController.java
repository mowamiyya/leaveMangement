package com.manipro.leavemanagement.controller;

import com.manipro.leavemanagement.dto.ForgotPasswordRequest;
import com.manipro.leavemanagement.dto.LoginRequest;
import com.manipro.leavemanagement.dto.LoginResponse;
import com.manipro.leavemanagement.dto.RegistrationRequest;
import com.manipro.leavemanagement.dto.RegistrationResponse;
import com.manipro.leavemanagement.dto.ResetPasswordRequest;
import com.manipro.leavemanagement.dto.UpdatePasswordRequest;
import com.manipro.leavemanagement.service.AuthService;
import com.manipro.leavemanagement.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getRemoteAddr();
        LoginResponse response = authService.login(request, ipAddress);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<RegistrationResponse> register(@Valid @RequestBody RegistrationRequest request, HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getRemoteAddr();
        RegistrationResponse response = authService.register(request, ipAddress);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update-password")
    public ResponseEntity<Map<String, String>> updatePassword(
            @Valid @RequestBody UpdatePasswordRequest request,
            HttpServletRequest httpRequest) {
        String token = extractToken(httpRequest);
        if (token == null) {
            throw new RuntimeException("Authentication required");
        }
        
        UUID userId = jwtUtil.extractUserId(token);
        String role = jwtUtil.extractRole(token);
        String ipAddress = httpRequest.getRemoteAddr();
        
        authService.updatePassword(userId, role, request, ipAddress);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password updated successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        String code = authService.generateConfirmationCode(request);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Confirmation code generated. Please check console for the code.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request,
            HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getRemoteAddr();
        authService.resetPassword(request, ipAddress);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successfully");
        return ResponseEntity.ok(response);
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
