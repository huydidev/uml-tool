package com.huydidev.humltool.model;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class DiagramModel {
    private String id;

    @NotBlank(message = "Title is required")
    private String title;

    private String author;
    private Object content;
    // Chúng ta không gửi createdAt/updatedAt ra FE nếu không cần thiết
}