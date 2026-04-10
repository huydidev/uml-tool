// src/main/java/com/huydidev/humltool/dto/request/ApproveMemberRequest.java

package com.huydidev.humltool.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ApproveMemberRequest {

    @NotBlank
    private String userId;

    // ACTIVE | REJECTED
    @Pattern(regexp = "ACTIVE|REJECTED",
            message = "Action phải là ACTIVE hoặc REJECTED")
    private String action;
}