// src/main/java/com/huydidev/humltool/repository/DiagramRepository.java

package com.huydidev.humltool.repository;

import com.huydidev.humltool.entity.DiagramEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiagramRepository extends MongoRepository<DiagramEntity, String> {

    // ── Personal diagrams ─────────────────────────────────────────
    // Chỉ lấy diagram không thuộc workspace nào (personal)
    List<DiagramEntity> findByOwnerIdAndWorkspaceIdIsNullOrderByUpdatedAtDesc(
            String ownerId);

    // Giữ lại để tương thích — lấy tất cả của owner
    List<DiagramEntity> findByOwnerIdOrderByUpdatedAtDesc(String ownerId);

    // ── Workspace diagrams ────────────────────────────────────────
    // Teacher/Owner: tất cả diagram trong workspace
    List<DiagramEntity> findByWorkspaceIdOrderByUpdatedAtDesc(String workspaceId);

    // Student/Member: chỉ diagram của mình trong workspace
    List<DiagramEntity> findByWorkspaceIdAndOwnerIdOrderByUpdatedAtDesc(
            String workspaceId, String ownerId);

    // ── Share token ───────────────────────────────────────────────
    Optional<DiagramEntity> findByShareToken(String shareToken);

    // ── Stats ─────────────────────────────────────────────────────
    // Đếm diagram trong workspace — dùng cho WorkspaceResponse
    long countByWorkspaceId(String workspaceId);

    // Đếm diagram của 1 user trong workspace — dùng cho MemberResponse
    long countByWorkspaceIdAndOwnerId(String workspaceId, String ownerId);
}