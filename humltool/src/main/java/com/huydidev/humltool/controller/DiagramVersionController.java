package com.huydidev.humltool.controller;

import com.huydidev.humltool.model.VersionModel;
import com.huydidev.humltool.service.DiagramVersionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diagrams/{diagramId}/versions")
public class DiagramVersionController {

    @Autowired
    private DiagramVersionService versionService;

    // ── Lưu version thủ công (Ctrl+S) ────────────────────────────────
    // POST /api/diagrams/{diagramId}/versions
    @PostMapping
    public ResponseEntity<?> createVersion(
            @PathVariable String diagramId,
            @RequestParam(required = false) String label,
            HttpServletRequest request
    ) {
        String headerAuth = request.getHeader("Authorization");
        if (headerAuth == null || !headerAuth.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Bạn cần login để lưu version");
        }
        String token = headerAuth.substring(7);

        try {
            VersionModel savedVersion = versionService.saveVersion(diagramId, label, token);
            return ResponseEntity.ok(savedVersion);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lưu version: " + e.getMessage());
        }
    }

    // ── Lấy danh sách versions ────────────────────────────────────────
    // GET /api/diagrams/{diagramId}/versions
    @GetMapping
    public ResponseEntity<List<VersionModel>> getHistory(
            @PathVariable String diagramId
    ) {
        return ResponseEntity.ok(versionService.getHistory(diagramId));
    }

    // ── Restore về version cụ thể ─────────────────────────────────────
    // POST /api/diagrams/{diagramId}/versions/{vNum}/restore
    @PostMapping("/{vNum}/restore")
    public ResponseEntity<?> restore(
            @PathVariable String diagramId,
            @PathVariable Integer vNum,
            HttpServletRequest request
    ) {
        String headerAuth = request.getHeader("Authorization");
        if (headerAuth == null || !headerAuth.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Bạn cần login");
        }
        String token = headerAuth.substring(7);

        try {
            return ResponseEntity.ok(versionService.restoreVersion(diagramId, vNum, token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi restore: " + e.getMessage());
        }
    }
}