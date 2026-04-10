// src/main/java/com/huydidev/humltool/dto/request/UpdateWorkspaceRequest.java

package com.huydidev.humltool.dto.request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateWorkspaceRequest {

    private String name;
    private String description;

    // Settings — chỉ update field nào có giá trị
    private String gradeVisible;        // SELF_ONLY | ALL
    private Boolean allowStudentShare;
    private Boolean requireApproval;
    private Boolean allowMemberInvite;
    private LocalDateTime deadline;
    private boolean updateDeadline = false;
}