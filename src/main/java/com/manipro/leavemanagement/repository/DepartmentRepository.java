package com.manipro.leavemanagement.repository;

import com.manipro.leavemanagement.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    List<Department> findByIsActiveTrue();
    Optional<Department> findByDepartmentName(String departmentName);
    Optional<Department> findByDepartmentNameAndIsActiveTrue(String departmentName);
}
