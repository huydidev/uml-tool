package com.huydidev.humltool.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.huydidev.humltool.config.JwtUtils;
import com.huydidev.humltool.entity.DiagramEntity;
import com.huydidev.humltool.entity.DiagramVersionEntity;
import com.huydidev.humltool.exceptions.ResourceNotFoundException;
import com.huydidev.humltool.model.DiagramModel;
import com.huydidev.humltool.model.VersionModel;
import com.huydidev.humltool.repository.DiagramRepository;
import com.huydidev.humltool.repository.DiagramVersionRepository;
import com.huydidev.humltool.service.DiagramVersionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class DiagramVersionServiceImpl implements DiagramVersionService {

    @Autowired private DiagramVersionRepository versionRepo;
    @Autowired private DiagramRepository        diagramRepo;
    @Autowired private JwtUtils                 jwtUtils;
    @Autowired private ObjectMapper             objectMapper;

    private static final int MAX_VERSIONS = 50;

    // ── Lưu version snapshot ─────────────────────────────────────────
    @Override
    public VersionModel saveVersion(String diagramId, String label, String token) {
        DiagramEntity diagram = diagramRepo.findById(diagramId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy diagram: " + diagramId));

        // Tính version tiếp theo
        DiagramVersionEntity last = versionRepo.findFirstByDiagramIdOrderByVersionNumDesc(diagramId);
        int nextNum = (last == null) ? 1 : last.getVersionNum() + 1;

        DiagramVersionEntity version = new DiagramVersionEntity();
        version.setDiagramId(diagramId);
        version.setVersionNum(nextNum);
        version.setLabel(label != null ? label : "Version " + nextNum);
        version.setSavedBy(jwtUtils.getUserNameFromJwtToken(token));
        version.setSnapshot(Map.of(
                "nodes", diagram.getNodes() != null ? diagram.getNodes() : List.of(),
                "edges", diagram.getEdges() != null ? diagram.getEdges() : List.of(),
                "title", diagram.getTitle() != null ? diagram.getTitle() : ""
        ));

        DiagramVersionEntity saved = versionRepo.save(version);

        // Giữ tối đa MAX_VERSIONS, xóa cái cũ nhất nếu vượt
        long count = versionRepo.countByDiagramId(diagramId);
        if (count > MAX_VERSIONS) {
            DiagramVersionEntity oldest = versionRepo.findFirstByDiagramIdOrderByVersionNumAsc(diagramId);
            if (oldest != null) versionRepo.delete(oldest);
        }

        return toModel(saved);
    }

    // ── Lấy danh sách versions ───────────────────────────────────────
    @Override
    public List<VersionModel> getHistory(String diagramId) {
        return versionRepo.findByDiagramIdOrderByVersionNumDesc(diagramId)
                .stream().map(this::toModel).toList();
    }

    // ── Restore về version cụ thể ─────────────────────────────────────
    // Apply snapshot vào diagram hiện tại rồi save
    @Override
    @SuppressWarnings("unchecked")
    public DiagramModel restoreVersion(String diagramId, Integer vNum, String token) {
        DiagramVersionEntity version = versionRepo
                .findByDiagramIdAndVersionNum(diagramId, vNum)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy version " + vNum + " của diagram " + diagramId));

        DiagramEntity diagram = diagramRepo.findById(diagramId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy diagram: " + diagramId));

        Map<String, Object> snapshot = version.getSnapshot();

        // Apply snapshot nodes + edges vào diagram hiện tại
        Object rawNodes = snapshot.get("nodes");
        Object rawEdges = snapshot.get("edges");

        if (rawNodes != null) {
            List<DiagramEntity.NodeData> nodes = objectMapper.convertValue(
                    rawNodes,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, DiagramEntity.NodeData.class)
            );
            diagram.setNodes(nodes);
        }
        if (rawEdges != null) {
            List<DiagramEntity.EdgeData> edges = objectMapper.convertValue(
                    rawEdges,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, DiagramEntity.EdgeData.class)
            );
            diagram.setEdges(edges);
        }
        diagram.setUpdatedAt(LocalDateTime.now());
        diagramRepo.save(diagram);

        // Trả về DiagramModel để FE apply lên canvas
        DiagramModel model = new DiagramModel();
        model.setId(diagram.getId());
        model.setTitle(diagram.getTitle());
        model.setNodes(diagram.getNodes());
        model.setEdges(diagram.getEdges());
        model.setShareToken(diagram.getShareToken());
        model.setOwnerId(diagram.getOwnerId());
        return model;
    }

    // ── Helper ───────────────────────────────────────────────────────
    private VersionModel toModel(DiagramVersionEntity e) {
        return VersionModel.builder()
                .id(e.getId())
                .versionNum(e.getVersionNum())
                .label(e.getLabel())
                .savedBy(e.getSavedBy())
                .savedAt(e.getSavedAt())
                .build();
    }
}