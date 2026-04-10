// src/main/java/com/huydidev/humltool/repository/WorkspaceMemberRepository.java

package com.huydidev.humltool.repository;

import com.huydidev.humltool.entity.WorkspaceMemberEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceMemberRepository extends MongoRepository<WorkspaceMemberEntity, String> {

    // Lấy tất cả member của workspace
    List<WorkspaceMemberEntity> findByWorkspaceId(String workspaceId);

    // Lấy member theo status
    List<WorkspaceMemberEntity> findByWorkspaceIdAndStatus(String workspaceId, String status);

    // Lấy member theo role
    List<WorkspaceMemberEntity> findByWorkspaceIdAndRole(String workspaceId, String role);

    // Tìm 1 member cụ thể
    Optional<WorkspaceMemberEntity> findByWorkspaceIdAndUserId(String workspaceId, String userId);

    // Lấy tất cả workspace mà user đang tham gia (ACTIVE)
    List<WorkspaceMemberEntity> findByUserIdAndStatus(String userId, String status);

    // Xóa member
    void deleteByWorkspaceIdAndUserId(String workspaceId, String userId);

    // Đếm member active
    long countByWorkspaceIdAndStatus(String workspaceId, String status);

    // Check user có trong workspace không
    boolean existsByWorkspaceIdAndUserId(String workspaceId, String userId);
}