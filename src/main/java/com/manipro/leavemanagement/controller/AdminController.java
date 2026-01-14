package com.manipro.leavemanagement.controller;

import com.manipro.leavemanagement.dto.ClassRequest;
import com.manipro.leavemanagement.dto.DepartmentRequest;
import com.manipro.leavemanagement.entity.*;
import com.manipro.leavemanagement.service.AdminService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private AdminService adminService;

    // Department endpoints
    @PostMapping("/departments")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Department> createDepartment(@Valid @RequestBody DepartmentRequest request) {
        Department department = adminService.createDepartment(request);
        return ResponseEntity.ok(department);
    }

    @GetMapping("/departments")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(adminService.getAllDepartments());
    }

    @PutMapping("/departments/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Department> updateDepartment(@PathVariable UUID id, @Valid @RequestBody DepartmentRequest request) {
        Department department = adminService.updateDepartment(id, request);
        return ResponseEntity.ok(department);
    }

    @DeleteMapping("/departments/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteDepartment(@PathVariable UUID id) {
        adminService.deleteDepartment(id);
        return ResponseEntity.ok(Map.of("message", "Department soft deleted successfully"));
    }

    @DeleteMapping("/departments/{id}/hard")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> hardDeleteDepartment(@PathVariable UUID id) {
        adminService.hardDeleteDepartment(id);
        return ResponseEntity.ok(Map.of("message", "Department hard deleted successfully"));
    }

    // Class endpoints
    @PostMapping("/classes")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<com.manipro.leavemanagement.entity.Class> createClass(@Valid @RequestBody ClassRequest request) {
        com.manipro.leavemanagement.entity.Class classEntity = adminService.createClass(request);
        return ResponseEntity.ok(classEntity);
    }

    @GetMapping(value = "/classes", produces = "application/json")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<com.manipro.leavemanagement.entity.Class>> getAllClasses() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            logger.info("getAllClasses called - Authenticated: " + (auth != null) + ", Principal: " + (auth != null ? auth.getPrincipal() : "null"));
            if (auth != null) {
                logger.info("Authorities: " + auth.getAuthorities());
                logger.info("Is Authenticated: " + auth.isAuthenticated());
            } else {
                logger.error("Authentication is NULL in getAllClasses!");
            }
            List<com.manipro.leavemanagement.entity.Class> classes = adminService.getAllClasses();
            logger.info("Returning " + classes.size() + " classes");
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            logger.error("Error in getAllClasses: " + e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping("/classes/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<com.manipro.leavemanagement.entity.Class> updateClass(@PathVariable UUID id, @Valid @RequestBody ClassRequest request) {
        com.manipro.leavemanagement.entity.Class classEntity = adminService.updateClass(id, request);
        return ResponseEntity.ok(classEntity);
    }

    @DeleteMapping("/classes/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteClass(@PathVariable UUID id) {
        adminService.deleteClass(id);
        return ResponseEntity.ok(Map.of("message", "Class soft deleted successfully"));
    }

    @DeleteMapping("/classes/{id}/hard")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> hardDeleteClass(@PathVariable UUID id) {
        adminService.hardDeleteClass(id);
        return ResponseEntity.ok(Map.of("message", "Class hard deleted successfully"));
    }

    // Teacher endpoints
    @GetMapping("/teachers")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Teacher>> getAllTeachers() {
        return ResponseEntity.ok(adminService.getAllTeachers());
    }

    @DeleteMapping("/teachers/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteTeacher(@PathVariable UUID id) {
        adminService.deleteTeacher(id);
        return ResponseEntity.ok(Map.of("message", "Teacher deleted successfully"));
    }

    // Student endpoints
    @GetMapping("/students")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }

    @DeleteMapping("/students/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteStudent(@PathVariable UUID id) {
        adminService.deleteStudent(id);
        return ResponseEntity.ok(Map.of("message", "Student deleted successfully"));
    }

    // Class Teacher Assignment
    @PostMapping("/class-teachers")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ClassTeacher> assignClassTeacher(@RequestBody Map<String, String> request) {
        UUID classId = UUID.fromString(request.get("classId"));
        UUID teacherId = UUID.fromString(request.get("teacherId"));
        ClassTeacher classTeacher = adminService.assignClassTeacher(classId, teacherId);
        return ResponseEntity.ok(classTeacher);
    }

    @GetMapping("/class-teachers")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<ClassTeacher>> getAllClassTeachers() {
        return ResponseEntity.ok(adminService.getAllClassTeachers());
    }

    @PutMapping("/class-teachers/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ClassTeacher> updateClassTeacher(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        UUID classId = UUID.fromString(request.get("classId"));
        UUID teacherId = UUID.fromString(request.get("teacherId"));
        ClassTeacher classTeacher = adminService.updateClassTeacher(id, classId, teacherId);
        return ResponseEntity.ok(classTeacher);
    }

    @DeleteMapping("/class-teachers/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteClassTeacher(@PathVariable UUID id) {
        adminService.deleteClassTeacher(id);
        return ResponseEntity.ok(Map.of("message", "Class teacher assignment deleted successfully"));
    }

    // Audit Log endpoints
    @GetMapping("/audit-logs")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<AuditLog>> getAuditLogs(
            @RequestParam AuditLog.EntityType entityType,
            @RequestParam UUID entityId) {
        return ResponseEntity.ok(adminService.getAuditLogs(entityType, entityId));
    }

    // Leave Statistics endpoint
    @GetMapping("/leave-statistics")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Long>> getLeaveStatistics() {
        return ResponseEntity.ok(adminService.getLeaveStatistics());
    }

    // Debug endpoint to check authentication
    @GetMapping("/debug/auth")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> debugAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> debugInfo = new HashMap<>();
        debugInfo.put("authenticated", auth != null);
        if (auth != null) {
            debugInfo.put("principal", auth.getPrincipal().toString());
            debugInfo.put("authorities", auth.getAuthorities().stream()
                    .map(a -> a.getAuthority()).toList());
            debugInfo.put("authenticated", auth.isAuthenticated());
        }
        logger.info("Debug Auth Info: " + debugInfo);
        return ResponseEntity.ok(debugInfo);
    }
}
