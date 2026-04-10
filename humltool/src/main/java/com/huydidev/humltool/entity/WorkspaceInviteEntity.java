// src/main/java/com/huydidev/humltool/entity/WorkspaceInviteEntity.java

package com.huydidev.humltool.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "workspace_invites")
public class WorkspaceInviteEntity {

    @Id
    private String id;

    @Indexed
    private String workspaceId;

    private String invitedEmail;
    private String invitedBy;

    // PENDING | ACCEPTED | REJECTED
    private String status = "PENDING";

    private LocalDateTime createdAt = LocalDateTime.now();
}