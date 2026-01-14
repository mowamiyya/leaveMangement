package com.manipro.leavemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationResponse {
    private String message;
    private String userId;
    private String name;
    private String email;
    private String role;
}
