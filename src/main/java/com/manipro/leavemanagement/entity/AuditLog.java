package com.manipro.leavemanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "audit_id", updatable = false, nullable = false)
    private UUID auditId;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false)
    private EntityType entityType;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private Action action;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "old_value", columnDefinition = "JSON")
    private Map<String, Object> oldValue;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "new_value", columnDefinition = "JSON")
    private Map<String, Object> newValue;

    @Column(name = "action_by", nullable = false)
    private UUID actionBy;

    @Column(name = "action_at", nullable = false)
    private LocalDateTime actionAt;

    @Column(name = "ip_address")
    private String ipAddress;

    public enum EntityType {
        LEAVE, USER, CLASS, DEPARTMENT, TEACHER, STUDENT
    }

    public enum Action {
        CREATE, UPDATE, APPROVE, REJECT, DELETE, LOGIN, LOGOUT
    }
}
