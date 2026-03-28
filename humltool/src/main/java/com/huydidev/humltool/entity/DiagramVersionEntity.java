package com.huydidev.humltool.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Document(collection = "diagram_version")
@CompoundIndex(name = "diagram_version_idx", def = "{'diagramId':1, 'versionNum':-1}")
public class DiagramVersionEntity {
    @Id
    private String id;

    private String diagramId;
    private Integer versionNum;

    private Map<String, Object> snapshot;

    private String savedBy;
    private LocalDateTime savedAt = LocalDateTime.now();
    private String label;
}
