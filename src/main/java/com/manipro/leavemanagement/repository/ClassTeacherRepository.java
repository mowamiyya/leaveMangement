package com.manipro.leavemanagement.repository;

import com.manipro.leavemanagement.entity.ClassTeacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClassTeacherRepository extends JpaRepository<ClassTeacher, UUID> {
    @Query("SELECT ct FROM ClassTeacher ct JOIN FETCH ct.classEntity c JOIN FETCH c.department JOIN FETCH ct.teacher t JOIN FETCH t.department WHERE ct.classEntity.classId = :classId AND ct.isActive = true")
    Optional<ClassTeacher> findByClassEntity_ClassIdAndIsActiveTrue(@Param("classId") UUID classId);
    
    @Query("SELECT ct FROM ClassTeacher ct JOIN FETCH ct.classEntity c JOIN FETCH c.department JOIN FETCH ct.teacher t JOIN FETCH t.department WHERE ct.teacher.teacherId = :teacherId AND ct.isActive = true")
    List<ClassTeacher> findByTeacher_TeacherIdAndIsActiveTrue(@Param("teacherId") UUID teacherId);
    
    @Query("SELECT ct FROM ClassTeacher ct JOIN FETCH ct.classEntity c JOIN FETCH c.department JOIN FETCH ct.teacher t JOIN FETCH t.department WHERE ct.isActive = true")
    List<ClassTeacher> findByIsActiveTrue();
}
