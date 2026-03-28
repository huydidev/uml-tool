package com.huydidev.humltool.controller;

import com.huydidev.humltool.dto.request.ShareRequest;
import com.huydidev.humltool.model.ShareModel;
import com.huydidev.humltool.service.SharedAccessService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/share")
public class ShareController {
    @Autowired private SharedAccessService sharedAccessService;

    @PostMapping("/{diagramId}")
    public ResponseEntity<?> share(
            @PathVariable String diagramId,
            @RequestBody @Valid ShareRequest request,
            @RequestHeader("Authorization") String authHeader
    ){
        String token = authHeader.substring(7);
        ShareModel result = sharedAccessService.shareDiagram(diagramId, token, request.getUserId(), request.getRole());
        return ResponseEntity.ok(Map.of(
                "message", "Đã chia sẻ thành công cho " + request.getUserId(),
                "data", result
        ));
    }

    @GetMapping("/{diagramId}/users")
    public ResponseEntity<List<ShareModel>> getSharedUsers(@PathVariable String diagramId) {
        return ResponseEntity.ok(sharedAccessService.getSharedUsers(diagramId));
    }
}
