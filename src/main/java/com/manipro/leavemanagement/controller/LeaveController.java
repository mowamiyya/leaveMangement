package com.manipro.leavemanagement.controller;

import com.manipro.leavemanagement.dto.ApprovalRequest;
import com.manipro.leavemanagement.dto.LeaveRequest;
import com.manipro.leavemanagement.dto.LeaveResponse;
import com.manipro.leavemanagement.service.LeaveService;
import com.manipro.leavemanagement.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "*")
public class LeaveController {

    private static final Logger logger = LoggerFactory.getLogger(LeaveController.class);

    @Autowired
    private LeaveService leaveService;

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

    @PostMapping("/apply")
    public ResponseEntity<LeaveResponse> applyLeave(@Valid @RequestBody LeaveRequest request, HttpServletRequest httpRequest) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.info("applyLeave called - Authenticated: " + (auth != null));
        if (auth != null) {
            logger.info("Authorities: " + auth.getAuthorities());
        }
        
        UUID studentId = getUserIdFromToken(httpRequest);
        String role = getRoleFromToken(httpRequest);
        logger.info("User ID: " + studentId + ", Role: " + role);
        
        if (!"STUDENT".equals(role)) {
            logger.warn("Invalid role for applyLeave: " + role);
            return ResponseEntity.status(403).build();
        }
        LeaveResponse response = leaveService.applyLeave(studentId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-leaves")
    public ResponseEntity<List<LeaveResponse>> getMyLeaves(HttpServletRequest request) {
        UUID userId = getUserIdFromToken(request);
        String role = getRoleFromToken(request);
        if (!"STUDENT".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        List<LeaveResponse> leaves = leaveService.getStudentLeaves(userId);
        return ResponseEntity.ok(leaves);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<LeaveResponse>> getPendingLeaves(HttpServletRequest request) {
        UUID teacherId = getUserIdFromToken(request);
        String role = getRoleFromToken(request);
        if (!"TEACHER".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        List<LeaveResponse> leaves = leaveService.getPendingLeavesForTeacher(teacherId);
        return ResponseEntity.ok(leaves);
    }

    @GetMapping("/all")
    public ResponseEntity<List<LeaveResponse>> getAllLeaves(HttpServletRequest request) {
        UUID teacherId = getUserIdFromToken(request);
        String role = getRoleFromToken(request);
        if (!"TEACHER".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        List<LeaveResponse> leaves = leaveService.getAllLeavesForTeacher(teacherId);
        return ResponseEntity.ok(leaves);
    }

    @PostMapping("/approve")
    public ResponseEntity<LeaveResponse> approveLeave(@Valid @RequestBody ApprovalRequest request, HttpServletRequest httpRequest) {
        UUID teacherId = getUserIdFromToken(httpRequest);
        String role = getRoleFromToken(httpRequest);
        if (!"TEACHER".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        LeaveResponse response = leaveService.approveLeave(teacherId, request);
        return ResponseEntity.ok(response);
    }
}
