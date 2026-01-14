package com.manipro.leavemanagement.service;

import com.manipro.leavemanagement.dto.DashboardStats;
import com.manipro.leavemanagement.entity.Leave;
import com.manipro.leavemanagement.repository.LeaveRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private LeaveRepository leaveRepository;

    @InjectMocks
    private DashboardService dashboardService;

    private UUID studentId;
    private UUID teacherId;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
        teacherId = UUID.randomUUID();
    }

    @Test
    void testGetStudentDashboardStats() {
        when(leaveRepository.countByApplicantIdAndRole(studentId, Leave.ApplicantRole.STUDENT))
                .thenReturn(10L);
        when(leaveRepository.countByApplicantIdAndRoleAndStatus(studentId, Leave.ApplicantRole.STUDENT, "PENDING"))
                .thenReturn(3L);
        when(leaveRepository.countByApplicantIdAndRoleAndStatus(studentId, Leave.ApplicantRole.STUDENT, "APPROVED"))
                .thenReturn(5L);
        when(leaveRepository.countByApplicantIdAndRoleAndStatus(studentId, Leave.ApplicantRole.STUDENT, "REJECTED"))
                .thenReturn(2L);

        DashboardStats stats = dashboardService.getStudentDashboardStats(studentId);

        assertNotNull(stats);
        assertEquals(10L, stats.getTotalLeaves());
        assertEquals(3L, stats.getPendingLeaves());
        assertEquals(5L, stats.getApprovedLeaves());
        assertEquals(2L, stats.getRejectedLeaves());
    }

    @Test
    void testGetTeacherDashboardStats() {
        when(leaveRepository.countByTeacherIdAndStatus(teacherId, "PENDING")).thenReturn(5L);
        when(leaveRepository.countByTeacherIdAndStatus(teacherId, "APPROVED")).thenReturn(10L);
        when(leaveRepository.countByTeacherIdAndStatus(teacherId, "REJECTED")).thenReturn(2L);

        DashboardStats stats = dashboardService.getTeacherDashboardStats(teacherId);

        assertNotNull(stats);
        assertEquals(5L, stats.getPendingLeaves());
        assertEquals(10L, stats.getApprovedLeaves());
        assertEquals(2L, stats.getRejectedLeaves());
        assertEquals(17L, stats.getTotalLeaves());
    }
}
