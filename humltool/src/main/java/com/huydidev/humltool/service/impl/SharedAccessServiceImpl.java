package com.huydidev.humltool.service.impl;

import com.huydidev.humltool.config.JwtUtils;
import com.huydidev.humltool.entity.DiagramEntity;
import com.huydidev.humltool.entity.SharedAccessEntity;
import com.huydidev.humltool.exceptions.ResourceNotFoundException;
import com.huydidev.humltool.model.ShareModel;
import com.huydidev.humltool.repository.DiagramRepository;
import com.huydidev.humltool.repository.SharedAccessRepository;
import com.huydidev.humltool.service.SharedAccessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SharedAccessServiceImpl implements SharedAccessService {

    @Autowired private SharedAccessRepository sharedAccessRepository;
    @Autowired private DiagramRepository      diagramRepository;
    @Autowired private JwtUtils               jwtUtils;

    @Override
    public ShareModel shareDiagram(String diagramId, String ownerToken, String targetUserId, String role) {
        String ownerId = jwtUtils.getUserNameFromJwtToken(ownerToken);

        DiagramEntity diagram = diagramRepository.findById(diagramId)
                .orElseThrow(() -> new ResourceNotFoundException("Bản vẽ không tồn tại"));

        if (!diagram.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("Chỉ chủ sở hữu mới có quyền chia sẻ!");
        }
        if (ownerId.equals(targetUserId)) {
            throw new RuntimeException("Bạn đã là chủ sở hữu, không cần chia sẻ cho chính mình.");
        }

        SharedAccessEntity access = sharedAccessRepository
                .findByDiagramIdAndUserId(diagramId, targetUserId)
                .orElse(new SharedAccessEntity());

        access.setDiagramId(diagramId);
        access.setUserId(targetUserId);
        access.setRole(role);
        access.setGrantedAt(LocalDateTime.now());

        SharedAccessEntity saved = sharedAccessRepository.save(access);

        return ShareModel.builder()
                .userId(saved.getUserId())
                .role(saved.getRole())
                .grantedAt(saved.getGrantedAt().toString())
                .build();
    }

    @Override
    public List<ShareModel> getSharedUsers(String diagramId) {
        return sharedAccessRepository.findByDiagramId(diagramId)
                .stream()
                .map(e -> ShareModel.builder()
                        .userId(e.getUserId())
                        .role(e.getRole())
                        .grantedAt(e.getGrantedAt().toString())
                        .build())
                .toList();
    }

    @Override
    public void revokeAccess(String diagramId, String userId) {
        sharedAccessRepository.deleteByDiagramIdAndUserId(diagramId, userId);
    }

    @Override
    public String getOwnerId(String diagramId) {
        return diagramRepository.findById(diagramId)
                .map(DiagramEntity::getOwnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Diagram không tồn tại"));
    }

    @Override
    public void verifyAccess(String diagramId, String userId, String requiredRole) {
        DiagramEntity diagram = diagramRepository.findById(diagramId)
                .orElseThrow(() -> new ResourceNotFoundException("Diagram không tồn tại"));

        if (diagram.getOwnerId().equals(userId)) return;

        SharedAccessEntity access = sharedAccessRepository
                .findByDiagramIdAndUserId(diagramId, userId)
                .orElseThrow(() -> new RuntimeException("Bạn không có quyền truy cập!"));

        if ("EDITOR".equals(requiredRole) && "VIEWER".equals(access.getRole())) {
            throw new RuntimeException("Bạn chỉ có quyền xem, không được sửa!");
        }
    }
}