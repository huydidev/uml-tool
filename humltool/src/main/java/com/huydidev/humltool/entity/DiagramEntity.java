package com.huydidev.humltool.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "diagrams")
public class DiagramEntity {
    @Id
    private String id;
    private String title;
    private String author;
    private Object content; // Chứa { nodes: [], edges: [] }

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}