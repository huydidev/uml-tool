// src/main/java/com/huydidev/humltool/controller/WorkspaceController.java

package com.huydidev.humltool.controller;

import com.huydidev.humltool.config.JwtUtils;
import com.huydidev.humltool.dto.request.CreateWorkspaceRequest;
import com.huydidev.humltool.dto.request.UpdateWorkspaceRequest;
import com.huydidev.humltool.dto.response.WorkspaceResponse;
import com.huydidev.humltool.service.WorkspaceMemberService;
import com.huydidev.humltool.service.WorkspaceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    @Autowired private WorkspaceService       workspaceService;
    @Autowired private WorkspaceMemberService memberService;   // ← thêm
    @Autowired private JwtUtils               jwtUtils;        // ← thêm

    // POST /api/workspaces
    @PostMapping
    public ResponseEntity<WorkspaceResponse> create(
            @RequestBody @Valid CreateWorkspaceRequest request,
            @RequestHeader("Authorization") String authHeader) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workspaceService.createWorkspace(
                        request, authHeader.substring(7)));
    }

    // GET /api/workspaces
    @GetMapping
    public ResponseEntity<List<WorkspaceResponse>> getMyWorkspaces(
            @RequestHeader("Authorization") String authHeader) {

        return ResponseEntity.ok(
                workspaceService.getMyWorkspaces(authHeader.substring(7)));
    }

    // GET /api/workspaces/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            return ResponseEntity.ok(
                    workspaceService.getWorkspaceById(
                            id, authHeader.substring(7)));
        } catch (RuntimeException e) {
            if ("FORBIDDEN".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message",
                                "Bạn không có quyền truy cập workspace này"));
            }
            throw e;
        }
    }

    // GET /api/workspaces/join/{inviteCode}
    @GetMapping("/join/{inviteCode}")
    public ResponseEntity<WorkspaceResponse> getByInviteCode(
            @PathVariable String inviteCode) {

        return ResponseEntity.ok(
                workspaceService.getWorkspaceByInviteCode(inviteCode));
    }

    // PATCH /api/workspaces/{id}
    @PatchMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable String id,
            @RequestBody UpdateWorkspaceRequest request,
            @RequestHeader("Authorization") String authHeader) {

        String token  = authHeader.substring(7);
        String userId = jwtUtils.getUserNameFromJwtToken(token);

        try {
            String role = memberService.getMyRole(id, userId);

            if (role == null) {
                return ResponseEntity.status(403)
                        .body(Map.of("message", "Bạn không phải thành viên"));
            }

            if ("TEACHER".equals(role)) {
                // Teacher chỉ update được deadline
                UpdateWorkspaceRequest teacherRequest =
                        new UpdateWorkspaceRequest();
                teacherRequest.setDeadline(request.getDeadline());
                teacherRequest.setUpdateDeadline(request.isUpdateDeadline());
                return ResponseEntity.ok(
                        workspaceService.updateWorkspace(
                                id, teacherRequest, token));
            }

            if (!"OWNER".equals(role)) {
                return ResponseEntity.status(403)
                        .body(Map.of("message", "Không có quyền cập nhật"));
            }

            return ResponseEntity.ok(
                    workspaceService.updateWorkspace(id, request, token));

        } catch (RuntimeException e) {
            if ("FORBIDDEN".equals(e.getMessage())) {
                return ResponseEntity.status(403)
                        .body(Map.of("message",
                                "Chỉ owner mới được cập nhật workspace"));
            }
            throw e;
        }
    }

    // DELETE /api/workspaces/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            workspaceService.deleteWorkspace(id, authHeader.substring(7));
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            if ("FORBIDDEN".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Chỉ owner mới được xóa workspace"));
            }
            throw e;
        }
    }

    // POST /api/workspaces/{id}/regenerate-invite
    @PostMapping("/{id}/regenerate-invite")
    public ResponseEntity<?> regenerateInviteCode(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            return ResponseEntity.ok(
                    workspaceService.regenerateInviteCode(
                            id, authHeader.substring(7)));
        } catch (RuntimeException e) {
            if ("FORBIDDEN".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message",
                                "Chỉ owner mới được regenerate invite code"));
            }
            throw e;
        }
    }

    // GET /api/workspaces/{id}/diagrams
    @GetMapping("/{id}/diagrams")
    public ResponseEntity<?> getDiagrams(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            return ResponseEntity.ok(
                    workspaceService.getWorkspaceDiagrams(
                            id, authHeader.substring(7)));
        } catch (RuntimeException e) {
            if ("FORBIDDEN".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message",
                                "Bạn không có quyền truy cập workspace này"));
            }
            throw e;
        }
    }
}