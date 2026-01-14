package com.manipro.leavemanagement.controller;

import com.manipro.leavemanagement.dto.HierarchyNode;
import com.manipro.leavemanagement.service.HierarchyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hierarchy")
@CrossOrigin(origins = "*")
public class HierarchyController {

    @Autowired
    private HierarchyService hierarchyService;

    @GetMapping("/tree")
    public ResponseEntity<HierarchyNode> getHierarchyTree() {
        HierarchyNode tree = hierarchyService.getHierarchyTree();
        return ResponseEntity.ok(tree);
    }
}
