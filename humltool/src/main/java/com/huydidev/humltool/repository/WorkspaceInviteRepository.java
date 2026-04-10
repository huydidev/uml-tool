// src/main/java/com/huydidev/humltool/repository/WorkspaceInviteRepository.java

package com.huydidev.humltool.repository;

import com.huydidev.humltool.entity.WorkspaceInviteEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceInviteRepository extends MongoRepository<WorkspaceInviteEntity, String> {

    // Lấy tất cả invite của workspace
    List<WorkspaceInviteEntity> findByWorkspaceIdOrderByCreatedAtDesc(String workspaceId);

    // Lấy invite theo status
    List<WorkspaceInviteEntity> findByWorkspaceIdAndStatus(String workspaceId, String status);

    // Tìm invite cụ thể theo email
    Optional<WorkspaceInviteEntity> findByWorkspaceIdAndInvitedEmail(
            String workspaceId, String invitedEmail
    );

    // Lấy tất cả invite pending của 1 email
    List<WorkspaceInviteEntity> findByInvitedEmailAndStatus(String invitedEmail, String status);

    // Check đã invite chưa
    boolean existsByWorkspaceIdAndInvitedEmailAndStatus(
            String workspaceId, String invitedEmail, String status
    );
}