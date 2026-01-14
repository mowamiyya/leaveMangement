package com.manipro.leavemanagement.dto;

import lombok.Data;

import java.util.Map;

@Data
public class UserSettingsRequest {
    private Map<String, Object> uiSettings;
}
