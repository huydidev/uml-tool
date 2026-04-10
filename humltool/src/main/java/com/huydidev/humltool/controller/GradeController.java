// src/main/java/com/huydidev/humltool/controller/GradeController.java

package com.huydidev.humltool.controller;

import com.huydidev.humltool.dto.request.GradeRequest;
import com.huydidev.humltool.dto.response.GradeResponse;
import com.huydidev.humltool.service.GradeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workspaces")
public class GradeController {

    @Autowired private GradeService gradeService;

    // POST /api/workspaces/{id}/grades — chấm điểm
    @PostMapping("/{id}/grades")
    public ResponseEntity<?> upsertGrade(
            @PathVariable String id,
            @RequestBody @Valid GradeRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            return ResponseEntity.ok(
                    gradeService.upsertGrade(
                            id, request, authHeader.substring(7)));
        } catch (RuntimeException e) {
            if ("FORBIDDEN".equals(e.getMessage())) {
                return ResponseEntity.status(403)
                        .body(Map.of("message",
                                "Chỉ teacher/owner mới chấm điểm được"));
            }
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // GET /api/workspaces/{id}/grades — lấy tất cả grade
    @GetMapping("/{id}/grades")
    public ResponseEntity<?> getWorkspaceGrades(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            return ResponseEntity.ok(
                    gradeService.getWorkspaceGrades(
                            id, authHeader.substring(7)));
        } catch (RuntimeException e) {
            if ("FORBIDDEN".equals(e.getMessage())) {
                return ResponseEntity.status(403)
                        .body(Map.of("message",
                                "Bạn không có quyền xem grades"));
            }
            throw e;
        }
    }

    // GET /api/workspaces/{id}/grades/diagram/{diagramId}
    @GetMapping("/{id}/grades/diagram/{diagramId}")
    public ResponseEntity<?> getDiagramGrade(
            @PathVariable String id,
            @PathVariable String diagramId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            return ResponseEntity.ok(
                    gradeService.getDiagramGrade(
                            id, diagramId, authHeader.substring(7)));
        } catch (RuntimeException e) {
            if ("FORBIDDEN".equals(e.getMessage())) {
                return ResponseEntity.status(403)
                        .body(Map.of("message",
                                "Bạn không có quyền xem grade này"));
            }
            throw e;
        }
    }

    // DELETE /api/workspaces/{id}/grades/{gradeId}
    @DeleteMapping("/{id}/grades/{gradeId}")
    public ResponseEntity<?> deleteGrade(
            @PathVariable String id,
            @PathVariable String gradeId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            gradeService.deleteGrade(id, gradeId, authHeader.substring(7));
            return ResponseEntity.ok(
                    Map.of("message", "Đã xóa grade thành công"));
        } catch (RuntimeException e) {
            if ("FORBIDDEN".equals(e.getMessage())) {
                return ResponseEntity.status(403)
                        .body(Map.of("message",
                                "Chỉ teacher/owner mới xóa grade được"));
            }
            throw e;
        }
    }
}