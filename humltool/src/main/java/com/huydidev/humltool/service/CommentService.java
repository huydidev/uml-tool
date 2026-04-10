// src/main/java/com/huydidev/humltool/service/CommentService.java

package com.huydidev.humltool.service;

import com.huydidev.humltool.dto.request.CommentRequest;
import com.huydidev.humltool.dto.response.CommentResponse;

import java.util.List;

public interface CommentService {

    // Thêm comment hoặc reply
    CommentResponse addComment(String diagramId, CommentRequest request, String token);

    // Lấy tất cả comment của diagram (có replies lồng vào)
    List<CommentResponse> getComments(String diagramId, String token);

    // Lấy comment của 1 node
    List<CommentResponse> getNodeComments(String diagramId, String nodeId, String token);

    // Resolve comment
    CommentResponse resolveComment(String commentId, String token);

    // Xóa comment — chỉ owner comment hoặc diagram owner
    void deleteComment(String commentId, String token);
}