// src/main/java/com/huydidev/humltool/repository/GradeRepository.java

package com.huydidev.humltool.repository;

import com.huydidev.humltool.entity.GradeEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends MongoRepository<GradeEntity, String> {

    // Lấy tất cả grade trong workspace — teacher dùng
    List<GradeEntity> findByWorkspaceIdOrderByGradedAtDesc(String workspaceId);

    // Lấy grade của 1 student trong workspace
    List<GradeEntity> findByWorkspaceIdAndStudentId(String workspaceId, String studentId);

    // Lấy grade của 1 diagram cụ thể
    Optional<GradeEntity> findByDiagramIdAndStudentId(String diagramId, String studentId);

    // Lấy tất cả grade của 1 diagram — có thể có nhiều lần chấm
    List<GradeEntity> findByDiagramId(String diagramId);

    // Xóa grade khi xóa diagram
    void deleteByDiagramId(String diagramId);

    // Đếm số diagram đã chấm trong workspace
    long countByWorkspaceId(String workspaceId);
}