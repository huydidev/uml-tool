// src/main/java/com/huydidev/humltool/entity/CommentEntity.java

package com.huydidev.humltool.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "comments")
public class CommentEntity {

    @Id
    private String id;

    // Diagram chứa comment
    @Indexed
    private String diagramId;

    // Node được comment — null nếu comment chung cho diagram
    @Indexed
    private String nodeId;

    // User viết comment
    private String userId;
    private String userName;

    private String content;

    // Reply — null nếu là comment gốc
    private String parentId;

    // OPEN | RESOLVED
    private String status = "OPEN";

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}