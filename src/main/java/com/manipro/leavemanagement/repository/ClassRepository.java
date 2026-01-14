package com.manipro.leavemanagement.repository;

import com.manipro.leavemanagement.entity.Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClassRepository extends JpaRepository<Class, UUID> {
    @Query("SELECT c FROM Class c JOIN FETCH c.department WHERE c.isActive = true")
    List<Class> findByIsActiveTrue();
    
    @Query("SELECT c FROM Class c JOIN FETCH c.department WHERE c.department.departmentId = :departmentId AND c.isActive = true")
    List<Class> findByDepartment_DepartmentIdAndIsActiveTrue(@Param("departmentId") UUID departmentId);
}
