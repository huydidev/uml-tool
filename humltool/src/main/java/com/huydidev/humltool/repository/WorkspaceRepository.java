// src/main/java/com/huydidev/humltool/repository/WorkspaceRepository.java

package com.huydidev.humltool.repository;

import com.huydidev.humltool.entity.WorkspaceEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceRepository extends MongoRepository<WorkspaceEntity, String> {

    // Lấy tất cả workspace của owner
    List<WorkspaceEntity> findByOwnerIdOrderByCreatedAtDesc(String ownerId);

    // Tìm theo invite code — dùng cho join via link
    Optional<WorkspaceEntity> findByInviteCode(String inviteCode);

    // Lấy theo type
    List<WorkspaceEntity> findByOwnerIdAndType(String ownerId, String type);
}