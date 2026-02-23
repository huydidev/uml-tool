package com.huydidev.humltool.controller;

import com.huydidev.humltool.model.DiagramModel;
import com.huydidev.humltool.service.DiagramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diagrams")
@CrossOrigin(origins = "http://localhost:5173") // Cho phép React (Vite) gọi API
public class DiagramController {

    @Autowired
    private DiagramService diagramService; // Inject Interface

    @PostMapping("/save")
    public ResponseEntity<DiagramModel> saveDiagram(@RequestBody DiagramModel model) {
        return ResponseEntity.ok(diagramService.saveDiagram(model));
    }

    @GetMapping("/all")
    public ResponseEntity<List<DiagramModel>> getAllDiagrams() {
        return ResponseEntity.ok(diagramService.getAllDiagrams());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiagramModel> getById(@PathVariable String id) {
        return ResponseEntity.ok(diagramService.getDiagramById(id));
    }
}