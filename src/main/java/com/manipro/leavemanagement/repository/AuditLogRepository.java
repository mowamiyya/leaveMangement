package com.manipro.leavemanagement.repository;

import com.manipro.leavemanagement.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByEntityTypeAndEntityIdOrderByActionAtDesc(AuditLog.EntityType entityType, UUID entityId);
    List<AuditLog> findByActionByOrderByActionAtDesc(UUID actionBy);
}
