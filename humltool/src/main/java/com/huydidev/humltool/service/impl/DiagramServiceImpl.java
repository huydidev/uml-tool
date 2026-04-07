package com.huydidev.humltool.service.impl;

import com.huydidev.humltool.config.JwtUtils;
import com.huydidev.humltool.entity.DiagramEntity;
import com.huydidev.humltool.exceptions.ResourceNotFoundException;
import com.huydidev.humltool.model.DiagramModel;
import com.huydidev.humltool.repository.DiagramRepository;
import com.huydidev.humltool.service.DiagramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DiagramServiceImpl implements DiagramService {

    @Autowired private JwtUtils jwtUtils;
    @Autowired private DiagramRepository diagramRepository;

    // ── Save toàn bộ (tạo mới hoặc update đầy đủ) ───────────────────
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

    // ── Patch: chỉ update nodes + edges + updatedAt ──────────────────
    // Dùng cho auto-save — không override title, description, shareToken
    @Override
    public DiagramModel patchDiagram(DiagramModel model, String token) {
        DiagramEntity entity = diagramRepository.findById(model.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy diagram: " + model.getId()));

        // Chỉ update những field được gửi lên, giữ nguyên phần còn lại
        if (model.getNodes() != null) entity.setNodes(model.getNodes());
        if (model.getEdges() != null) entity.setEdges(model.getEdges());
        if (model.getTitle() != null && !model.getTitle().isBlank()) {
            entity.setTitle(model.getTitle());
        }
        entity.setUpdatedAt(LocalDateTime.now());

        DiagramEntity saved = diagramRepository.save(entity);
        return mapToModel(saved);
    }

    @Override
    public List<DiagramModel> getAllDiagrams() {
        return diagramRepository.findAll().stream()
                .map(this::mapToModel)
                .collect(Collectors.toList());
    }

    @Override
    public DiagramModel getDiagramById(String id) {
        return diagramRepository.findById(id)
                .map(this::mapToModel)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy diagram: " + id));
    }

    @Override
    public List<DiagramModel> getMyDiagrams(String token) {
        String ownerId = jwtUtils.getUserNameFromJwtToken(token);
        return diagramRepository.findByOwnerIdOrderByUpdatedAtDesc(ownerId)
                .stream().map(this::mapToModel).toList();
    }

    @Override
    public void deleteDiagram(String id) {
        diagramRepository.deleteById(id);
    }

    // ── Helper ───────────────────────────────────────────────────────
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