package com.manipro.leavemanagement.controller;

import com.manipro.leavemanagement.dto.DashboardStats;
import com.manipro.leavemanagement.service.DashboardService;
import com.manipro.leavemanagement.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);

    @Autowired
    private DashboardService dashboardService;

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

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.info("getDashboardStats called - Authenticated: " + (auth != null) + ", Principal: " + (auth != null ? auth.getPrincipal() : "null"));
        if (auth != null) {
            logger.info("Authorities: " + auth.getAuthorities());
        }
        
        UUID userId = getUserIdFromToken(request);
        String role = getRoleFromToken(request);
        logger.info("User ID: " + userId + ", Role: " + role);
        
        DashboardStats stats;
        if ("STUDENT".equals(role)) {
            stats = dashboardService.getStudentDashboardStats(userId);
        } else if ("TEACHER".equals(role)) {
            stats = dashboardService.getTeacherDashboardStats(userId);
        } else {
            logger.warn("Invalid role for dashboard stats: " + role);
            return ResponseEntity.status(403).build();
        }
        
        logger.info("Returning dashboard stats for role: " + role);
        return ResponseEntity.ok(stats);
    }
}
