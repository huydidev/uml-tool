// src/main/java/com/huydidev/humltool/entity/GradeEntity.java

package com.huydidev.humltool.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "grades")
@CompoundIndex(name = "diagram_student_idx",
        def = "{'diagramId': 1, 'studentId': 1}",
        unique = true)
public class GradeEntity {

    @Id
    private String id;

    @Indexed
    private String workspaceId;

    @Indexed
    private String diagramId;

    private String studentId;
    private String teacherId;

    // Nhập tự do: "8.5", "A+", "Đạt"...
    private String score;
    private String feedback;

    private LocalDateTime gradedAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}