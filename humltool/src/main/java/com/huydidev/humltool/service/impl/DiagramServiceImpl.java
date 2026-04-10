package com.huydidev.humltool.service.impl;

import com.huydidev.humltool.config.JwtUtils;
import com.huydidev.humltool.entity.DiagramEntity;
import com.huydidev.humltool.exceptions.ResourceNotFoundException;
import com.huydidev.humltool.model.DiagramModel;
import com.huydidev.humltool.repository.DiagramRepository;
import com.huydidev.humltool.repository.SharedAccessRepository;
import com.huydidev.humltool.repository.WorkspaceMemberRepository;
import com.huydidev.humltool.repository.WorkspaceRepository;
import com.huydidev.humltool.service.DiagramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DiagramServiceImpl implements DiagramService {

    @Autowired private JwtUtils               jwtUtils;
    @Autowired private DiagramRepository      diagramRepository;
    @Autowired private SharedAccessRepository sharedAccessRepository;
    // DiagramServiceImpl.java — thêm 2 field
    @Autowired private WorkspaceRepository workspaceRepository;
    @Autowired private WorkspaceMemberRepository memberRepository;

    // ── Save toàn bộ ─────────────────────────────────────────────────
    @Override
    public DiagramModel saveDiagram(DiagramModel model, String token) {
        DiagramEntity entity = (model.getId() != null)
                ? diagramRepository.findById(model.getId()).orElse(new DiagramEntity())
                : new DiagramEntity();

        entity.setTitle(model.getTitle());
        entity.setDescription(model.getDescription());
        entity.setNodes(model.getNodes());
        entity.setEdges(model.getEdges());
        entity.setOwnerId(jwtUtils.getUserNameFromJwtToken(token));
        entity.setUpdatedAt(LocalDateTime.now());

        if (entity.getId() == null) {
            entity.setShareToken(UUID.randomUUID().toString().substring(0, 8));
        }

        DiagramEntity saved = diagramRepository.save(entity);
        model.setId(saved.getId());
        model.setShareToken(saved.getShareToken());
        model.setOwnerId(saved.getOwnerId());
        return model;
    }

    // ── Patch: chỉ update nodes + edges ──────────────────────────────
    @Override
    public DiagramModel patchDiagram(DiagramModel model, String token) {
        DiagramEntity entity = diagramRepository.findById(model.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy diagram: " + model.getId()));

        String userId = jwtUtils.getUserNameFromJwtToken(token);

        // ── Check workspace deadline ──────────────────────────────────
        if (entity.getWorkspaceId() != null) {
            workspaceRepository.findById(entity.getWorkspaceId())
                    .ifPresent(ws -> {
                        if (ws.getDeadline() != null
                                && LocalDateTime.now().isAfter(ws.getDeadline())) {

                            // Teacher/Owner vẫn được sửa
                            boolean isTeacher = memberRepository
                                    .findByWorkspaceIdAndUserId(
                                            ws.getId(), userId)
                                    .map(m -> "OWNER".equals(m.getRole())
                                            || "TEACHER".equals(m.getRole()))
                                    .orElse(false);

                            if (!isTeacher) {
                                throw new RuntimeException("DEADLINE_PASSED");
                            }
                        }
                    });
        }

        if (model.getNodes() != null) entity.setNodes(model.getNodes());
        if (model.getEdges() != null) entity.setEdges(model.getEdges());
        if (model.getTitle() != null && !model.getTitle().isBlank()) {
            entity.setTitle(model.getTitle());
        }
        entity.setUpdatedAt(LocalDateTime.now());

        return mapToModel(diagramRepository.save(entity));
    }

    // ── Get không check quyền — dùng nội bộ ──────────────────────────
    @Override
    public DiagramModel getDiagramById(String id) {
        return diagramRepository.findById(id)
                .map(this::mapToModel)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy diagram: " + id));
    }

    // ── Get có check quyền — dùng khi FE mở editor ───────────────────
    // Trả 403 nếu user không phải owner và không có trong shared_access
    @Override
    public DiagramModel getDiagramByIdWithAuth(String id, String token) {
        DiagramEntity entity = diagramRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy diagram: " + id));

        String requesterId = jwtUtils.getUserNameFromJwtToken(token);

        // Owner luôn có quyền
        if (entity.getOwnerId().equals(requesterId)) {
            return mapToModel(entity);
        }

        // Check shared_access — nếu không có → 403
        boolean hasAccess = sharedAccessRepository
                .findByDiagramIdAndUserId(id, requesterId)
                .isPresent();

        if (!hasAccess) {
            throw new RuntimeException("FORBIDDEN");
        }

        return mapToModel(entity);
    }

    // ── Get qua shareToken — không cần auth, read-only ────────────────
    @Override
    public DiagramModel getDiagramByShareToken(String shareToken) {
        return diagramRepository.findByShareToken(shareToken)
                .map(this::mapToModel)
                .orElseThrow(() -> new ResourceNotFoundException("Link không hợp lệ hoặc đã hết hạn"));
    }

    @Override
    public List<DiagramModel> getAllDiagrams() {
        return diagramRepository.findAll().stream()
                .map(this::mapToModel)
                .collect(Collectors.toList());
    }

// src/main/java/com/huydidev/humltool/service/impl/DiagramServiceImpl.java
// Chỉ sửa method getMyDiagrams — các method khác giữ nguyên

    // ── Thay thế method cũ ───────────────────────────────────────────
    @Override
    public List<DiagramModel> getMyDiagrams(String token) {
        String ownerId = jwtUtils.getUserNameFromJwtToken(token);

        // Chỉ trả personal diagrams (workspaceId = null)
        // Workspace diagrams được lấy qua WorkspaceController
        return diagramRepository
                .findByOwnerIdAndWorkspaceIdIsNullOrderByUpdatedAtDesc(ownerId)
                .stream()
                .map(this::mapToModel)
                .toList();
    }

    // ── Thêm method mới — tạo diagram trong workspace ────────────────
    @Override
    public DiagramModel saveDiagramInWorkspace(
            DiagramModel model, String workspaceId, String token) {

        String userId = jwtUtils.getUserNameFromJwtToken(token);

        DiagramEntity entity = (model.getId() != null)
                ? diagramRepository.findById(model.getId())
                .orElse(new DiagramEntity())
                : new DiagramEntity();

        entity.setTitle(model.getTitle());
        entity.setDescription(model.getDescription());
        entity.setNodes(model.getNodes());
        entity.setEdges(model.getEdges());
        entity.setOwnerId(userId);
        entity.setWorkspaceId(workspaceId);

        // CLASSROOM diagram mặc định private
        entity.setPrivate(true);

        entity.setUpdatedAt(LocalDateTime.now());

        if (entity.getId() == null) {
            entity.setShareToken(
                    UUID.randomUUID().toString().substring(0, 8));
        }

        DiagramEntity saved = diagramRepository.save(entity);
        model.setId(saved.getId());
        model.setShareToken(saved.getShareToken());
        model.setOwnerId(saved.getOwnerId());
        model.setWorkspaceId(saved.getWorkspaceId());
        return model;
    }

    @Override
    public void deleteDiagram(String id) {
        diagramRepository.deleteById(id);
    }

    private DiagramModel mapToModel(DiagramEntity entity) {
        DiagramModel model = new DiagramModel();
        model.setId(entity.getId());
        model.setTitle(entity.getTitle());
        model.setDescription(entity.getDescription());
        model.setOwnerId(entity.getOwnerId());
        model.setShareToken(entity.getShareToken());
        model.setPublic(entity.isPublic());
        model.setNodes(entity.getNodes());
        model.setEdges(entity.getEdges());
        return model;
    }


}