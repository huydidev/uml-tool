// src/main/java/com/huydidev/humltool/controller/CommentController.java

package com.huydidev.humltool.controller;

import com.huydidev.humltool.dto.request.CommentRequest;
import com.huydidev.humltool.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/diagrams")
public class CommentController {

    @Autowired private CommentService commentService;

    // POST /api/diagrams/{id}/comments
    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(
            @PathVariable String id,
            @RequestBody @Valid CommentRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(commentService.addComment(
                            id, request, authHeader.substring(7)));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // GET /api/diagrams/{id}/comments
    @GetMapping("/{id}/comments")
    public ResponseEntity<?> getComments(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(
                commentService.getComments(
                        id, authHeader.substring(7)));
    }

    // GET /api/diagrams/{id}/comments/node/{nodeId}
    @GetMapping("/{id}/comments/node/{nodeId}")
    public ResponseEntity<?> getNodeComments(
            @PathVariable String id,
            @PathVariable String nodeId,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(
                commentService.getNodeComments(
                        id, nodeId, authHeader.substring(7)));
    }

    // PATCH /api/diagrams/{id}/comments/{commentId}/resolve
    @PatchMapping("/{id}/comments/{commentId}/resolve")
    public ResponseEntity<?> resolveComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            return ResponseEntity.ok(
                    commentService.resolveComment(
                            commentId, authHeader.substring(7)));
        } catch (RuntimeException e) {
            if ("FORBIDDEN".equals(e.getMessage())) {
                return ResponseEntity.status(403)
                        .body(Map.of("message", "Không có quyền"));
            }
            throw e;
        }
    }

    // DELETE /api/diagrams/{id}/comments/{commentId}
    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            commentService.deleteComment(
                    commentId, authHeader.substring(7));
            return ResponseEntity.ok(
                    Map.of("message", "Đã xóa comment"));
        } catch (RuntimeException e) {
            if ("FORBIDDEN".equals(e.getMessage())) {
                return ResponseEntity.status(403)
                        .body(Map.of("message", "Không có quyền xóa"));
            }
            throw e;
        }
    }
}