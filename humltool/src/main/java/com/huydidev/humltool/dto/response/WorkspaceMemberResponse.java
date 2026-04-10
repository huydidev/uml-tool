// src/main/java/com/huydidev/humltool/dto/response/WorkspaceMemberResponse.java

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
public class WorkspaceMemberResponse {

    private String userId;
    private String userName;
    private String role;
    private String status;
    private LocalDateTime joinedAt;

    // Stats cho CLASSROOM
    private long diagramCount;
    private boolean hasGrade;
}