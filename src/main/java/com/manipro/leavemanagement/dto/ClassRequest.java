package com.manipro.leavemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ClassRequest {
    @NotBlank(message = "Class name is required")
    private String className;

    @NotNull(message = "Department ID is required")
    private UUID departmentId;
}
