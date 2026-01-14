package com.manipro.leavemanagement.repository;

import com.manipro.leavemanagement.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, UUID> {
    Optional<Teacher> findByEmail(String email);
    Optional<Teacher> findByEmailAndIsActiveTrue(String email);
    
    @org.springframework.data.jpa.repository.Query("SELECT t FROM Teacher t JOIN FETCH t.department WHERE t.isActive = true")
    List<Teacher> findByIsActiveTrue();
    
    @org.springframework.data.jpa.repository.Query("SELECT t FROM Teacher t JOIN FETCH t.department WHERE t.department.departmentId = :departmentId AND t.isActive = true")
    List<Teacher> findByDepartment_DepartmentIdAndIsActiveTrue(@org.springframework.data.repository.query.Param("departmentId") UUID departmentId);
}
