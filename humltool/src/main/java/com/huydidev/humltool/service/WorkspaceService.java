// src/main/java/com/huydidev/humltool/service/WorkspaceService.java

package com.huydidev.humltool.service;

import com.huydidev.humltool.dto.request.CreateWorkspaceRequest;
import com.huydidev.humltool.dto.request.UpdateWorkspaceRequest;
import com.huydidev.humltool.dto.response.WorkspaceResponse;

import java.util.List;

public interface WorkspaceService {

    // CRUD
    WorkspaceResponse createWorkspace(CreateWorkspaceRequest request, String token);
    WorkspaceResponse updateWorkspace(String workspaceId, UpdateWorkspaceRequest request, String token);
    void deleteWorkspace(String workspaceId, String token);

    // Lấy danh sách workspace của user (tất cả role)
    List<WorkspaceResponse> getMyWorkspaces(String token);

    // Lấy chi tiết 1 workspace
    WorkspaceResponse getWorkspaceById(String workspaceId, String token);

    // Lấy info workspace qua invite code — public, không cần auth
    WorkspaceResponse getWorkspaceByInviteCode(String inviteCode);

    // Regenerate invite code mới
    WorkspaceResponse regenerateInviteCode(String workspaceId, String token);

    // Lấy diagrams trong workspace
    // Teacher: tất cả, Student: của mình
    Object getWorkspaceDiagrams(String workspaceId, String token);
}