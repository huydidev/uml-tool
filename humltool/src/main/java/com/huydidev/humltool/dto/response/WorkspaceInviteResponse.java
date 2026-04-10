// src/main/java/com/huydidev/humltool/dto/response/WorkspaceInviteResponse.java

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
public class WorkspaceInviteResponse {

    private String id;
    private String workspaceId;
    private String workspaceName;
    private String invitedEmail;
    private String invitedBy;
    private String status;
    private LocalDateTime createdAt;
}