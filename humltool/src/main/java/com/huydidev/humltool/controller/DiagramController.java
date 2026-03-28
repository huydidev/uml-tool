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
@CrossOrigin(origins = "http://localhost:5173") // Cho phép React (Vite) gọi API
public class DiagramController {

    @Autowired
    private DiagramService diagramService; // Inject Interface

    @PostMapping
    public ResponseEntity<DiagramModel> create(
            @RequestBody @Valid DiagramModel model,
            @RequestHeader("Authorization") String authHeader) {
        model.setId(null); // Đảm bảo tạo mới
        String token = authHeader.substring(7);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(diagramService.saveDiagram(model, token));
    }

    // FE gọi khi thoát editor (đã có id)
    @PutMapping("/{id}")
    public ResponseEntity<DiagramModel> update(
            @PathVariable String id,
            @RequestBody @Valid DiagramModel model,
            @RequestHeader("Authorization") String authHeader) {
        model.setId(id);
        String token = authHeader.substring(7);
        return ResponseEntity.ok(diagramService.saveDiagram(model, token));
    }

    // Mở danh sách
    @GetMapping
    public ResponseEntity<List<DiagramModel>> getAll() {
        return ResponseEntity.ok(diagramService.getAllDiagrams());
    }

    // Mở một diagram cụ thể
    @GetMapping("/{id}")
    public ResponseEntity<DiagramModel> getById(@PathVariable String id) {
        return ResponseEntity.ok(diagramService.getDiagramById(id));
    }

    // Xóa
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        diagramService.deleteDiagram(id);
        return ResponseEntity.noContent().build();
    }

}