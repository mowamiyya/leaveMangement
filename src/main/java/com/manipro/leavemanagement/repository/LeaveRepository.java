package com.manipro.leavemanagement.repository;

import com.manipro.leavemanagement.entity.Leave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, UUID> {
    List<Leave> findByApplicantIdAndApplicantRoleOrderByCreatedAtDesc(UUID applicantId, Leave.ApplicantRole role);
    
    @Query("SELECT l FROM Leave l WHERE l.reportedTo.teacherId = :teacherId AND l.status.statusName = 'PENDING' ORDER BY l.appliedAt DESC")
    List<Leave> findPendingLeavesForTeacher(@Param("teacherId") UUID teacherId);
    
    @Query("SELECT l FROM Leave l WHERE l.reportedTo.teacherId = :teacherId ORDER BY l.createdAt DESC")
    List<Leave> findAllLeavesForTeacher(@Param("teacherId") UUID teacherId);
    
    List<Leave> findByApplicantIdAndApplicantRoleAndStatus_StatusName(UUID applicantId, Leave.ApplicantRole role, String status);
    
    @Query("SELECT COUNT(l) FROM Leave l WHERE l.applicantId = :applicantId AND l.applicantRole = :role")
    Long countByApplicantIdAndRole(@Param("applicantId") UUID applicantId, @Param("role") Leave.ApplicantRole role);
    
    @Query("SELECT COUNT(l) FROM Leave l WHERE l.applicantId = :applicantId AND l.applicantRole = :role AND l.status.statusName = :status")
    Long countByApplicantIdAndRoleAndStatus(@Param("applicantId") UUID applicantId, @Param("role") Leave.ApplicantRole role, @Param("status") String status);
    
    @Query("SELECT COUNT(l) FROM Leave l WHERE l.reportedTo.teacherId = :teacherId AND l.status.statusName = :status")
    Long countByTeacherIdAndStatus(@Param("teacherId") UUID teacherId, @Param("status") String status);
}
