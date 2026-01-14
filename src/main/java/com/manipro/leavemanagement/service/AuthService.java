package com.manipro.leavemanagement.service;

import com.manipro.leavemanagement.dto.ForgotPasswordRequest;
import com.manipro.leavemanagement.dto.LoginRequest;
import com.manipro.leavemanagement.dto.LoginResponse;
import com.manipro.leavemanagement.dto.RegistrationRequest;
import com.manipro.leavemanagement.dto.RegistrationResponse;
import com.manipro.leavemanagement.dto.ResetPasswordRequest;
import com.manipro.leavemanagement.dto.UpdatePasswordRequest;
import com.manipro.leavemanagement.entity.Admin;
import com.manipro.leavemanagement.entity.AuditLog;
import com.manipro.leavemanagement.entity.Class;
import com.manipro.leavemanagement.entity.Department;
import com.manipro.leavemanagement.entity.Student;
import com.manipro.leavemanagement.entity.Teacher;
import com.manipro.leavemanagement.repository.AdminRepository;
import com.manipro.leavemanagement.repository.AuditLogRepository;
import com.manipro.leavemanagement.repository.ClassRepository;
import com.manipro.leavemanagement.repository.DepartmentRepository;
import com.manipro.leavemanagement.repository.StudentRepository;
import com.manipro.leavemanagement.repository.TeacherRepository;
import com.manipro.leavemanagement.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuditLogRepository auditLogRepository;

    // In-memory store for confirmation codes (email -> code)
    private final Map<String, String> confirmationCodes = new ConcurrentHashMap<>();

    public LoginResponse login(LoginRequest request, String ipAddress) {
        // Try admin first
        Admin admin = adminRepository.findByEmailAndIsActiveTrue(request.getEmail()).orElse(null);
        if (admin != null) {
            if (passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
                String accessToken = jwtUtil.generateToken(admin.getEmail(), "ADMIN", admin.getAdminId());
                String refreshToken = jwtUtil.generateRefreshToken(admin.getEmail(), "ADMIN", admin.getAdminId());
                
                logAudit(AuditLog.EntityType.USER, admin.getAdminId(), AuditLog.Action.LOGIN, 
                        null, createUserMap(admin), admin.getAdminId(), ipAddress);
                
                return new LoginResponse(accessToken, refreshToken, "ADMIN", 
                        admin.getAdminId().toString(), admin.getName(), admin.getEmail());
            }
            throw new RuntimeException("Invalid credentials");
        }

        // Try student
        Student student = studentRepository.findByEmailAndIsActiveTrue(request.getEmail()).orElse(null);
        if (student != null) {
            if (passwordEncoder.matches(request.getPassword(), student.getPassword())) {
                String accessToken = jwtUtil.generateToken(student.getEmail(), "STUDENT", student.getStudentId());
                String refreshToken = jwtUtil.generateRefreshToken(student.getEmail(), "STUDENT", student.getStudentId());
                
                logAudit(AuditLog.EntityType.USER, student.getStudentId(), AuditLog.Action.LOGIN, 
                        null, createUserMap(student), student.getStudentId(), ipAddress);
                
                return new LoginResponse(accessToken, refreshToken, "STUDENT", 
                        student.getStudentId().toString(), student.getName(), student.getEmail());
            }
            throw new RuntimeException("Invalid credentials");
        }

        // Try teacher
        Teacher teacher = teacherRepository.findByEmailAndIsActiveTrue(request.getEmail()).orElse(null);
        if (teacher != null) {
            if (passwordEncoder.matches(request.getPassword(), teacher.getPassword())) {
                String accessToken = jwtUtil.generateToken(teacher.getEmail(), "TEACHER", teacher.getTeacherId());
                String refreshToken = jwtUtil.generateRefreshToken(teacher.getEmail(), "TEACHER", teacher.getTeacherId());
                
                logAudit(AuditLog.EntityType.USER, teacher.getTeacherId(), AuditLog.Action.LOGIN, 
                        null, createUserMap(teacher), teacher.getTeacherId(), ipAddress);
                
                return new LoginResponse(accessToken, refreshToken, "TEACHER", 
                        teacher.getTeacherId().toString(), teacher.getName(), teacher.getEmail());
            }
            throw new RuntimeException("Invalid credentials");
        }

        throw new RuntimeException("User not found");
    }

    public RegistrationResponse register(RegistrationRequest request, String ipAddress) {
        // Check if email already exists
        if (studentRepository.findByEmail(request.getEmail()).isPresent() || 
            teacherRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        if ("STUDENT".equalsIgnoreCase(request.getRole())) {
            return registerStudent(request, ipAddress);
        } else if ("TEACHER".equalsIgnoreCase(request.getRole())) {
            return registerTeacher(request, ipAddress);
        } else {
            throw new RuntimeException("Invalid role. Must be STUDENT or TEACHER");
        }
    }

    private RegistrationResponse registerStudent(RegistrationRequest request, String ipAddress) {
        if (request.getClassId() == null || request.getDepartmentId() == null) {
            throw new RuntimeException("Class ID and Department ID are required for student registration");
        }

        Class classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new RuntimeException("Class not found"));
        
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        if (!classEntity.getDepartment().getDepartmentId().equals(department.getDepartmentId())) {
            throw new RuntimeException("Class does not belong to the specified department");
        }

        Student student = new Student();
        student.setName(request.getName());
        student.setEmail(request.getEmail());
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setClassEntity(classEntity);
        student.setDepartment(department);
        student.setIsActive(true);

        student = studentRepository.save(student);

        // Audit log
        logAudit(AuditLog.EntityType.USER, student.getStudentId(), AuditLog.Action.CREATE, 
                null, createUserMap(student), student.getStudentId(), ipAddress);

        return new RegistrationResponse(
                "Student registered successfully",
                student.getStudentId().toString(),
                student.getName(),
                student.getEmail(),
                "STUDENT"
        );
    }

    private RegistrationResponse registerTeacher(RegistrationRequest request, String ipAddress) {
        if (request.getTeacherDepartmentId() == null) {
            throw new RuntimeException("Department ID is required for teacher registration");
        }

        Department department = departmentRepository.findById(request.getTeacherDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        Teacher teacher = new Teacher();
        teacher.setName(request.getName());
        teacher.setEmail(request.getEmail());
        teacher.setPassword(passwordEncoder.encode(request.getPassword()));
        teacher.setDepartment(department);
        teacher.setIsActive(true);

        teacher = teacherRepository.save(teacher);

        // Audit log
        logAudit(AuditLog.EntityType.USER, teacher.getTeacherId(), AuditLog.Action.CREATE, 
                null, createUserMap(teacher), teacher.getTeacherId(), ipAddress);

        return new RegistrationResponse(
                "Teacher registered successfully",
                teacher.getTeacherId().toString(),
                teacher.getName(),
                teacher.getEmail(),
                "TEACHER"
        );
    }

    private Map<String, Object> createUserMap(Object user) {
        Map<String, Object> map = new HashMap<>();
        if (user instanceof Admin) {
            Admin a = (Admin) user;
            map.put("email", a.getEmail());
            map.put("name", a.getName());
            map.put("role", "ADMIN");
        } else if (user instanceof Student) {
            Student s = (Student) user;
            map.put("email", s.getEmail());
            map.put("name", s.getName());
            map.put("role", "STUDENT");
        } else if (user instanceof Teacher) {
            Teacher t = (Teacher) user;
            map.put("email", t.getEmail());
            map.put("name", t.getName());
            map.put("role", "TEACHER");
        }
        return map;
    }

    public void updatePassword(UUID userId, String role, UpdatePasswordRequest request, String ipAddress) {
        if ("ADMIN".equals(role)) {
            Admin admin = adminRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
            if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }
            admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
            adminRepository.save(admin);
            
            logAudit(AuditLog.EntityType.USER, admin.getAdminId(), AuditLog.Action.UPDATE, 
                    createUserMap(admin), createUserMap(admin), admin.getAdminId(), ipAddress);
        } else if ("STUDENT".equals(role)) {
            Student student = studentRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            if (!passwordEncoder.matches(request.getCurrentPassword(), student.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }
            student.setPassword(passwordEncoder.encode(request.getNewPassword()));
            studentRepository.save(student);
            
            logAudit(AuditLog.EntityType.USER, student.getStudentId(), AuditLog.Action.UPDATE, 
                    createUserMap(student), createUserMap(student), student.getStudentId(), ipAddress);
        } else if ("TEACHER".equals(role)) {
            Teacher teacher = teacherRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            if (!passwordEncoder.matches(request.getCurrentPassword(), teacher.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }
            teacher.setPassword(passwordEncoder.encode(request.getNewPassword()));
            teacherRepository.save(teacher);
            
            logAudit(AuditLog.EntityType.USER, teacher.getTeacherId(), AuditLog.Action.UPDATE, 
                    createUserMap(teacher), createUserMap(teacher), teacher.getTeacherId(), ipAddress);
        } else {
            throw new RuntimeException("Invalid role");
        }
    }

    public String generateConfirmationCode(ForgotPasswordRequest request) {
        // Check if user exists
        boolean userExists = adminRepository.findByEmailAndIsActiveTrue(request.getEmail()).isPresent() ||
                            studentRepository.findByEmailAndIsActiveTrue(request.getEmail()).isPresent() ||
                            teacherRepository.findByEmailAndIsActiveTrue(request.getEmail()).isPresent();
        
        if (!userExists) {
            throw new RuntimeException("User with this email does not exist");
        }

        // Generate 6-digit confirmation code
        Random random = new Random();
        String code = String.format("%06d", random.nextInt(1000000));
        
        // Store code (in production, this should be stored in database with expiration)
        confirmationCodes.put(request.getEmail(), code);
        
        // Log to console as requested
        System.out.println("=========================================");
        System.out.println("CONFIRMATION CODE FOR: " + request.getEmail());
        System.out.println("CODE: " + code);
        System.out.println("=========================================");
        
        return code;
    }

    public void resetPassword(ResetPasswordRequest request, String ipAddress) {
        // Verify confirmation code
        String storedCode = confirmationCodes.get(request.getEmail());
        if (storedCode == null || !storedCode.equals(request.getConfirmationCode())) {
            throw new RuntimeException("Invalid or expired confirmation code");
        }

        // Find and update user
        Admin admin = adminRepository.findByEmailAndIsActiveTrue(request.getEmail()).orElse(null);
        if (admin != null) {
            admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
            adminRepository.save(admin);
            confirmationCodes.remove(request.getEmail());
            
            logAudit(AuditLog.EntityType.USER, admin.getAdminId(), AuditLog.Action.UPDATE, 
                    createUserMap(admin), createUserMap(admin), admin.getAdminId(), ipAddress);
            return;
        }

        Student student = studentRepository.findByEmailAndIsActiveTrue(request.getEmail()).orElse(null);
        if (student != null) {
            student.setPassword(passwordEncoder.encode(request.getNewPassword()));
            studentRepository.save(student);
            confirmationCodes.remove(request.getEmail());
            
            logAudit(AuditLog.EntityType.USER, student.getStudentId(), AuditLog.Action.UPDATE, 
                    createUserMap(student), createUserMap(student), student.getStudentId(), ipAddress);
            return;
        }

        Teacher teacher = teacherRepository.findByEmailAndIsActiveTrue(request.getEmail()).orElse(null);
        if (teacher != null) {
            teacher.setPassword(passwordEncoder.encode(request.getNewPassword()));
            teacherRepository.save(teacher);
            confirmationCodes.remove(request.getEmail());
            
            logAudit(AuditLog.EntityType.USER, teacher.getTeacherId(), AuditLog.Action.UPDATE, 
                    createUserMap(teacher), createUserMap(teacher), teacher.getTeacherId(), ipAddress);
            return;
        }

        throw new RuntimeException("User not found");
    }

    private void logAudit(AuditLog.EntityType entityType, UUID entityId, AuditLog.Action action, 
                          Map<String, Object> oldValue, Map<String, Object> newValue, UUID actionBy, String ipAddress) {
        AuditLog auditLog = new AuditLog();
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setAction(action);
        auditLog.setOldValue(oldValue);
        auditLog.setNewValue(newValue);
        auditLog.setActionBy(actionBy);
        auditLog.setActionAt(LocalDateTime.now());
        auditLog.setIpAddress(ipAddress);
        auditLogRepository.save(auditLog);
    }
}
