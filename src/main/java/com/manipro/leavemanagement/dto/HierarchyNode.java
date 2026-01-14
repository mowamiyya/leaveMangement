package com.manipro.leavemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HierarchyNode {
    private UUID id;
    private String name;
    private String type; // DEPARTMENT, CLASS, TEACHER, STUDENT
    private List<HierarchyNode> children = new ArrayList<>();
}
