package com.manipro.leavemanagement.service;

import com.manipro.leavemanagement.dto.ApprovalRequest;
import com.manipro.leavemanagement.dto.LeaveRequest;
import com.manipro.leavemanagement.dto.LeaveResponse;
import com.manipro.leavemanagement.entity.*;
import com.manipro.leavemanagement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private LeaveStatusRepository leaveStatusRepository;

    @Autowired
    private ClassTeacherRepository classTeacherRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Transactional
    public LeaveResponse applyLeave(UUID studentId, LeaveRequest request) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Get class teacher
        ClassTeacher classTeacher = classTeacherRepository
                .findByClassEntity_ClassIdAndIsActiveTrue(student.getClassEntity().getClassId())
                .orElseThrow(() -> new RuntimeException("Class teacher not assigned"));

        // Get PENDING status
        LeaveStatus pendingStatus = leaveStatusRepository.findByStatusName("PENDING")
                .orElseThrow(() -> new RuntimeException("Leave status not found"));

        Leave leave = new Leave();
        leave.setApplicantId(studentId);
        leave.setApplicantRole(Leave.ApplicantRole.STUDENT);
        leave.setFromDate(request.getFromDate());
        leave.setToDate(request.getToDate());
        leave.setSubject(request.getSubject());
        leave.setReason(request.getReason());
        leave.setReportedTo(classTeacher.getTeacher());
        leave.setStatus(pendingStatus);
        leave.setAppliedAt(LocalDateTime.now());

        leave = leaveRepository.save(leave);

        // Audit log
        logAudit(AuditLog.EntityType.LEAVE, leave.getLeaveId(), AuditLog.Action.CREATE, 
                null, createLeaveMap(leave), studentId, null);

        return mapToLeaveResponse(leave);
    }

    @Transactional
    public LeaveResponse approveLeave(UUID teacherId, ApprovalRequest request) {
        Leave leave = leaveRepository.findById(request.getLeaveId())
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        if (!leave.getReportedTo().getTeacherId().equals(teacherId)) {
            throw new RuntimeException("Unauthorized: This leave is not reported to you");
        }

        if (!leave.getStatus().getStatusName().equals("PENDING")) {
            throw new RuntimeException("Leave is not in PENDING status");
        }

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Map<String, Object> oldValue = createLeaveMap(leave);

        if ("APPROVE".equalsIgnoreCase(request.getAction())) {
            LeaveStatus approvedStatus = leaveStatusRepository.findByStatusName("APPROVED")
                    .orElseThrow(() -> new RuntimeException("Leave status not found"));
            leave.setStatus(approvedStatus);
            leave.setApprovedBy(teacher);
            leave.setApprovedAt(LocalDateTime.now());
            leave.setRejectedBy(null);
            leave.setRejectedAt(null);
            leave.setRejectionReason(null);
        } else if ("REJECT".equalsIgnoreCase(request.getAction())) {
            if (request.getRejectionReason() == null || request.getRejectionReason().trim().isEmpty()) {
                throw new RuntimeException("Rejection reason is required");
            }
            LeaveStatus rejectedStatus = leaveStatusRepository.findByStatusName("REJECTED")
                    .orElseThrow(() -> new RuntimeException("Leave status not found"));
            leave.setStatus(rejectedStatus);
            leave.setRejectedBy(teacher);
            leave.setRejectedAt(LocalDateTime.now());
            leave.setRejectionReason(request.getRejectionReason());
            leave.setApprovedBy(null);
            leave.setApprovedAt(null);
        } else {
            throw new RuntimeException("Invalid action. Use APPROVE or REJECT");
        }

        leave = leaveRepository.save(leave);

        // Audit log
        AuditLog.Action auditAction = "APPROVE".equalsIgnoreCase(request.getAction()) 
                ? AuditLog.Action.APPROVE : AuditLog.Action.REJECT;
        logAudit(AuditLog.EntityType.LEAVE, leave.getLeaveId(), auditAction, 
                oldValue, createLeaveMap(leave), teacherId, null);

        return mapToLeaveResponse(leave);
    }

    public List<LeaveResponse> getStudentLeaves(UUID studentId) {
        List<Leave> leaves = leaveRepository.findByApplicantIdAndApplicantRoleOrderByCreatedAtDesc(
                studentId, Leave.ApplicantRole.STUDENT);
        return leaves.stream().map(this::mapToLeaveResponse).collect(Collectors.toList());
    }

    public List<LeaveResponse> getPendingLeavesForTeacher(UUID teacherId) {
        List<Leave> leaves = leaveRepository.findPendingLeavesForTeacher(teacherId);
        return leaves.stream().map(this::mapToLeaveResponse).collect(Collectors.toList());
    }

    public List<LeaveResponse> getAllLeavesForTeacher(UUID teacherId) {
        List<Leave> leaves = leaveRepository.findAllLeavesForTeacher(teacherId);
        return leaves.stream().map(this::mapToLeaveResponse).collect(Collectors.toList());
    }

    private LeaveResponse mapToLeaveResponse(Leave leave) {
        LeaveResponse response = new LeaveResponse();
        response.setLeaveId(leave.getLeaveId());
        response.setApplicantId(leave.getApplicantId());
        response.setApplicantRole(leave.getApplicantRole().name());
        response.setFromDate(leave.getFromDate());
        response.setToDate(leave.getToDate());
        response.setSubject(leave.getSubject());
        response.setReason(leave.getReason());
        response.setStatus(leave.getStatus().getStatusName());
        response.setAppliedAt(leave.getAppliedAt());
        response.setCreatedAt(leave.getCreatedAt());
        response.setUpdatedAt(leave.getUpdatedAt());

        if (leave.getReportedTo() != null) {
            response.setReportedToId(leave.getReportedTo().getTeacherId());
            response.setReportedToName(leave.getReportedTo().getName());
        }

        if (leave.getApprovedBy() != null) {
            response.setApprovedById(leave.getApprovedBy().getTeacherId());
            response.setApprovedByName(leave.getApprovedBy().getName());
            response.setApprovedAt(leave.getApprovedAt());
        }

        if (leave.getRejectedBy() != null) {
            response.setRejectedById(leave.getRejectedBy().getTeacherId());
            response.setRejectedByName(leave.getRejectedBy().getName());
            response.setRejectedAt(leave.getRejectedAt());
            response.setRejectionReason(leave.getRejectionReason());
        }

        // Load student details if needed
        if (leave.getApplicantRole() == Leave.ApplicantRole.STUDENT) {
            Student student = studentRepository.findById(leave.getApplicantId()).orElse(null);
            if (student != null) {
                response.setApplicantName(student.getName());
                response.setClassName(student.getClassEntity().getClassName());
                response.setDepartmentName(student.getDepartment().getDepartmentName());
            }
        }

        return response;
    }

    private java.util.Map<String, Object> createLeaveMap(Leave leave) {
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        map.put("leaveId", leave.getLeaveId().toString());
        map.put("status", leave.getStatus().getStatusName());
        map.put("subject", leave.getSubject());
        return map;
    }

    private void logAudit(AuditLog.EntityType entityType, UUID entityId, AuditLog.Action action, 
                          java.util.Map<String, Object> oldValue, java.util.Map<String, Object> newValue, 
                          UUID actionBy, String ipAddress) {
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
