package com.huydidev.humltool.controller;

import com.huydidev.humltool.model.DiagramModel;
import com.huydidev.humltool.service.DiagramService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diagrams")
public class DiagramController {

    @Autowired
    private DiagramService diagramService;

    // ── Tạo mới ──────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<DiagramModel> create(
            @RequestBody @Valid DiagramModel model,
            @RequestHeader("Authorization") String authHeader) {
        model.setId(null);
        String token = authHeader.substring(7);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(diagramService.saveDiagram(model, token));
    }

    // ── Update toàn bộ (save thủ công từ FE) ─────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<DiagramModel> update(
            @PathVariable String id,
            @RequestBody @Valid DiagramModel model,
            @RequestHeader("Authorization") String authHeader) {
        model.setId(id);
        String token = authHeader.substring(7);
        return ResponseEntity.ok(diagramService.saveDiagram(model, token));
    }

    // ── Auto-save: partial update chỉ nodes + edges + updatedAt ──────
    // FE gửi PATCH mỗi 1.5s debounce, chỉ truyền nodes và edges
    // Không cần @Valid vì title có thể không có trong body PATCH
    @PatchMapping("/{id}")
    public ResponseEntity<DiagramModel> patch(
            @PathVariable String id,
            @RequestBody DiagramModel model,
            @RequestHeader("Authorization") String authHeader) {
        model.setId(id);
        String token = authHeader.substring(7);
        return ResponseEntity.ok(diagramService.patchDiagram(model, token));
    }

    // ── Danh sách diagram của user đang login ─────────────────────────
    @GetMapping
    public ResponseEntity<List<DiagramModel>> getAll(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        return ResponseEntity.ok(diagramService.getMyDiagrams(token));
    }

    // ── Lấy diagram theo id ───────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<DiagramModel> getById(@PathVariable String id) {
        return ResponseEntity.ok(diagramService.getDiagramById(id));
    }

    // ── Xóa ──────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        diagramService.deleteDiagram(id);
        return ResponseEntity.noContent().build();
    }
}