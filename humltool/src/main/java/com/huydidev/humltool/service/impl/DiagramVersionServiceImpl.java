package com.huydidev.humltool.service.impl;

import com.huydidev.humltool.config.JwtUtils;
import com.huydidev.humltool.entity.DiagramEntity;
import com.huydidev.humltool.entity.DiagramVersionEntity;
import com.huydidev.humltool.model.VersionModel;
import com.huydidev.humltool.repository.DiagramRepository;
import com.huydidev.humltool.repository.DiagramVersionRepository;
import com.huydidev.humltool.service.DiagramVersionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class DiagramVersionServiceImpl implements DiagramVersionService {
    @Autowired private DiagramVersionRepository versionRepo;
    @Autowired private DiagramRepository diagramRepo;
    @Autowired private JwtUtils jwtUtils;

    @Override
    public VersionModel saveVersion(String diagramId, String label, String token) {
        DiagramEntity currentDiagram = diagramRepo.findById(diagramId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản vẽ!"));

        DiagramVersionEntity lastVersion = versionRepo.findFirstByDiagramIdOrderByVersionNumDesc(diagramId);
        int nextVersion = (lastVersion == null) ? 1 : lastVersion.getVersionNum() + 1;

        DiagramVersionEntity newVersion = new DiagramVersionEntity();
        newVersion.setDiagramId(diagramId);
        newVersion.setVersionNum(nextVersion);
        newVersion.setLabel(label != null ? label : "Version " + nextVersion);
        newVersion.setSavedBy(jwtUtils.getUserNameFromJwtToken(token));

        newVersion.setSnapshot(Map.of(
                "nodes", currentDiagram.getNodes(),
                "edges", currentDiagram.getEdges()
        ));

        DiagramVersionEntity savedEntity = versionRepo.save(newVersion);

        return VersionModel.builder()
                .id(savedEntity.getId())
                .versionNum(savedEntity.getVersionNum())
                .label(savedEntity.getLabel())
                .savedBy(savedEntity.getSavedBy())
                .savedAt(savedEntity.getSavedAt())
                .build();
    }

    @Override
    public List<VersionModel> getHistory(String diagramId) {
        List<DiagramVersionEntity> entities = versionRepo.findByDiagramIdOrderByVersionNumDesc(diagramId);

        return entities.stream().map(e -> VersionModel.builder()
                .id(e.getId())
                .versionNum(e.getVersionNum())
                .label(e.getLabel())
                .savedBy(e.getSavedBy())
                .savedAt(e.getSavedAt())
                .build()).toList();
    }
}
