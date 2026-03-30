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

    @PostMapping
    public ResponseEntity<DiagramModel> create(
            @RequestBody @Valid DiagramModel model,
            @RequestHeader("Authorization") String authHeader) {
        model.setId(null);
        String token = authHeader.substring(7);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(diagramService.saveDiagram(model, token));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiagramModel> update(
            @PathVariable String id,
            @RequestBody @Valid DiagramModel model,
            @RequestHeader("Authorization") String authHeader) {
        model.setId(id);
        String token = authHeader.substring(7);
        return ResponseEntity.ok(diagramService.saveDiagram(model, token));
    }

    // Chỉ trả về diagram của user đang đăng nhập
    @GetMapping
    public ResponseEntity<List<DiagramModel>> getAll(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        return ResponseEntity.ok(diagramService.getMyDiagrams(token));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiagramModel> getById(@PathVariable String id) {
        return ResponseEntity.ok(diagramService.getDiagramById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        diagramService.deleteDiagram(id);
        return ResponseEntity.noContent().build();
    }
}