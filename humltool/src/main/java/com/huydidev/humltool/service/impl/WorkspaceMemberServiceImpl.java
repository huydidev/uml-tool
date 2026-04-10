// src/main/java/com/huydidev/humltool/service/impl/WorkspaceMemberServiceImpl.java

package com.huydidev.humltool.service.impl;

import com.huydidev.humltool.config.JwtUtils;
import com.huydidev.humltool.dto.request.ApproveMemberRequest;
import com.huydidev.humltool.dto.request.InviteMemberRequest;
import com.huydidev.humltool.dto.response.InviteResultResponse;
import com.huydidev.humltool.dto.response.WorkspaceInviteResponse;
import com.huydidev.humltool.dto.response.WorkspaceMemberResponse;
import com.huydidev.humltool.entity.WorkspaceEntity;
import com.huydidev.humltool.entity.WorkspaceInviteEntity;
import com.huydidev.humltool.entity.WorkspaceMemberEntity;
import com.huydidev.humltool.exceptions.ResourceNotFoundException;
import com.huydidev.humltool.repository.DiagramRepository;
import com.huydidev.humltool.repository.GradeRepository;
import com.huydidev.humltool.repository.UserRepository;
import com.huydidev.humltool.repository.WorkspaceInviteRepository;
import com.huydidev.humltool.repository.WorkspaceMemberRepository;
import com.huydidev.humltool.repository.WorkspaceRepository;
import com.huydidev.humltool.service.WorkspaceMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkspaceMemberServiceImpl implements WorkspaceMemberService {

    @Autowired private WorkspaceRepository       workspaceRepository;
    @Autowired private WorkspaceMemberRepository memberRepository;
    @Autowired private WorkspaceInviteRepository inviteRepository;
    @Autowired private UserRepository            userRepository;
    @Autowired private DiagramRepository         diagramRepository;
    @Autowired private GradeRepository           gradeRepository;
    @Autowired private JwtUtils                  jwtUtils;

    // ── Invite theo danh sách email ───────────────────────────────
    @Override
    public InviteResultResponse inviteMembers(
            String workspaceId, InviteMemberRequest request, String token) {

        String inviterId = jwtUtils.getUserNameFromJwtToken(token);

        // Chỉ OWNER hoặc TEACHER mới được invite
        if (!isTeacherOrOwner(workspaceId, inviterId)) {
            throw new RuntimeException("FORBIDDEN");
        }

        WorkspaceEntity workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Workspace không tồn tại"));

        List<String> success  = new ArrayList<>();
        List<String> failed   = new ArrayList<>();
        List<String> notFound = new ArrayList<>();

        for (String email : request.getEmails()) {
            String trimmedEmail = email.trim().toLowerCase();
            try {
                // Check user tồn tại trong hệ thống
                boolean userExists = userRepository.existsByEmail(trimmedEmail);
                if (!userExists) {
                    notFound.add(trimmedEmail);
                    continue;
                }

                // Check đã là member chưa
                if (memberRepository.existsByWorkspaceIdAndUserId(
                        workspaceId, trimmedEmail)) {
                    failed.add(trimmedEmail);
                    continue;
                }

                // Check đã invite pending chưa
                if (inviteRepository.existsByWorkspaceIdAndInvitedEmailAndStatus(
                        workspaceId, trimmedEmail, "PENDING")) {
                    failed.add(trimmedEmail);
                    continue;
                }

                // TEAM → auto join, không cần approve
                // CLASSROOM → tạo invite record, auto add nếu requireApproval = false
                boolean requireApproval = workspace.getSettings() != null
                        && workspace.getSettings().isRequireApproval();

                if ("TEAM".equals(workspace.getType()) || !requireApproval) {
                    // Auto add member
                    addMember(workspaceId, trimmedEmail, request.getRole(), "ACTIVE");
                } else {
                    // Tạo invite record PENDING
                    WorkspaceInviteEntity invite = new WorkspaceInviteEntity();
                    invite.setWorkspaceId(workspaceId);
                    invite.setInvitedEmail(trimmedEmail);
                    invite.setInvitedBy(inviterId);
                    invite.setStatus("PENDING");
                    inviteRepository.save(invite);

                    // Add member với status PENDING
                    addMember(workspaceId, trimmedEmail, request.getRole(), "PENDING");
                }

                success.add(trimmedEmail);

            } catch (Exception e) {
                failed.add(trimmedEmail);
            }
        }

        return InviteResultResponse.builder()
                .success(success)
                .failed(failed)
                .notFound(notFound)
                .totalSuccess(success.size())
                .totalFailed(failed.size() + notFound.size())
                .build();
    }

    // ── Join via invite link ──────────────────────────────────────
    @Override
    public void requestJoin(String inviteCode, String token) {
        String userId = jwtUtils.getUserNameFromJwtToken(token);

        WorkspaceEntity workspace = workspaceRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Invite link không hợp lệ"));

        // Check đã là member chưa
        if (memberRepository.existsByWorkspaceIdAndUserId(workspace.getId(), userId)) {
            throw new RuntimeException("Bạn đã là thành viên của workspace này");
        }

        boolean requireApproval = workspace.getSettings() != null
                && workspace.getSettings().isRequireApproval();

        if (requireApproval) {
            // Tạo invite record PENDING — chờ teacher approve
            WorkspaceInviteEntity invite = new WorkspaceInviteEntity();
            invite.setWorkspaceId(workspace.getId());
            invite.setInvitedEmail(userId);
            invite.setInvitedBy(userId);
            invite.setStatus("PENDING");
            inviteRepository.save(invite);

            // Add member PENDING
            String defaultRole = "CLASSROOM".equals(workspace.getType())
                    ? "STUDENT" : "MEMBER";
            addMember(workspace.getId(), userId, defaultRole, "PENDING");
        } else {
            // Auto join
            String defaultRole = "CLASSROOM".equals(workspace.getType())
                    ? "STUDENT" : "MEMBER";
            addMember(workspace.getId(), userId, defaultRole, "ACTIVE");
        }
    }

    // ── Approve / Reject pending member ──────────────────────────
    @Override
    public WorkspaceMemberResponse approveMember(
            String workspaceId, ApproveMemberRequest request, String token) {

        String approverId = jwtUtils.getUserNameFromJwtToken(token);

        if (!isTeacherOrOwner(workspaceId, approverId)) {
            throw new RuntimeException("FORBIDDEN");
        }

        WorkspaceMemberEntity member = memberRepository
                .findByWorkspaceIdAndUserId(workspaceId, request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy member"));

        if ("ACTIVE".equals(request.getAction())) {
            member.setStatus("ACTIVE");
            member.setJoinedAt(LocalDateTime.now());
            memberRepository.save(member);

            // Update invite record
            inviteRepository.findByWorkspaceIdAndInvitedEmail(
                            workspaceId, request.getUserId())
                    .ifPresent(invite -> {
                        invite.setStatus("ACCEPTED");
                        inviteRepository.save(invite);
                    });
        } else {
            // REJECTED → xóa member
            memberRepository.delete(member);

            inviteRepository.findByWorkspaceIdAndInvitedEmail(
                            workspaceId, request.getUserId())
                    .ifPresent(invite -> {
                        invite.setStatus("REJECTED");
                        inviteRepository.save(invite);
                    });
        }

        return mapToMemberResponse(member);
    }

    // ── Lấy danh sách member ──────────────────────────────────────
    @Override
    public List<WorkspaceMemberResponse> getMembers(String workspaceId, String token) {
        String userId = jwtUtils.getUserNameFromJwtToken(token);

        // Phải là member mới xem được
        if (!memberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw new RuntimeException("FORBIDDEN");
        }

        return memberRepository.findByWorkspaceIdAndStatus(workspaceId, "ACTIVE")
                .stream()
                .map(this::mapToMemberResponse)
                .collect(Collectors.toList());
    }

    // ── Lấy danh sách pending ─────────────────────────────────────
    @Override
    public List<WorkspaceMemberResponse> getPendingMembers(
            String workspaceId, String token) {

        String userId = jwtUtils.getUserNameFromJwtToken(token);

        if (!isTeacherOrOwner(workspaceId, userId)) {
            throw new RuntimeException("FORBIDDEN");
        }

        return memberRepository.findByWorkspaceIdAndStatus(workspaceId, "PENDING")
                .stream()
                .map(this::mapToMemberResponse)
                .collect(Collectors.toList());
    }

    // ── Đổi role member ───────────────────────────────────────────
    @Override
    public WorkspaceMemberResponse changeMemberRole(
            String workspaceId, String userId, String newRole, String token) {

        String requesterId = jwtUtils.getUserNameFromJwtToken(token);

        // Chỉ OWNER mới đổi role được
        String requesterRole = getMyRole(workspaceId, requesterId);
        if (!"OWNER".equals(requesterRole)) {
            throw new RuntimeException("FORBIDDEN");
        }

        // Không cho đổi role của chính mình
        if (requesterId.equals(userId)) {
            throw new RuntimeException("Không thể đổi role của chính mình");
        }

        WorkspaceMemberEntity member = memberRepository
                .findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy member"));

        member.setRole(newRole);
        return mapToMemberResponse(memberRepository.save(member));
    }

    // ── Kick member ───────────────────────────────────────────────
    @Override
    public void removeMember(String workspaceId, String userId, String token) {
        String requesterId = jwtUtils.getUserNameFromJwtToken(token);

        if (!isTeacherOrOwner(workspaceId, requesterId)) {
            throw new RuntimeException("FORBIDDEN");
        }

        // Không cho kick owner
        WorkspaceMemberEntity member = memberRepository
                .findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy member"));

        if ("OWNER".equals(member.getRole())) {
            throw new RuntimeException("Không thể xóa owner");
        }

        memberRepository.deleteByWorkspaceIdAndUserId(workspaceId, userId);
    }

    // ── Tự rời workspace ──────────────────────────────────────────
    @Override
    public void leaveWorkspace(String workspaceId, String token) {
        String userId = jwtUtils.getUserNameFromJwtToken(token);

        WorkspaceMemberEntity member = memberRepository
                .findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Bạn không phải thành viên workspace này"));

        // Owner không tự rời được — phải xóa workspace
        if ("OWNER".equals(member.getRole())) {
            throw new RuntimeException(
                    "Owner không thể rời workspace — hãy xóa workspace hoặc chuyển quyền owner");
        }

        memberRepository.delete(member);
    }

    // ── Lấy pending invites của chính mình ───────────────────────
    @Override
    public List<WorkspaceInviteResponse> getMyPendingInvites(String token) {
        String userId = jwtUtils.getUserNameFromJwtToken(token);

        return inviteRepository.findByInvitedEmailAndStatus(userId, "PENDING")
                .stream()
                .map(invite -> {
                    String workspaceName = workspaceRepository
                            .findById(invite.getWorkspaceId())
                            .map(WorkspaceEntity::getName)
                            .orElse("Unknown");

                    return WorkspaceInviteResponse.builder()
                            .id(invite.getId())
                            .workspaceId(invite.getWorkspaceId())
                            .workspaceName(workspaceName)
                            .invitedEmail(invite.getInvitedEmail())
                            .invitedBy(invite.getInvitedBy())
                            .status(invite.getStatus())
                            .createdAt(invite.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ── Helper: lấy role của user trong workspace ─────────────────
    @Override
    public String getMyRole(String workspaceId, String userId) {
        return memberRepository
                .findByWorkspaceIdAndUserId(workspaceId, userId)
                .map(WorkspaceMemberEntity::getRole)
                .orElse(null);
    }

    // ── Helper: check teacher hoặc owner ─────────────────────────
    @Override
    public boolean isTeacherOrOwner(String workspaceId, String userId) {
        String role = getMyRole(workspaceId, userId);
        return "OWNER".equals(role) || "TEACHER".equals(role);
    }

    // ── Helper: add member vào workspace ─────────────────────────
    private void addMember(
            String workspaceId, String userId, String role, String status) {

        WorkspaceMemberEntity member = new WorkspaceMemberEntity();
        member.setWorkspaceId(workspaceId);
        member.setUserId(userId);
        member.setRole(role);
        member.setStatus(status);
        if ("ACTIVE".equals(status)) {
            member.setJoinedAt(LocalDateTime.now());
        }
        memberRepository.save(member);
    }

    // ── Map entity → response ─────────────────────────────────────
    private WorkspaceMemberResponse mapToMemberResponse(WorkspaceMemberEntity member) {
        String userName = userRepository.findByEmail(member.getUserId())
                .map(u -> u.getName() != null ? u.getName() : u.getEmail())
                .orElse(member.getUserId());

        long diagramCount = diagramRepository
                .countByWorkspaceIdAndOwnerId(member.getWorkspaceId(), member.getUserId());

        boolean hasGrade = gradeRepository
                .findByWorkspaceIdAndStudentId(
                        member.getWorkspaceId(), member.getUserId())
                .stream()
                .anyMatch(g -> g.getScore() != null);

        return WorkspaceMemberResponse.builder()
                .userId(member.getUserId())
                .userName(userName)
                .role(member.getRole())
                .status(member.getStatus())
                .joinedAt(member.getJoinedAt())
                .diagramCount(diagramCount)
                .hasGrade(hasGrade)
                .build();
    }
}