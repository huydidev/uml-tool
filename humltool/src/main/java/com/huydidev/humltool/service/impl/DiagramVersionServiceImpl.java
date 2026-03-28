package com.huydidev.humltool.service.impl;

import com.huydidev.humltool.config.JwtUtils;
import com.huydidev.humltool.entity.DiagramEntity;
import com.huydidev.humltool.entity.DiagramVersionEntity;
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
    public DiagramVersionEntity saveVersion(String diagramId, String label, String token){
        DiagramEntity currentDiagram = diagramRepo.findById(diagramId)
                .orElseThrow(()-> new RuntimeException("Không tìm thấy bản vẻ!"));

        DiagramVersionEntity lastVersion = versionRepo.findFirstByDiagramIdOrderByVersionNumDesc(diagramId);
        int nextVersion = (lastVersion == null) ? 1: lastVersion.getVersionNum() + 1;

        DiagramVersionEntity newVersion = new DiagramVersionEntity();
        newVersion.setDiagramId(diagramId);
        newVersion.setVersionNum(nextVersion);
        newVersion.setLabel(label);
        newVersion.setSavedBy(jwtUtils.getUserNameFromJwtToken(token));

        newVersion.setSnapshot(Map.of(
                "nodes", currentDiagram.getNodes(),
                "edges", currentDiagram.getEdges()
        ));

        return versionRepo.save(newVersion);
    }

    @Override
    public List<DiagramVersionEntity> getHistory(String diagramId){
        return versionRepo.findByDiagramIdOrderByVersionNumDesc(diagramId);
    }
}
