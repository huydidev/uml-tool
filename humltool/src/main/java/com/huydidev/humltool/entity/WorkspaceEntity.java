// src/main/java/com/huydidev/humltool/entity/WorkspaceEntity.java

package com.huydidev.humltool.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "workspaces")
public class WorkspaceEntity {

    @Id
    private String id;

    private String name;
    private String description;

    // TEAM | CLASSROOM
    private String type;

    @Indexed
    private String ownerId;

    // Invite link code — random 8 ký tự
    @Indexed(unique = true, sparse = true)
    private String inviteCode;

    private WorkspaceSettings settings;
    private LocalDateTime deadline;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Data
    public static class WorkspaceSettings {
        // CLASSROOM only
        // SELF_ONLY | ALL
        private String gradeVisible = "SELF_ONLY";
        private boolean allowStudentShare = false;
        private boolean requireApproval = true;

        // TEAM only
        private boolean allowMemberInvite = false;

    }
}