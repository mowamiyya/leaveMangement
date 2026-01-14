package com.manipro.leavemanagement.service;

import com.manipro.leavemanagement.dto.ClassRequest;
import com.manipro.leavemanagement.dto.DepartmentRequest;
import com.manipro.leavemanagement.entity.*;
import com.manipro.leavemanagement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AdminService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ClassTeacherRepository classTeacherRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private LeaveRepository leaveRepository;

    // Department Management
    @Transactional
    public Department createDepartment(DepartmentRequest request) {
        // Only check active departments for uniqueness
        if (departmentRepository.findByDepartmentNameAndIsActiveTrue(request.getDepartmentName()).isPresent()) {
            throw new RuntimeException("Department with this name already exists");
        }
        Department department = new Department();
        department.setDepartmentName(request.getDepartmentName());
        department.setIsActive(true);
        return departmentRepository.save(department);
    }

    @Transactional(readOnly = true)
    public List<Department> getAllDepartments() {
        return departmentRepository.findByIsActiveTrue();
    }

    @Transactional
    public Department updateDepartment(UUID departmentId, DepartmentRequest request) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        
        // Only check active departments for uniqueness, excluding current department
        if (!department.getDepartmentName().equals(request.getDepartmentName()) &&
            departmentRepository.findByDepartmentNameAndIsActiveTrue(request.getDepartmentName()).isPresent()) {
            throw new RuntimeException("Department with this name already exists");
        }
        
        department.setDepartmentName(request.getDepartmentName());
        return departmentRepository.save(department);
    }

    @Transactional
    public void deleteDepartment(UUID departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        department.setIsActive(false);
        departmentRepository.save(department);
    }

    @Transactional
    public void hardDeleteDepartment(UUID departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        
        // Check for active dependent records
        long activeClasses = classRepository.findByDepartment_DepartmentIdAndIsActiveTrue(departmentId).size();
        long activeTeachers = teacherRepository.findByDepartment_DepartmentIdAndIsActiveTrue(departmentId).size();
        long activeStudents = studentRepository.findByDepartment_DepartmentIdAndIsActiveTrue(departmentId).size();
        
        if (activeClasses > 0 || activeTeachers > 0 || activeStudents > 0) {
            throw new RuntimeException("Cannot hard delete department. It has " + 
                activeClasses + " active class(es), " + 
                activeTeachers + " active teacher(s), and " + 
                activeStudents + " active student(s). Please soft delete or remove dependencies first.");
        }
        
        departmentRepository.delete(department);
    }

    // Class Management
    @Transactional
    public com.manipro.leavemanagement.entity.Class createClass(ClassRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));
        
        // Ensure the department is active
        if (!department.getIsActive()) {
            throw new RuntimeException("Cannot create class for an inactive department");
        }
        
        com.manipro.leavemanagement.entity.Class classEntity = new com.manipro.leavemanagement.entity.Class();
        classEntity.setClassName(request.getClassName());
        classEntity.setDepartment(department);
        classEntity.setIsActive(true);
        return classRepository.save(classEntity);
    }

    @Transactional(readOnly = true)
    public List<com.manipro.leavemanagement.entity.Class> getAllClasses() {
        return classRepository.findByIsActiveTrue();
    }

    @Transactional
    public com.manipro.leavemanagement.entity.Class updateClass(UUID classId, ClassRequest request) {
        com.manipro.leavemanagement.entity.Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));
        
        // Ensure the department is active
        if (!department.getIsActive()) {
            throw new RuntimeException("Cannot assign class to an inactive department");
        }
        
        classEntity.setClassName(request.getClassName());
        classEntity.setDepartment(department);
        return classRepository.save(classEntity);
    }

    @Transactional
    public void deleteClass(UUID classId) {
        com.manipro.leavemanagement.entity.Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        classEntity.setIsActive(false);
        classRepository.save(classEntity);
    }

    @Transactional
    public void hardDeleteClass(UUID classId) {
        com.manipro.leavemanagement.entity.Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        
        // Check for active dependent records
        long activeStudents = studentRepository.findByClassEntity_ClassIdAndIsActiveTrue(classId).size();
        boolean hasActiveClassTeacher = classTeacherRepository.findByClassEntity_ClassIdAndIsActiveTrue(classId).isPresent();
        
        if (activeStudents > 0 || hasActiveClassTeacher) {
            throw new RuntimeException("Cannot hard delete class. It has " + 
                activeStudents + " active student(s) and " + 
                (hasActiveClassTeacher ? "1" : "0") + " active class-teacher mapping(s). Please soft delete or remove dependencies first.");
        }
        
        classRepository.delete(classEntity);
    }

    // Teacher Management
    @Transactional(readOnly = true)
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findByIsActiveTrue();
    }

    @Transactional
    public void deleteTeacher(UUID teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        teacher.setIsActive(false);
        teacherRepository.save(teacher);
    }

    // Student Management
    @Transactional(readOnly = true)
    public List<Student> getAllStudents() {
        return studentRepository.findByIsActiveTrue();
    }

    @Transactional
    public void deleteStudent(UUID studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        student.setIsActive(false);
        studentRepository.save(student);
    }

    // Class Teacher Assignment
    @Transactional
    public ClassTeacher assignClassTeacher(UUID classId, UUID teacherId) {
        com.manipro.leavemanagement.entity.Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // Deactivate existing class teacher if any
        classTeacherRepository.findByClassEntity_ClassIdAndIsActiveTrue(classId)
                .ifPresent(existing -> {
                    existing.setIsActive(false);
                    classTeacherRepository.save(existing);
                });

        ClassTeacher classTeacher = new ClassTeacher();
        classTeacher.setClassEntity(classEntity);
        classTeacher.setTeacher(teacher);
        classTeacher.setIsActive(true);
        return classTeacherRepository.save(classTeacher);
    }

    @Transactional(readOnly = true)
    public List<ClassTeacher> getAllClassTeachers() {
        return classTeacherRepository.findByIsActiveTrue();
    }

    @Transactional
    public ClassTeacher updateClassTeacher(UUID classTeacherId, UUID classId, UUID teacherId) {
        ClassTeacher classTeacher = classTeacherRepository.findById(classTeacherId)
                .orElseThrow(() -> new RuntimeException("Class teacher assignment not found"));
        
        com.manipro.leavemanagement.entity.Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // Deactivate existing class teacher for the same class if different
        if (!classTeacher.getClassEntity().getClassId().equals(classId)) {
            classTeacherRepository.findByClassEntity_ClassIdAndIsActiveTrue(classId)
                    .ifPresent(existing -> {
                        if (!existing.getClassTeacherId().equals(classTeacherId)) {
                            existing.setIsActive(false);
                            classTeacherRepository.save(existing);
                        }
                    });
        }

        classTeacher.setClassEntity(classEntity);
        classTeacher.setTeacher(teacher);
        return classTeacherRepository.save(classTeacher);
    }

    @Transactional
    public void deleteClassTeacher(UUID classTeacherId) {
        ClassTeacher classTeacher = classTeacherRepository.findById(classTeacherId)
                .orElseThrow(() -> new RuntimeException("Class teacher assignment not found"));
        classTeacher.setIsActive(false);
        classTeacherRepository.save(classTeacher);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogs(AuditLog.EntityType entityType, UUID entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByActionAtDesc(entityType, entityId);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getLeaveStatistics() {
        List<Leave> allLeaves = leaveRepository.findAll();
        long totalLeaves = allLeaves.size();
        long pendingLeaves = allLeaves.stream()
                .filter(leave -> "PENDING".equals(leave.getStatus().getStatusName()))
                .count();
        long approvedLeaves = allLeaves.stream()
                .filter(leave -> "APPROVED".equals(leave.getStatus().getStatusName()))
                .count();
        long rejectedLeaves = allLeaves.stream()
                .filter(leave -> "REJECTED".equals(leave.getStatus().getStatusName()))
                .count();
        
        return Map.of(
            "totalLeaves", totalLeaves,
            "pendingLeaves", pendingLeaves,
            "approvedLeaves", approvedLeaves,
            "rejectedLeaves", rejectedLeaves
        );
    }
}
