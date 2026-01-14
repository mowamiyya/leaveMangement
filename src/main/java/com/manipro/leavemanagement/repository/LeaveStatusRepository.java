package com.manipro.leavemanagement.repository;

import com.manipro.leavemanagement.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveStatusRepository extends JpaRepository<LeaveStatus, UUID> {
    Optional<LeaveStatus> findByStatusName(String statusName);
}
