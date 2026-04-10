// src/main/java/com/huydidev/humltool/dto/request/GradeRequest.java

package com.huydidev.humltool.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GradeRequest {

    @NotBlank(message = "DiagramId không được để trống")
    private String diagramId;

    @NotBlank(message = "StudentId không được để trống")
    private String studentId;

    // Nhập tự do: "8.5", "A+", "Đạt"...
    private String score;

    private String feedback;
}