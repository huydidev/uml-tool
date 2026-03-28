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
    @Autowired private DiagramRepository diagramRepository;
    @Autowired private JwtUtils jwtUtils;

    @Override
    public ShareModel shareDiagram(String diagramId, String ownerToken, String targetUserId, String role) {
        String ownerId = jwtUtils.getUserNameFromJwtToken(ownerToken);

        DiagramEntity diagram = diagramRepository.findById(diagramId)
                .orElseThrow(() -> new ResourceNotFoundException("Bản vẽ không tồn tại"));

        if (!diagram.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("Chỉ chủ sở hữu mới có quyền chia sẻ bản vẽ này!");
        }

        if (ownerId.equals(targetUserId)) {
            throw new RuntimeException("Bạn đã là chủ sở hữu, không cần chia sẻ cho chính mình.");
        }

        SharedAccessEntity access = sharedAccessRepository.findByDiagramIdAndUserId(diagramId, targetUserId)
                .orElse(new SharedAccessEntity());

        access.setDiagramId(diagramId);
        access.setUserId(targetUserId);
        access.setRole(role);
        access.setGrantedAt(LocalDateTime.now());

        SharedAccessEntity savedEntity = sharedAccessRepository.save(access);

        ShareModel response = new ShareModel();
        response.setUserId(savedEntity.getUserId());
        response.setRole(savedEntity.getRole());
        response.setGrantedAt(savedEntity.getGrantedAt().toString());

        return response;
    }

    @Override
    public List<ShareModel> getSharedUsers(String diagramId) {
        List<SharedAccessEntity> entities = sharedAccessRepository.findByDiagramId(diagramId);

        return entities.stream().map(entity -> {
            ShareModel model = new ShareModel();
            model.setUserId(entity.getUserId());
            model.setRole(entity.getRole());
            model.setGrantedAt(entity.getGrantedAt().toString());
            return model;
        }).toList();
    }

    @Override
    public void revokeAccess(String diagramId, String userId) {
        // Tìm và xóa quyền truy cập
        sharedAccessRepository.deleteByDiagramIdAndUserId(diagramId, userId);
    }

    @Override
    public void verifyAccess(String diagramId, String userId, String requiredRole) {
        DiagramEntity diagram = diagramRepository.findById(diagramId)
                .orElseThrow(() -> new ResourceNotFoundException("Diagram không tồn tại"));

        if (diagram.getOwnerId().equals(userId)) return;

        SharedAccessEntity access = sharedAccessRepository.findByDiagramIdAndUserId(diagramId, userId)
                .orElseThrow(() -> new RuntimeException("Bạn không có quyền truy cập bản vẽ này!"));

        if ("EDITOR".equals(requiredRole) && "VIEWER".equals(access.getRole())) {
            throw new RuntimeException("Bạn chỉ có quyền xem, không được sửa!");
        }
    }
}
