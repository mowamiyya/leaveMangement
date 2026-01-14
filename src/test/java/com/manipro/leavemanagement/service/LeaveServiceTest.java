package com.manipro.leavemanagement.service;

import com.manipro.leavemanagement.dto.ApprovalRequest;
import com.manipro.leavemanagement.dto.LeaveRequest;
import com.manipro.leavemanagement.entity.*;
import com.manipro.leavemanagement.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaveServiceTest {

    @Mock
    private LeaveRepository leaveRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private LeaveStatusRepository leaveStatusRepository;

    @Mock
    private ClassTeacherRepository classTeacherRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private LeaveService leaveService;

    private Student testStudent;
    private Teacher testTeacher;
    private com.manipro.leavemanagement.entity.Class testClass;
    private Department testDepartment;
    private ClassTeacher classTeacher;
    private LeaveStatus pendingStatus;
    private LeaveStatus approvedStatus;
    private LeaveStatus rejectedStatus;
    private Leave testLeave;

    @BeforeEach
    void setUp() {
        testDepartment = new Department();
        testDepartment.setDepartmentId(UUID.randomUUID());
        testDepartment.setDepartmentName("Test Department");
        
        testStudent = new Student();
        testStudent.setStudentId(UUID.randomUUID());
        testStudent.setName("Test Student");
        testClass = new com.manipro.leavemanagement.entity.Class();
        testClass.setClassId(UUID.randomUUID());
        testClass.setDepartment(testDepartment);
        testStudent.setClassEntity(testClass);
        testStudent.setDepartment(testDepartment);

        testTeacher = new Teacher();
        testTeacher.setTeacherId(UUID.randomUUID());
        testTeacher.setName("Test Teacher");

        classTeacher = new ClassTeacher();
        classTeacher.setTeacher(testTeacher);
        classTeacher.setClassEntity(testClass);
        classTeacher.setIsActive(true);

        pendingStatus = new LeaveStatus();
        pendingStatus.setStatusId(UUID.randomUUID());
        pendingStatus.setStatusName("PENDING");

        approvedStatus = new LeaveStatus();
        approvedStatus.setStatusId(UUID.randomUUID());
        approvedStatus.setStatusName("APPROVED");

        rejectedStatus = new LeaveStatus();
        rejectedStatus.setStatusId(UUID.randomUUID());
        rejectedStatus.setStatusName("REJECTED");

        testLeave = new Leave();
        testLeave.setLeaveId(UUID.randomUUID());
        testLeave.setApplicantId(testStudent.getStudentId());
        testLeave.setApplicantRole(Leave.ApplicantRole.STUDENT);
        testLeave.setStatus(pendingStatus);
        testLeave.setReportedTo(testTeacher);
    }

    @Test
    void testApplyLeave_Success() {
        LeaveRequest request = new LeaveRequest();
        request.setFromDate(LocalDate.now());
        request.setToDate(LocalDate.now().plusDays(1));
        request.setSubject("Test Leave");
        request.setReason("Test Reason");

        when(studentRepository.findById(any(UUID.class))).thenReturn(Optional.of(testStudent));
        when(classTeacherRepository.findByClassEntity_ClassIdAndIsActiveTrue(testClass.getClassId()))
                .thenReturn(Optional.of(classTeacher));
        when(leaveStatusRepository.findByStatusName("PENDING")).thenReturn(Optional.of(pendingStatus));
        when(leaveRepository.save(any(Leave.class))).thenAnswer(invocation -> {
            Leave savedLeave = invocation.getArgument(0);
            testLeave.setApplicantId(savedLeave.getApplicantId());
            testLeave.setFromDate(savedLeave.getFromDate());
            testLeave.setToDate(savedLeave.getToDate());
            testLeave.setSubject(savedLeave.getSubject());
            testLeave.setReason(savedLeave.getReason());
            testLeave.setReportedTo(savedLeave.getReportedTo());
            testLeave.setStatus(savedLeave.getStatus());
            testLeave.setAppliedAt(savedLeave.getAppliedAt());
            return testLeave;
        });

        var response = leaveService.applyLeave(testStudent.getStudentId(), request);

        assertNotNull(response);
        verify(leaveRepository, times(1)).save(any(Leave.class));
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    void testApplyLeave_StudentNotFound() {
        LeaveRequest request = new LeaveRequest();
        when(studentRepository.findById(testStudent.getStudentId())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> 
                leaveService.applyLeave(testStudent.getStudentId(), request));
    }

    @Test
    void testApproveLeave_Success() {
        ApprovalRequest request = new ApprovalRequest();
        request.setLeaveId(testLeave.getLeaveId());
        request.setAction("APPROVE");

        when(leaveRepository.findById(testLeave.getLeaveId())).thenReturn(Optional.of(testLeave));
        when(teacherRepository.findById(testTeacher.getTeacherId())).thenReturn(Optional.of(testTeacher));
        when(leaveStatusRepository.findByStatusName("APPROVED")).thenReturn(Optional.of(approvedStatus));
        when(leaveRepository.save(any(Leave.class))).thenReturn(testLeave);

        var response = leaveService.approveLeave(testTeacher.getTeacherId(), request);

        assertNotNull(response);
        verify(leaveRepository, times(1)).save(any(Leave.class));
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    void testApproveLeave_Reject_Success() {
        ApprovalRequest request = new ApprovalRequest();
        request.setLeaveId(testLeave.getLeaveId());
        request.setAction("REJECT");
        request.setRejectionReason("Not valid");

        when(leaveRepository.findById(testLeave.getLeaveId())).thenReturn(Optional.of(testLeave));
        when(teacherRepository.findById(testTeacher.getTeacherId())).thenReturn(Optional.of(testTeacher));
        when(leaveStatusRepository.findByStatusName("REJECTED")).thenReturn(Optional.of(rejectedStatus));
        when(leaveRepository.save(any(Leave.class))).thenReturn(testLeave);

        var response = leaveService.approveLeave(testTeacher.getTeacherId(), request);

        assertNotNull(response);
        verify(leaveRepository, times(1)).save(any(Leave.class));
    }

    @Test
    void testApproveLeave_Reject_WithoutReason() {
        ApprovalRequest request = new ApprovalRequest();
        request.setLeaveId(testLeave.getLeaveId());
        request.setAction("REJECT");
        request.setRejectionReason(null);

        when(leaveRepository.findById(testLeave.getLeaveId())).thenReturn(Optional.of(testLeave));

        assertThrows(RuntimeException.class, () -> 
                leaveService.approveLeave(testTeacher.getTeacherId(), request));
    }
}
