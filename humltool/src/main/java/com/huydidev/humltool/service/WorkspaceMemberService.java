// src/main/java/com/huydidev/humltool/service/WorkspaceMemberService.java

package com.huydidev.humltool.service;

import com.huydidev.humltool.dto.request.ApproveMemberRequest;
import com.huydidev.humltool.dto.request.InviteMemberRequest;
import com.huydidev.humltool.dto.response.InviteResultResponse;
import com.huydidev.humltool.dto.response.WorkspaceInviteResponse;
import com.huydidev.humltool.dto.response.WorkspaceMemberResponse;

import java.util.List;

public interface WorkspaceMemberService {

    // Invite by email(s)
    InviteResultResponse inviteMembers(
            String workspaceId,
            InviteMemberRequest request,
            String token
    );

    // Join via invite link
    void requestJoin(String inviteCode, String token);

    // Approve / Reject pending member — Teacher/Owner only
    WorkspaceMemberResponse approveMember(
            String workspaceId,
            ApproveMemberRequest request,
            String token
    );

    // Lấy danh sách member
    List<WorkspaceMemberResponse> getMembers(String workspaceId, String token);

    // Lấy danh sách pending
    List<WorkspaceMemberResponse> getPendingMembers(String workspaceId, String token);

    // Đổi role member — Owner only
    WorkspaceMemberResponse changeMemberRole(
            String workspaceId,
            String userId,
            String newRole,
            String token
    );

    // Kick member — Owner/Teacher only
    void removeMember(String workspaceId, String userId, String token);

    // Tự rời workspace
    void leaveWorkspace(String workspaceId, String token);

    // Lấy pending invites của chính mình
    List<WorkspaceInviteResponse> getMyPendingInvites(String token);

    // Helper — check role trong workspace
    String getMyRole(String workspaceId, String userId);

    // Helper — check có phải teacher/owner không
    boolean isTeacherOrOwner(String workspaceId, String userId);
}