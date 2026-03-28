package com.huydidev.humltool.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Document(collection = "diagrams")
public class DiagramEntity {
    @Id
    private String id;
    @Indexed
    private String ownerId;

    private String title;
    private String description;
    private  boolean isPublic = false;
    @Indexed(unique = true, sparse = true)
    private String shareToken;
    private List<NodeData> nodes;
    private List<EdgeData> edges;

    @Data
    public static class NodeData{
        private String id;
        private String type;
        private String label;
        private Double x, y, width, height;
        private List<Map<String, Object>> attributes;
    }

    @Data
    public static class EdgeData{
        private String id;
        private String from;
        private String to;
        private String label;
        private String cardinality;
        private List<Map<String, Double>> points;
    }

    private LocalDateTime createdAt = LocalDateTime.now();

    @Indexed
    private LocalDateTime updatedAt = LocalDateTime.now();
}