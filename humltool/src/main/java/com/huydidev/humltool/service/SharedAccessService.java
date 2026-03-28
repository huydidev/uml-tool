package com.huydidev.humltool.service;

import com.huydidev.humltool.model.ShareModel;

import java.util.List;

public interface SharedAccessService {
    ShareModel shareDiagram(String diagramId, String ownerToken, String targetUserId, String role);

    void verifyAccess(String diagramId, String userId, String requiredRole);

    List<ShareModel> getSharedUsers(String diagramId);

    void revokeAccess(String diagramId, String userId);
}
