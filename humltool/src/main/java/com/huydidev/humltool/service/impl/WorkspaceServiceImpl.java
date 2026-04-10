// src/main/java/com/huydidev/humltool/service/impl/WorkspaceServiceImpl.java

package com.huydidev.humltool.service.impl;

import com.huydidev.humltool.config.JwtUtils;
import com.huydidev.humltool.dto.request.CreateWorkspaceRequest;
import com.huydidev.humltool.dto.request.UpdateWorkspaceRequest;
import com.huydidev.humltool.dto.response.WorkspaceResponse;
import com.huydidev.humltool.entity.WorkspaceEntity;
import com.huydidev.humltool.entity.WorkspaceMemberEntity;
import com.huydidev.humltool.exceptions.ResourceNotFoundException;
import com.huydidev.humltool.repository.DiagramRepository;
import com.huydidev.humltool.repository.WorkspaceMemberRepository;
import com.huydidev.humltool.repository.WorkspaceRepository;
import com.huydidev.humltool.service.WorkspaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WorkspaceServiceImpl implements WorkspaceService {

    @Autowired private WorkspaceRepository       workspaceRepository;
    @Autowired private WorkspaceMemberRepository memberRepository;
    @Autowired private DiagramRepository         diagramRepository;
    @Autowired private JwtUtils                  jwtUtils;

    // ── Tạo workspace mới ─────────────────────────────────────────
    @Override
    public WorkspaceResponse createWorkspace(CreateWorkspaceRequest request, String token) {
        String userId = jwtUtils.getUserNameFromJwtToken(token);

        WorkspaceEntity workspace = new WorkspaceEntity();
        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());
        workspace.setType(request.getType());
        workspace.setOwnerId(userId);
        workspace.setInviteCode(generateInviteCode());

        // Default settings theo type
        WorkspaceEntity.WorkspaceSettings settings = new WorkspaceEntity.WorkspaceSettings();
        if ("TEAM".equals(request.getType())) {
            settings.setRequireApproval(false);
            settings.setAllowMemberInvite(true);
        }
        workspace.setSettings(settings);

        WorkspaceEntity saved = workspaceRepository.save(workspace);

        // Auto add owner vào member list
        WorkspaceMemberEntity ownerMember = new WorkspaceMemberEntity();
        ownerMember.setWorkspaceId(saved.getId());
        ownerMember.setUserId(userId);
        ownerMember.setRole("OWNER");
        ownerMember.setStatus("ACTIVE");
        memberRepository.save(ownerMember);

        return mapToResponse(saved, "OWNER");
    }

    // ── Cập nhật workspace ────────────────────────────────────────
    // WorkspaceServiceImpl.java — sửa updateWorkspace

    @Override
    public WorkspaceResponse updateWorkspace(
            String workspaceId, UpdateWorkspaceRequest request, String token) {

        String userId   = jwtUtils.getUserNameFromJwtToken(token);
        WorkspaceEntity workspace = findAndCheckOwner(workspaceId, userId);

        if (request.getName() != null && !request.getName().isBlank()) {
            workspace.setName(request.getName());
        }
        if (request.getDescription() != null) {
            workspace.setDescription(request.getDescription());
        }

        // ── Deadline — Teacher cũng được cập nhật ────────────────────
        // Dùng flag hasDeadline để phân biệt "không gửi" vs "gửi null để xóa"
        if (request.isUpdateDeadline()) {
            workspace.setDeadline(request.getDeadline());
        }

        // ── Settings ──────────────────────────────────────────────────
        WorkspaceEntity.WorkspaceSettings settings = workspace.getSettings();
        if (settings == null) settings = new WorkspaceEntity.WorkspaceSettings();

        if (request.getGradeVisible() != null) {
            settings.setGradeVisible(request.getGradeVisible());
        }
        if (request.getAllowStudentShare() != null) {
            settings.setAllowStudentShare(request.getAllowStudentShare());
        }
        if (request.getRequireApproval() != null) {
            settings.setRequireApproval(request.getRequireApproval());
        }
        if (request.getAllowMemberInvite() != null) {
            settings.setAllowMemberInvite(request.getAllowMemberInvite());
        }

        workspace.setSettings(settings);
        workspace.setUpdatedAt(LocalDateTime.now());

        String myRole = getMemberRole(workspaceId, userId);
        return mapToResponse(workspaceRepository.save(workspace), myRole);
    }

    // ── Xóa workspace ─────────────────────────────────────────────
    @Override
    public void deleteWorkspace(String workspaceId, String token) {
        String userId = jwtUtils.getUserNameFromJwtToken(token);
        findAndCheckOwner(workspaceId, userId);

        // Xóa tất cả members
        memberRepository.findByWorkspaceId(workspaceId)
                .forEach(m -> memberRepository.delete(m));

        workspaceRepository.deleteById(workspaceId);
    }

    // ── Lấy danh sách workspaces của user ─────────────────────────
    @Override
    public List<WorkspaceResponse> getMyWorkspaces(String token) {
        String userId = jwtUtils.getUserNameFromJwtToken(token);

        // Lấy tất cả membership ACTIVE của user
        return memberRepository.findByUserIdAndStatus(userId, "ACTIVE")
                .stream()
                .map(member -> workspaceRepository.findById(member.getWorkspaceId()))
                .filter(opt -> opt.isPresent())
                .map(opt -> mapToResponse(opt.get(),
                        getMemberRole(opt.get().getId(), userId)))
                .collect(Collectors.toList());
    }

    // ── Lấy chi tiết workspace ────────────────────────────────────
    @Override
    public WorkspaceResponse getWorkspaceById(String workspaceId, String token) {
        String userId   = jwtUtils.getUserNameFromJwtToken(token);
        WorkspaceEntity workspace = findAndCheckMember(workspaceId, userId);
        String myRole   = getMemberRole(workspaceId, userId);
        return mapToResponse(workspace, myRole);
    }

    // ── Lấy workspace qua invite code — public ────────────────────
    @Override
    public WorkspaceResponse getWorkspaceByInviteCode(String inviteCode) {
        WorkspaceEntity workspace = workspaceRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Invite link không hợp lệ hoặc đã hết hạn"));
        return mapToResponse(workspace, null);
    }

    // ── Regenerate invite code ────────────────────────────────────
    @Override
    public WorkspaceResponse regenerateInviteCode(String workspaceId, String token) {
        String userId   = jwtUtils.getUserNameFromJwtToken(token);
        WorkspaceEntity workspace = findAndCheckOwner(workspaceId, userId);
        workspace.setInviteCode(generateInviteCode());
        workspace.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(workspaceRepository.save(workspace), "OWNER");
    }

    // ── Lấy diagrams trong workspace ─────────────────────────────
    @Override
    public Object getWorkspaceDiagrams(String workspaceId, String token) {
        String userId = jwtUtils.getUserNameFromJwtToken(token);
        findAndCheckMember(workspaceId, userId);
        String role = getMemberRole(workspaceId, userId);

        // Teacher/Owner thấy tất cả
        if ("OWNER".equals(role) || "TEACHER".equals(role)) {
            return diagramRepository.findByWorkspaceIdOrderByUpdatedAtDesc(workspaceId);
        }

        // Student/Member chỉ thấy của mình
        return diagramRepository.findByWorkspaceIdAndOwnerIdOrderByUpdatedAtDesc(
                workspaceId, userId);
    }

    // ── Helpers ───────────────────────────────────────────────────
    private WorkspaceEntity findAndCheckOwner(String workspaceId, String userId) {
        WorkspaceEntity workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Workspace không tồn tại: " + workspaceId));
        if (!workspace.getOwnerId().equals(userId)) {
            throw new RuntimeException("FORBIDDEN");
        }
        return workspace;
    }
    private WorkspaceEntity findAndCheckTeacherOrOwner(
            String workspaceId, String userId) {

        WorkspaceEntity workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Workspace không tồn tại: " + workspaceId));

        String role = getMemberRole(workspaceId, userId);
        if (!"OWNER".equals(role) && !"TEACHER".equals(role)) {
            throw new RuntimeException("FORBIDDEN");
        }
        return workspace;
    }
    private WorkspaceEntity findAndCheckMember(String workspaceId, String userId) {
        WorkspaceEntity workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Workspace không tồn tại: " + workspaceId));
        boolean isMember = memberRepository
                .existsByWorkspaceIdAndUserId(workspaceId, userId);
        if (!isMember) throw new RuntimeException("FORBIDDEN");
        return workspace;
    }

    private String getMemberRole(String workspaceId, String userId) {
        return memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .map(WorkspaceMemberEntity::getRole)
                .orElse(null);
    }

    private String generateInviteCode() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }

    private WorkspaceResponse mapToResponse(WorkspaceEntity workspace, String myRole) {
        WorkspaceEntity.WorkspaceSettings settings = workspace.getSettings();
        long memberCount  = memberRepository.countByWorkspaceIdAndStatus(
                workspace.getId(), "ACTIVE");
        long diagramCount = diagramRepository.countByWorkspaceId(workspace.getId());

        // Check locked
        boolean isLocked = workspace.getDeadline() != null
                && LocalDateTime.now().isAfter(workspace.getDeadline());

        return WorkspaceResponse.builder()
                .id(workspace.getId())
                .name(workspace.getName())
                .description(workspace.getDescription())
                .type(workspace.getType())
                .ownerId(workspace.getOwnerId())
                .inviteCode(workspace.getInviteCode())
                .myRole(myRole)
                .gradeVisible(settings != null
                        ? settings.getGradeVisible() : "SELF_ONLY")
                .allowStudentShare(settings != null
                        && settings.isAllowStudentShare())
                .requireApproval(settings == null
                        || settings.isRequireApproval())
                .allowMemberInvite(settings != null
                        && settings.isAllowMemberInvite())
                .memberCount(memberCount)
                .diagramCount(diagramCount)
                .deadline(workspace.getDeadline())
                .isLocked(isLocked)
                .createdAt(workspace.getCreatedAt())
                .updatedAt(workspace.getUpdatedAt())
                .build();
    }
}