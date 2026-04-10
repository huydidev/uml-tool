// src/main/java/com/huydidev/humltool/repository/CommentRepository.java

package com.huydidev.humltool.repository;

import com.huydidev.humltool.entity.CommentEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<CommentEntity, String> {

    // Tất cả comment của diagram — sort mới nhất trước
    List<CommentEntity> findByDiagramIdOrderByCreatedAtDesc(String diagramId);

    // Comment của 1 node cụ thể
    List<CommentEntity> findByDiagramIdAndNodeIdOrderByCreatedAtAsc(
            String diagramId, String nodeId
    );

    // Chỉ comment gốc (không phải reply)
    List<CommentEntity> findByDiagramIdAndParentIdIsNullOrderByCreatedAtDesc(
            String diagramId
    );

    // Replies của 1 comment
    List<CommentEntity> findByParentIdOrderByCreatedAtAsc(String parentId);

    // Xóa tất cả comment của diagram khi xóa diagram
    void deleteByDiagramId(String diagramId);

    // Đếm comment của node
    long countByDiagramIdAndNodeId(String diagramId, String nodeId);
}