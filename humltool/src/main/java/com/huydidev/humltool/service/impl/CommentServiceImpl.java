// src/main/java/com/huydidev/humltool/service/impl/CommentServiceImpl.java

package com.huydidev.humltool.service.impl;

import com.huydidev.humltool.config.JwtUtils;
import com.huydidev.humltool.dto.request.CommentRequest;
import com.huydidev.humltool.dto.response.CommentResponse;
import com.huydidev.humltool.entity.CommentEntity;
import com.huydidev.humltool.exceptions.ResourceNotFoundException;
import com.huydidev.humltool.repository.CommentRepository;
import com.huydidev.humltool.repository.DiagramRepository;
import com.huydidev.humltool.repository.UserRepository;
import com.huydidev.humltool.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentServiceImpl implements CommentService {

    @Autowired private CommentRepository  commentRepository;
    @Autowired private DiagramRepository  diagramRepository;
    @Autowired private UserRepository     userRepository;
    @Autowired private JwtUtils           jwtUtils;

    // ── Thêm comment ──────────────────────────────────────────────
    @Override
    public CommentResponse addComment(
            String diagramId, CommentRequest request, String token) {

        String userId = jwtUtils.getUserNameFromJwtToken(token);

        // Check diagram tồn tại
        diagramRepository.findById(diagramId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy diagram"));

        String userName = userRepository.findByEmail(userId)
                .map(u -> u.getName() != null ? u.getName() : u.getEmail())
                .orElse(userId);

        CommentEntity comment = new CommentEntity();
        comment.setDiagramId(diagramId);
        comment.setNodeId(request.getNodeId());
        comment.setUserId(userId);
        comment.setUserName(userName);
        comment.setContent(request.getContent());
        comment.setParentId(request.getParentId());
        comment.setStatus("OPEN");

        return mapToResponse(commentRepository.save(comment), List.of());
    }

    // ── Lấy tất cả comment của diagram ───────────────────────────
    @Override
    public List<CommentResponse> getComments(String diagramId, String token) {
        jwtUtils.getUserNameFromJwtToken(token); // verify token

        // Lấy comment gốc
        List<CommentEntity> roots = commentRepository
                .findByDiagramIdAndParentIdIsNullOrderByCreatedAtDesc(diagramId);

        return roots.stream()
                .map(root -> {
                    // Lấy replies của từng comment gốc
                    List<CommentResponse> replies = commentRepository
                            .findByParentIdOrderByCreatedAtAsc(root.getId())
                            .stream()
                            .map(r -> mapToResponse(r, List.of()))
                            .collect(Collectors.toList());
                    return mapToResponse(root, replies);
                })
                .collect(Collectors.toList());
    }

    // ── Lấy comment của 1 node ────────────────────────────────────
    @Override
    public List<CommentResponse> getNodeComments(
            String diagramId, String nodeId, String token) {

        jwtUtils.getUserNameFromJwtToken(token);

        return commentRepository
                .findByDiagramIdAndNodeIdOrderByCreatedAtAsc(diagramId, nodeId)
                .stream()
                .map(c -> {
                    List<CommentResponse> replies = commentRepository
                            .findByParentIdOrderByCreatedAtAsc(c.getId())
                            .stream()
                            .map(r -> mapToResponse(r, List.of()))
                            .collect(Collectors.toList());
                    return mapToResponse(c, replies);
                })
                .collect(Collectors.toList());
    }

    // ── Resolve comment ───────────────────────────────────────────
    @Override
    public CommentResponse resolveComment(String commentId, String token) {
        String userId = jwtUtils.getUserNameFromJwtToken(token);

        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy comment"));

        comment.setStatus("RESOLVED");
        comment.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(commentRepository.save(comment), List.of());
    }

    // ── Xóa comment ───────────────────────────────────────────────
    @Override
    public void deleteComment(String commentId, String token) {
        String userId = jwtUtils.getUserNameFromJwtToken(token);

        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy comment"));

        // Chỉ owner comment mới xóa được
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("FORBIDDEN");
        }

        // Xóa cả replies
        commentRepository.findByParentIdOrderByCreatedAtAsc(commentId)
                .forEach(commentRepository::delete);

        commentRepository.delete(comment);
    }

    // ── Map entity → response ─────────────────────────────────────
    private CommentResponse mapToResponse(
            CommentEntity entity, List<CommentResponse> replies) {

        return CommentResponse.builder()
                .id(entity.getId())
                .diagramId(entity.getDiagramId())
                .nodeId(entity.getNodeId())
                .userId(entity.getUserId())
                .userName(entity.getUserName())
                .content(entity.getContent())
                .parentId(entity.getParentId())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .replies(replies)
                .build();
    }
}