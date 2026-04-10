// src/main/java/com/huydidev/humltool/entity/WorkspaceMemberEntity.java

package com.huydidev.humltool.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "workspace_members")
@CompoundIndex(name = "workspace_user_idx",
        def = "{'workspaceId': 1, 'userId': 1}",
        unique = true)
public class WorkspaceMemberEntity {

    @Id
    private String id;

    private String workspaceId;

    // email của user
    private String userId;

    // OWNER | TEACHER | STUDENT | MEMBER
    private String role;

    // ACTIVE | PENDING
    private String status = "ACTIVE";

    private LocalDateTime joinedAt = LocalDateTime.now();
}