package com.manipro.leavemanagement.service;

import com.manipro.leavemanagement.dto.HierarchyNode;
import com.manipro.leavemanagement.entity.*;
import com.manipro.leavemanagement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class HierarchyService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private ClassTeacherRepository classTeacherRepository;

    @Autowired
    private StudentRepository studentRepository;

    public HierarchyNode getHierarchyTree() {
        HierarchyNode root = new HierarchyNode();
        root.setName("Organization");
        root.setType("ROOT");

        List<Department> departments = departmentRepository.findByIsActiveTrue();
        for (Department dept : departments) {
            HierarchyNode deptNode = new HierarchyNode();
            deptNode.setId(dept.getDepartmentId());
            deptNode.setName(dept.getDepartmentName());
            deptNode.setType("DEPARTMENT");

            List<com.manipro.leavemanagement.entity.Class> classes = classRepository.findByDepartment_DepartmentIdAndIsActiveTrue(dept.getDepartmentId());
            for (com.manipro.leavemanagement.entity.Class classEntity : classes) {
                HierarchyNode classNode = new HierarchyNode();
                classNode.setId(classEntity.getClassId());
                classNode.setName(classEntity.getClassName());
                classNode.setType("CLASS");

                // Get class teacher
                ClassTeacher classTeacher = classTeacherRepository
                        .findByClassEntity_ClassIdAndIsActiveTrue(classEntity.getClassId())
                        .orElse(null);

                if (classTeacher != null) {
                    HierarchyNode teacherNode = new HierarchyNode();
                    teacherNode.setId(classTeacher.getTeacher().getTeacherId());
                    teacherNode.setName(classTeacher.getTeacher().getName());
                    teacherNode.setType("TEACHER");

                    // Get students
                    List<Student> students = studentRepository
                            .findByClassEntity_ClassIdAndIsActiveTrue(classEntity.getClassId());
                    for (Student student : students) {
                        HierarchyNode studentNode = new HierarchyNode();
                        studentNode.setId(student.getStudentId());
                        studentNode.setName(student.getName());
                        studentNode.setType("STUDENT");
                        teacherNode.getChildren().add(studentNode);
                    }

                    classNode.getChildren().add(teacherNode);
                }

                deptNode.getChildren().add(classNode);
            }

            root.getChildren().add(deptNode);
        }

        return root;
    }
}
