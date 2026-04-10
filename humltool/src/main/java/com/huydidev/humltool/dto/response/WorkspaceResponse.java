// src/main/java/com/huydidev/humltool/dto/response/WorkspaceResponse.java

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
public class WorkspaceResponse {

    private String id;
    private String name;
    private String description;
    private String type;
    private String ownerId;
    private String inviteCode;

    // Role của user đang request trong workspace này
    private String myRole;

    // Settings
    private String gradeVisible;
    private boolean allowStudentShare;
    private boolean requireApproval;
    private boolean allowMemberInvite;

    // Stats
    private long memberCount;
    private long diagramCount;
    private LocalDateTime deadline;
    private boolean isLocked;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}