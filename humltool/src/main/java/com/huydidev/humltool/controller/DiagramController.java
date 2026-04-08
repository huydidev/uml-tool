package com.huydidev.humltool.controller;

import com.huydidev.humltool.model.DiagramModel;
import com.huydidev.humltool.service.DiagramService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/diagrams")
public class DiagramController {

    @Autowired private DiagramService diagramService;

    @PostMapping
    public ResponseEntity<DiagramModel> create(
            @RequestBody @Valid DiagramModel model,
            @RequestHeader("Authorization") String authHeader) {
        model.setId(null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(diagramService.saveDiagram(model, authHeader.substring(7)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiagramModel> update(
            @PathVariable String id,
            @RequestBody @Valid DiagramModel model,
            @RequestHeader("Authorization") String authHeader) {
        model.setId(id);
        return ResponseEntity.ok(diagramService.saveDiagram(model, authHeader.substring(7)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<DiagramModel> patch(
            @PathVariable String id,
            @RequestBody DiagramModel model,
            @RequestHeader("Authorization") String authHeader) {
        model.setId(id);
        return ResponseEntity.ok(diagramService.patchDiagram(model, authHeader.substring(7)));
    }

    @GetMapping
    public ResponseEntity<List<DiagramModel>> getAll(
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(diagramService.getMyDiagrams(authHeader.substring(7)));
    }

    // GET có check quyền — nếu bị revoke trả 403
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            return ResponseEntity.ok(
                    diagramService.getDiagramByIdWithAuth(id, authHeader.substring(7))
            );
        } catch (RuntimeException e) {
            if ("FORBIDDEN".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Bạn không có quyền truy cập diagram này"));
            }
            throw e;
        }
    }

    // GET qua shareToken — không cần auth, read-only
    @GetMapping("/shared/{shareToken}")
    public ResponseEntity<?> getByShareToken(@PathVariable String shareToken) {
        return ResponseEntity.ok(diagramService.getDiagramByShareToken(shareToken));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        diagramService.deleteDiagram(id);
        return ResponseEntity.noContent().build();
    }
}