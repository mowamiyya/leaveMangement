package com.manipro.leavemanagement.service;

import com.manipro.leavemanagement.dto.DashboardStats;
import com.manipro.leavemanagement.entity.Leave;
import com.manipro.leavemanagement.repository.LeaveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class DashboardService {

    @Autowired
    private LeaveRepository leaveRepository;

    public DashboardStats getStudentDashboardStats(UUID studentId) {
        DashboardStats stats = new DashboardStats();
        stats.setTotalLeaves(leaveRepository.countByApplicantIdAndRole(studentId, Leave.ApplicantRole.STUDENT));
        stats.setPendingLeaves(leaveRepository.countByApplicantIdAndRoleAndStatus(studentId, Leave.ApplicantRole.STUDENT, "PENDING"));
        stats.setApprovedLeaves(leaveRepository.countByApplicantIdAndRoleAndStatus(studentId, Leave.ApplicantRole.STUDENT, "APPROVED"));
        stats.setRejectedLeaves(leaveRepository.countByApplicantIdAndRoleAndStatus(studentId, Leave.ApplicantRole.STUDENT, "REJECTED"));
        return stats;
    }

    public DashboardStats getTeacherDashboardStats(UUID teacherId) {
        DashboardStats stats = new DashboardStats();
        stats.setPendingLeaves(leaveRepository.countByTeacherIdAndStatus(teacherId, "PENDING"));
        stats.setApprovedLeaves(leaveRepository.countByTeacherIdAndStatus(teacherId, "APPROVED"));
        stats.setRejectedLeaves(leaveRepository.countByTeacherIdAndStatus(teacherId, "REJECTED"));
        stats.setTotalLeaves(stats.getPendingLeaves() + stats.getApprovedLeaves() + stats.getRejectedLeaves());
        return stats;
    }
}
