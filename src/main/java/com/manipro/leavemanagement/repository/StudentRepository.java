package com.manipro.leavemanagement.repository;

import com.manipro.leavemanagement.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    Optional<Student> findByEmail(String email);
    Optional<Student> findByEmailAndIsActiveTrue(String email);
    
    @Query("SELECT s FROM Student s JOIN FETCH s.department JOIN FETCH s.classEntity WHERE s.isActive = true")
    List<Student> findByIsActiveTrue();
    
    @Query("SELECT s FROM Student s JOIN FETCH s.department JOIN FETCH s.classEntity WHERE s.classEntity.classId = :classId AND s.isActive = true")
    List<Student> findByClassEntity_ClassIdAndIsActiveTrue(@Param("classId") UUID classId);
    
    @Query("SELECT s FROM Student s JOIN FETCH s.department JOIN FETCH s.classEntity WHERE s.department.departmentId = :departmentId AND s.isActive = true")
    List<Student> findByDepartment_DepartmentIdAndIsActiveTrue(@Param("departmentId") UUID departmentId);
}
