// src/main/java/com/huydidev/humltool/dto/response/GradeResponse.java

package com.huydidev.humltool.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeResponse {

    private String id;
    private String workspaceId;
    private String diagramId;
    private String diagramTitle;

    private String studentId;
    private String studentName;

    private String teacherId;
    private String teacherName;

    private String score;
    private String feedback;

    private LocalDateTime gradedAt;
    private LocalDateTime updatedAt;
}