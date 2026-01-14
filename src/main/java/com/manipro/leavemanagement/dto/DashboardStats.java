package com.manipro.leavemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private Long totalLeaves;
    private Long pendingLeaves;
    private Long approvedLeaves;
    private Long rejectedLeaves;
}
