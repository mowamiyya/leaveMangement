package com.manipro.leavemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank(message = "Email is required")
    private String email;
    
    @NotBlank(message = "Confirmation code is required")
    private String confirmationCode;
    
    @NotBlank(message = "New password is required")
    private String newPassword;
}
