package com.manipro.leavemanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "leave_status")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveStatus {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "status_id", updatable = false, nullable = false)
    private UUID statusId;

    @Column(name = "status_name", nullable = false, unique = true)
    private String statusName;

    @Column(name = "description")
    private String description;
}
