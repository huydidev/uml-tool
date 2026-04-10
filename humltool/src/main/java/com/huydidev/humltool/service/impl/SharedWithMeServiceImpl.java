package com.huydidev.humltool.service.impl;

import com.huydidev.humltool.config.JwtUtils;
import com.huydidev.humltool.entity.DiagramEntity;
import com.huydidev.humltool.entity.SharedAccessEntity;
import com.huydidev.humltool.model.DiagramModel;
import com.huydidev.humltool.repository.DiagramRepository;
import com.huydidev.humltool.repository.SharedAccessRepository;
import com.huydidev.humltool.service.SharedWithMeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SharedWithMeServiceImpl implements SharedWithMeService {

    @Autowired private SharedAccessRepository sharedAccessRepository;
    @Autowired private DiagramRepository      diagramRepository;
    @Autowired private JwtUtils               jwtUtils;

    @Override
    public List<DiagramModel> getSharedWithMe(String token) {
        String userId = jwtUtils.getUserNameFromJwtToken(token);

        // Lấy tất cả shared_access của user này
        List<SharedAccessEntity> accesses = sharedAccessRepository.findByUserId(userId);

        // Map sang DiagramModel, bỏ qua diagram đã bị xóa
        return accesses.stream()
                .map(access -> diagramRepository.findById(access.getDiagramId()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(diagram -> toModel(diagram))
                .toList();
    }

    private DiagramModel toModel(DiagramEntity entity) {
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