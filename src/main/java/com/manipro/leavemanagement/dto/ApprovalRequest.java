package com.manipro.leavemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ApprovalRequest {
    @NotNull(message = "Leave ID is required")
    private UUID leaveId;

    @NotBlank(message = "Action is required (APPROVE/REJECT)")
    private String action;

    private String rejectionReason;
}
