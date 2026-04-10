package com.huydidev.humltool.controller;

import com.huydidev.humltool.model.DiagramModel;
import com.huydidev.humltool.service.SharedWithMeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/share")
public class SharedWithMeController {

    @Autowired private SharedWithMeService sharedWithMeService;

    // Danh sách diagram người khác share cho mình
    @GetMapping("/received")
    public ResponseEntity<List<DiagramModel>> getSharedWithMe(
            @RequestHeader("Authorization") String authHeader
    ) {
        return ResponseEntity.ok(
                sharedWithMeService.getSharedWithMe(authHeader.substring(7))
        );
    }
}