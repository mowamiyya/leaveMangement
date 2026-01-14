package com.manipro.leavemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveResponse {
    private UUID leaveId;
    private UUID applicantId;
    private String applicantName;
    private String applicantRole;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String subject;
    private String reason;
    private UUID reportedToId;
    private String reportedToName;
    private String status;
    private LocalDateTime appliedAt;
    private UUID approvedById;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private UUID rejectedById;
    private String rejectedByName;
    private LocalDateTime rejectedAt;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String className;
    private String departmentName;
}
