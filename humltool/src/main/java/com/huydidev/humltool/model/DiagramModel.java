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

    private List<DiagramEntity.NodeData> nodes;
    private List<DiagramEntity.EdgeData> edges;

    private boolean isPublic;
    private String shareToken;
    //khoong can bo cai update va crate vao
}