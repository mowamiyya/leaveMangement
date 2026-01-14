package com.manipro.leavemanagement.service;

import com.manipro.leavemanagement.dto.LoginRequest;
import com.manipro.leavemanagement.entity.Student;
import com.manipro.leavemanagement.entity.Teacher;
import com.manipro.leavemanagement.repository.AdminRepository;
import com.manipro.leavemanagement.repository.AuditLogRepository;
import com.manipro.leavemanagement.repository.StudentRepository;
import com.manipro.leavemanagement.repository.TeacherRepository;
import com.manipro.leavemanagement.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuthService authService;

    private Student testStudent;
    private Teacher testTeacher;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testStudent = new Student();
        testStudent.setStudentId(UUID.randomUUID());
        testStudent.setEmail("student@test.com");
        testStudent.setPassword("encodedPassword");
        testStudent.setName("Test Student");
        testStudent.setIsActive(true);

        testTeacher = new Teacher();
        testTeacher.setTeacherId(UUID.randomUUID());
        testTeacher.setEmail("teacher@test.com");
        testTeacher.setPassword("encodedPassword");
        testTeacher.setName("Test Teacher");
        testTeacher.setIsActive(true);

        loginRequest = new LoginRequest();
        loginRequest.setEmail("student@test.com");
        loginRequest.setPassword("password");
    }

    @Test
    void testLogin_Success_Student() {
        when(adminRepository.findByEmailAndIsActiveTrue("student@test.com"))
                .thenReturn(Optional.empty());
        when(studentRepository.findByEmailAndIsActiveTrue("student@test.com"))
                .thenReturn(Optional.of(testStudent));
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), anyString(), any(UUID.class))).thenReturn("accessToken");
        when(jwtUtil.generateRefreshToken(anyString(), anyString(), any(UUID.class))).thenReturn("refreshToken");

        var response = authService.login(loginRequest, "127.0.0.1");

        assertNotNull(response);
        assertEquals("STUDENT", response.getRole());
        assertEquals("accessToken", response.getAccessToken());
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    void testLogin_Success_Teacher() {
        loginRequest.setEmail("teacher@test.com");
        when(adminRepository.findByEmailAndIsActiveTrue("teacher@test.com"))
                .thenReturn(Optional.empty());
        when(studentRepository.findByEmailAndIsActiveTrue("teacher@test.com"))
                .thenReturn(Optional.empty());
        when(teacherRepository.findByEmailAndIsActiveTrue("teacher@test.com"))
                .thenReturn(Optional.of(testTeacher));
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), anyString(), any(UUID.class))).thenReturn("accessToken");
        when(jwtUtil.generateRefreshToken(anyString(), anyString(), any(UUID.class))).thenReturn("refreshToken");

        var response = authService.login(loginRequest, "127.0.0.1");

        assertNotNull(response);
        assertEquals("TEACHER", response.getRole());
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    void testLogin_InvalidCredentials() {
        when(adminRepository.findByEmailAndIsActiveTrue("student@test.com"))
                .thenReturn(Optional.empty());
        when(studentRepository.findByEmailAndIsActiveTrue("student@test.com"))
                .thenReturn(Optional.of(testStudent));
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(false);

        assertThrows(RuntimeException.class, () -> authService.login(loginRequest, "127.0.0.1"));
    }

    @Test
    void testLogin_UserNotFound() {
        when(adminRepository.findByEmailAndIsActiveTrue("student@test.com"))
                .thenReturn(Optional.empty());
        when(studentRepository.findByEmailAndIsActiveTrue("student@test.com"))
                .thenReturn(Optional.empty());
        when(teacherRepository.findByEmailAndIsActiveTrue("student@test.com"))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authService.login(loginRequest, "127.0.0.1"));
    }
}
