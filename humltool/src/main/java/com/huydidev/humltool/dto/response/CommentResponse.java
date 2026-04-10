// src/main/java/com/huydidev/humltool/dto/response/CommentResponse.java

package com.huydidev.humltool.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {

    private String id;
    private String diagramId;
    private String nodeId;
    private String userId;
    private String userName;
    private String content;
    private String parentId;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Replies lồng vào
    private List<CommentResponse> replies;
}