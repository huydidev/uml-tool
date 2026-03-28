package com.huydidev.humltool.controller;


import com.huydidev.humltool.model.DiagramModel;
import com.huydidev.humltool.model.VersionModel;
import com.huydidev.humltool.service.DiagramVersionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/versions")
public class DiagramVersionController {

    @Autowired
    private DiagramVersionService versionService;

    @PostMapping("/save/{diagramId}")
    public ResponseEntity<?> createVersion(
            @PathVariable String diagramId,
            @RequestParam(required = false) String label,
            HttpServletRequest request
    ){
        String headerAuth = request.getHeader("Authorization");
        if(headerAuth == null || !headerAuth.startsWith("Bearer ")){
            return ResponseEntity.status(401).body("Bạn cần login để lưu version");
        }
        String token = headerAuth.substring(7);

        try{
            VersionModel savedVersion = versionService.saveVersion(diagramId, label, token);
            return ResponseEntity.ok(savedVersion);
        }catch (Exception e){
            return ResponseEntity.badRequest().body("Lỗi lưu version: " + e.getMessage());
        }
    }

    @GetMapping("/history/{diagramId}")
    public ResponseEntity<List<VersionModel>> getHistory(@PathVariable String diagramId){
        return ResponseEntity.ok(versionService.getHistory(diagramId));

    }
}
