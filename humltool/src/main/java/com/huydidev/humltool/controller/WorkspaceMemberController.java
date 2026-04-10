// src/main/java/com/huydidev/humltool/controller/WorkspaceMemberController.java

package com.huydidev.humltool.controller;

import com.huydidev.humltool.dto.request.ApproveMemberRequest;
import com.huydidev.humltool.dto.request.InviteMemberRequest;
import com.huydidev.humltool.service.WorkspaceMemberService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceMemberController {

    @Autowired private WorkspaceMemberService memberService;

    // POST /api/workspaces/{id}/invite — invite by email(s)
    @PostMapping("/{id}/invite")
    public ResponseEntity<?> invite(
            @PathVariable String id,
            @RequestBody @Valid InviteMemberRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            return ResponseEntity.ok(
                    memberService.inviteMembers(
                            id, request, authHeader.substring(7)));
        } catch (RuntimeException e) {
            if ("FORBIDDEN".equals(e.getMessage())) {
                return ResponseEntity.status(403)
                        .body(Map.of("message",
                                "Bạn không có quyền invite member"));
            }
            throw e;
        }
    }

    // POST /api/workspaces/join/{inviteCode} — request join via link
    @PostMapping("/join/{inviteCode}")
    public ResponseEntity<?> requestJoin(
            @PathVariable String inviteCode,
            @RequestHeader("Authorization") String authHeader) {
        try {
            memberService.requestJoin(inviteCode, authHeader.substring(7));
            return ResponseEntity.ok(
                    Map.of("message", "Yêu cầu tham gia đã được gửi"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // GET /api/workspaces/{id}/members — danh sách member active
    @GetMapping("/{id}/members")
    public ResponseEntity<?> getMembers(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            return ResponseEntity.ok(
                    memberService.getMembers(id, authHeader.substring(7)));
        } catch (RuntimeException e) {
            if ("FORBIDDEN".equals(e.getMessage())) {
                return ResponseEntity.status(403)
                        .body(Map.of("message", "Bạn không có quyền xem danh sách member"));
            }
            throw e;
        }
    }

    // GET /api/workspaces/{id}/members/pending — danh sách pending
    @GetMapping("/{id}/members/pending")
    public ResponseEntity<?> getPendingMembers(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            return ResponseEntity.ok(
                    memberService.getPendingMembers(
                            id, authHeader.substring(7)));
        } catch (RuntimeException e) {
            if ("FORBIDDEN".equals(e.getMessage())) {
                return ResponseEntity.status(403)
                        .body(Map.of("message",
                                "Chỉ teacher/owner mới xem được danh sách pending"));
            }
            throw e;
        }
    }

    // PATCH /api/workspaces/{id}/members/approve — approve/reject pending
    @PatchMapping("/{id}/members/approve")
    public ResponseEntity<?> approveMember(
            @PathVariable String id,
            @RequestBody @Valid ApproveMemberRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            return ResponseEntity.ok(
                    memberService.approveMember(
                            id, request, authHeader.substring(7)));
        } catch (RuntimeException e) {
            if ("FORBIDDEN".equals(e.getMessage())) {
                return ResponseEntity.status(403)
                        .body(Map.of("message",
                                "Chỉ teacher/owner mới approve được"));
            }
            throw e;
        }
    }

    // PATCH /api/workspaces/{id}/members/{userId}/role — đổi role
    @PatchMapping("/{id}/members/{userId}/role")
    public ResponseEntity<?> changeRole(
            @PathVariable String id,
            @PathVariable String userId,
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader) {
        try {
            return ResponseEntity.ok(
                    memberService.changeMemberRole(
                            id, userId,
                            body.get("role"),
                            authHeader.substring(7)));
        } catch (RuntimeException e) {
            if ("FORBIDDEN".equals(e.getMessage())) {
                return ResponseEntity.status(403)
                        .body(Map.of("message",
                                "Chỉ owner mới đổi role được"));
            }
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // DELETE /api/workspaces/{id}/members/{userId} — kick member
    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<?> removeMember(
            @PathVariable String id,
            @PathVariable String userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            memberService.removeMember(id, userId, authHeader.substring(7));
            return ResponseEntity.ok(
                    Map.of("message", "Đã xóa member thành công"));
        } catch (RuntimeException e) {
            if ("FORBIDDEN".equals(e.getMessage())) {
                return ResponseEntity.status(403)
                        .body(Map.of("message",
                                "Bạn không có quyền xóa member này"));
            }
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // DELETE /api/workspaces/{id}/leave — tự rời workspace
    @DeleteMapping("/{id}/leave")
    public ResponseEntity<?> leave(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            memberService.leaveWorkspace(id, authHeader.substring(7));
            return ResponseEntity.ok(
                    Map.of("message", "Đã rời workspace thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // GET /api/workspaces/invites/pending — pending invites của mình
    @GetMapping("/invites/pending")
    public ResponseEntity<?> getMyPendingInvites(
            @RequestHeader("Authorization") String authHeader) {

        return ResponseEntity.ok(
                memberService.getMyPendingInvites(authHeader.substring(7)));
    }
}