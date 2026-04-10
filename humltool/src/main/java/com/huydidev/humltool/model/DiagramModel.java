// src/main/java/com/huydidev/humltool/model/DiagramModel.java

package com.huydidev.humltool.model;

import com.huydidev.humltool.entity.DiagramEntity;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

@Data
public class DiagramModel {
    private String id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String ownerId;

    // null = personal, có giá trị = workspace diagram
    private String workspaceId;

    private List<DiagramEntity.NodeData> nodes;
    private List<DiagramEntity.EdgeData> edges;

    private boolean isPublic;
    private boolean isPrivate;
    private String shareToken;
}