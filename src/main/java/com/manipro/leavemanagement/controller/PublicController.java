package com.manipro.leavemanagement.controller;

import com.manipro.leavemanagement.entity.Class;
import com.manipro.leavemanagement.entity.Department;
import com.manipro.leavemanagement.repository.ClassRepository;
import com.manipro.leavemanagement.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicController {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private ClassRepository classRepository;

    @GetMapping("/departments")
    public ResponseEntity<List<Map<String, Object>>> getDepartments() {
        List<Department> departments = departmentRepository.findByIsActiveTrue();
        List<Map<String, Object>> result = departments.stream()
                .map(dept -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("departmentId", dept.getDepartmentId());
                    map.put("departmentName", dept.getDepartmentName());
                    return map;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/classes")
    public ResponseEntity<List<Map<String, Object>>> getClasses(@RequestParam(required = false) UUID departmentId) {
        List<Class> classes;
        if (departmentId != null) {
            classes = classRepository.findByDepartment_DepartmentIdAndIsActiveTrue(departmentId);
        } else {
            classes = classRepository.findByIsActiveTrue();
        }
        List<Map<String, Object>> result = classes.stream()
                .map(classEntity -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("classId", classEntity.getClassId());
                    map.put("className", classEntity.getClassName());
                    map.put("departmentId", classEntity.getDepartment().getDepartmentId());
                    map.put("departmentName", classEntity.getDepartment().getDepartmentName());
                    return map;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
